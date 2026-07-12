import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "../utils/mailer.js";
import { generateOtp, canSendOtp, saveOtpToRedis, verifyOtpFromRedis } from "../utils/otp.js";
import { findUserByEmail, createUser, updateUser, findUserById, findUserByRefreshToken } from "../models/user.model.js";
import client from "../config/redis.js";
import { resendOtpSchema, registerSchema, verifyOtpSchema, loginSchema, getOtpCooldownSchema } from "../schemas/auth.schema.js";

const generateAccessToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email
    }, process.env.JWT_SECRET, { expiresIn: "15m" });
}

const generateRefreshToken = (user) => {
    return jwt.sign({
        id: user.id
    }, process.env.REFRESH_TOKEN, { expiresIn: "7d" });
}

/**
 * @typedef {import('zod').infer<typeof resendOtpSchema>} ResendOtpBody
 * @typedef {import('express').Request<{}, {}, ResendOtpBody>} ResendOtpRequest
 * @typedef {import('express').Response} ResendOtpResponse
 */

/**
 * Resends an OTP to the user's email for login or registration.
 * @param {ResendOtpRequest} req The Express request object, containing email and purpose in the body.
 * @param {ResendOtpResponse} res The Express response object.
 * @returns {Promise<void | ResendOtpResponse>}
 */
export const resendOtp = async (req, res) => {
    const validation = resendOtpSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { email, purpose } = validation.data;

    try {
        const check = await canSendOtp(email, purpose);
        if (!check.allowed) {
            return res.status(429).json({
                msg: `Please wait ${check.wait} seconds before resending OTP. `
            });
        }

        const otp = generateOtp();
        await saveOtpToRedis(email, purpose, otp);
        await sendOtpEmail(email, otp, purpose === "login" ? "Login Verification" : "Account Verificaiton");
        return res.json({ msg: "OTP resent successfully" });
    } catch (error) {
        return res.status(500).json({
            msg: "Could not resend OTP"
        })
    }
}

/**
 * @typedef {import('zod').infer<typeof registerSchema>} RegisterBody
 * @typedef {import('express').Request<{}, {}, RegisterBody>} RegisterRequest
 * @typedef {import('express').Response} RegisterResponse
 */

/**
 * Registers a new user, hashes their password, and sends a verification OTP.
 * @param {RegisterRequest} req The Express request object, containing name, email, and password in the body.
 * @param {RegisterResponse} res The Express response object.
 * @returns {Promise<void | RegisterResponse>}
 */
export const register = async (req, res) => {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { name, email, password } = validation.data;

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                msg: "Emails already exists"
            })
        }
        const hashed = await bcrypt.hash(password, 10);
        await createUser({
            name,
            email,
            password: hashed,
            verified: false
        });

        const otp = generateOtp();
        await saveOtpToRedis(email, "register", otp);
        await sendOtpEmail(email, otp, "Account Verification");

        return res.status(200).json({
            msg: "OTP sent to email. Please verify to activate account."
        })

    } catch (error) {
        return res.status(500).json({
            msg: error.message
        });
    }
}

/**
 * @typedef {import('zod').infer<typeof verifyOtpSchema>} VerifyOtpBody
 * @typedef {import('express').Request<{}, {}, VerifyOtpBody>} VerifyOtpRequest
 * @typedef {import('express').Response} VerifyOtpResponse
 */

/**
 * Verifies a registration OTP, marks the user as verified, and issues auth tokens.
 * @param {VerifyOtpRequest} req The Express request object, containing email and OTP in the body.
 * @param {VerifyOtpResponse} res The Express response object.
 * @returns {Promise<void | VerifyOtpResponse>}
 */
export const verifyRegisterOtp = async (req, res) => {
    const validation = verifyOtpSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { email, otp } = validation.data;

    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const result = await verifyOtpFromRedis(email, "register", otp);
        if (!result.valid) return res.status(400).json({ msg: result.message });

        user.verified = true;

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        user.refreshToken = refreshToken;

        await updateUser(user.id, user);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        });
        return res.status(200).json({ accessToken });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};

