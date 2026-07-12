import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { sendOtpEmail } from "../utils/mailer.js";
import { generateOtp , canSendOtp ,saveOtpToRedis , verifyOtpFromRedis } from "../utils/otp.js";
import { findUserByEmail, createUser, updateUser, findUserById, findUserByRefreshToken } from "../models/User.js";
import client from "../config/redis.js";

const generateAccessToken = (user)=>{
    return jwt.sign({
        id : user.id,
        email : user.email
    },process.env.JWT_SECRET,{expiresIn : "15m"});
}

const generateRefreshToken = (user)=>{
    return jwt.sign({
        id : user.id
    },process.env.REFRESH_TOKEN,{expiresIn : "7d"});
}

export const resendOtp = async(req , res)=>{
    try{
        const {email , purpose } = req.body;
        if(!email || !purpose){
            return res.status(400).json({
                msg : "Email and purpose are required"
            })
        }
        const check = await canSendOtp(email , purpose);
        if(!check.allowed){
            return res.status(429).json({
                msg : `Please wait ${check.wait} seconds before resending OTP. `
            });
        }

        const otp = generateOtp();
        await saveOtpToRedis(email , purpose , otp);
        await sendOtpEmail(email , otp , purpose === "login" ? "Login Verification" : "Account Verificaiton");
        res.json({msg : "OTP resent successfully"});
    }catch(error){
        res.status(500).json({
            msg : "Could not resend OTP"
        })
    }
}

// signUp stuff
export const register = async(req, res)=>{
    try{
        const {name , email , password } = req.body;
        const existingUser = await findUserByEmail(email);
        if(existingUser){
            return res.status(400).json({
                msg : "Emails already exists"
            })
        }
        const hashed = await bcrypt.hash(password , 10);
        await createUser({
            name, 
            email, 
            password : hashed, 
            verified : false
        });

        const otp = generateOtp();
        await saveOtpToRedis(email , "register" , otp);
        await sendOtpEmail(email , otp , "Account Verification");

        res.status(200).json({
            msg : "OTP sent to email. Please verify to activate account."
        })

    }catch(error){
        res.status(500).json({
            msg : error.message
        });
    }
}

export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const result = await verifyOtpFromRedis(email, "register", otp);
    if (!result.valid) return res.status(400).json({ msg: result.message });

    user.verified = true;
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    
    await updateUser(user.id, user);

    res.cookie("refreshToken",refreshToken,{
        httpOnly : true,
        secure : false,
        sameSite : "strict"
    });
    res.status(200).json({accessToken});
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const login = async(req, res)=>{
    try{
        const {email , password} = req.body;

        const user = await findUserByEmail(email);
        if(!user)return res.status(404).json({
            msg : "User not found"
        });

        const isMatch = await bcrypt.compare(password , user.password);
        if(!isMatch)return res.status(400).json({
            msg : "Invalid Credentials"
        });

        const otp = generateOtp();
        await saveOtpToRedis(email , "login",otp);
        await sendOtpEmail(email , otp , "Login Verification");

        res.json({
            msg : "OTP sent to mail successfully"
        })

    }catch(error){
        res.status(500).json({
            msg : error.message
        })
    }
}

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
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

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const refresh = async(req,res)=>{
    const {refreshToken} = req.cookies;
    if(!refreshToken) return res.status(401).json({
        msg : "No refresh token"
    });

    try{
        const decoded = jwt.verify(refreshToken , process.env.REFRESH_TOKEN);
        const user = await findUserById(decoded.id);
        if(!user || user.refreshToken !== refreshToken)return res.status(403).json({
            msg : "Invalid Refresh Token"
        });
        
        const newAccessToken = generateAccessToken(user);
        res.json({
            accessToken : newAccessToken
        });
    }catch(error){
        res.status(403).json({
            msg : "Token expired"
        })
    }
}

export const logout = async (req , res)=>{
    const {refreshToken} = req.cookies;
    if(!refreshToken)return res.sendStatus(204);

    const user = await findUserByRefreshToken(refreshToken);
    if(!user)return res.sendStatus(204);

    user.refreshToken = null;
    await updateUser(user.id, user);

    res.clearCookie("refreshToken");
    res.json({
        msg : "Logged Out Successfully"
    })
}


export const getOtpCooldown = async(req, res)=>{
    try{
        const {email , purpose } = req.query;
        if(!email || !purpose){
            return res.status(400).json({
                msg : "Email and purpose required"
            })
        }

        const ttl = await client.ttl(`cooldown:${purpose}:${email}`);
        const remaining = ttl > 0 ? ttl : 0;
        res.json({remaining});
    }catch(err){
        res.status(500).json({
            msg : "Failed to get cooldown"
        });
    }
}