/**
 * @typedef {import('zod').infer<typeof loginSchema>} LoginBody
 * @typedef {import('express').Request<{}, {}, LoginBody>} LoginRequest
 * @typedef {import('express').Response} LoginResponse
 */

/**
 * Handles user login by checking credentials and sending a login OTP.
 * @param {LoginRequest} req The Express request object, containing email and password in the body.
 * @param {LoginResponse} res The Express response object.
 * @returns {Promise<void | LoginResponse>}
 */
export const login = async (req, res) => {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { email, password } = validation.data;

    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(404).json({
            msg: "User not found"
        });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({
            msg: "Invalid Credentials"
        });

        const otp = generateOtp();
        await saveOtpToRedis(email, "login", otp);
        await sendOtpEmail(email, otp, "Login Verification");

        return res.json({
            msg: "OTP sent to mail successfully"
        })

    } catch (error) {
        return res.status(500).json({
            msg: error.message
        })
    }
}

/**
 * Verifies a login OTP and issues authentication tokens.
 * @param {VerifyOtpRequest} req The Express request object, containing email and OTP in the body.
 * @param {VerifyOtpResponse} res The Express response object.
 * @returns {Promise<void | VerifyOtpResponse>}
 */
export const verifyLoginOtp = async (req, res) => {
    const validation = verifyOtpSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { email, otp } = validation.data;

    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const result = await verifyOtpFromRedis(email, "login", otp);
        if (!result.valid) return res.status(400).json({ msg: result.message });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await updateUser(user.id, user);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        });

        return res.json({ accessToken });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};

/**
 * @typedef {import('express').Request} RefreshRequest
 * @typedef {import('express').Response} RefreshResponse
 */

/**
 * Refreshes an access token using a valid refresh token from cookies.
 * @param {RefreshRequest} req The Express request object.
 * @param {RefreshResponse} res The Express response object.
 * @returns {Promise<void | RefreshResponse>}
 */
export const refresh = async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({
        msg: "No refresh token"
    });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
        const user = await findUserById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) return res.status(403).json({
            msg: "Invalid Refresh Token"
        });

        const newAccessToken = generateAccessToken(user);
        return res.json({
            accessToken: newAccessToken
        });
    } catch (error) {
        return res.status(403).json({
            msg: "Token expired"
        })
    }
}

/**
 * @typedef {import('express').Request} LogoutRequest
 * @typedef {import('express').Response} LogoutResponse
 */

/**
 * Logs a user out by clearing their refresh token from the database and the cookie.
 * @param {LogoutRequest} req The Express request object.
 * @param {LogoutResponse} res The Express response object.
 * @returns {Promise<void | LogoutResponse>}
 */
export const logout = async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.sendStatus(204);

    const user = await findUserByRefreshToken(refreshToken);
    if (!user) return res.sendStatus(204);

    user.refreshToken = null;
    await updateUser(user.id, user);

    res.clearCookie("refreshToken");
    return res.json({
        msg: "Logged Out Successfully"
    })
}

/**
 * @typedef {import('zod').infer<typeof getOtpCooldownSchema>} GetOtpCooldownQuery
 * @typedef {import('express').Request<{}, {}, {}, GetOtpCooldownQuery>} GetOtpCooldownRequest
 * @typedef {import('express').Response} GetOtpCooldownResponse
 */

/**
 * Gets the remaining cooldown time for sending an OTP.
 * @param {GetOtpCooldownRequest} req The Express request object, containing email and purpose in the query.
 * @param {GetOtpCooldownResponse} res The Express response object.
 * @returns {Promise<void | GetOtpCooldownResponse>}
 */
export const getOtpCooldown = async (req, res) => {
    const validation = getOtpCooldownSchema.safeParse(req.query);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { email, purpose } = validation.data;

    try {
        const ttl = await client.ttl(`cooldown:${purpose}:${email}`);
        const remaining = ttl > 0 ? ttl : 0;
        return res.json({ remaining });
    } catch (err) {
        return res.status(500).json({
            msg: "Failed to get cooldown"
        });
    }
}

