import crypto from "crypto";
import client from "../config/redis.js";

const OTP_EXPIRY_SECONDS = 10 * 60;
const OTP_RESEND_COOLDOWN = 60;

export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const getOtpKey = (email, purpose) => `otp:${purpose}:${email}`;
const cooldownKey = (email, purpose) => `cooldown:${purpose}:${email}`;

export const saveOtpToRedis = async (email, purpose, otp) => {
    const key = getOtpKey(email, purpose);
    const hash = crypto.createHash("sha256").update(otp).digest("hex");
    await client.hSet(key, { otpHash: hash, attempts: 0 });
    await client.expire(key, OTP_EXPIRY_SECONDS);
    await client.setEx(cooldownKey(email, purpose), OTP_RESEND_COOLDOWN, "1");
};

export const canSendOtp = async (email, purpose) => {
    const key = cooldownKey(email, purpose);
    const ttl = await client.ttl(key);
    if (ttl > 0) {
        return { allowed: false, wait: ttl }
    }
    return { allowed: true }
}

export const verifyOtpFromRedis = async (email, purpose, otp) => {
    const key = getOtpKey(email, purpose);
    const data = await client.hGetAll(key);
    if (!data || !data.otpHash) return { valid: false, msg: "OTP expired" };

    const attempts = Number(data.attempts || 0);
    if (attempts >= 5) return { valid: false, msg: "Too many attempts" };

    const hash = crypto.createHash("sha256").update(otp).digest("hex");
    if (hash !== data.otpHash) {
        await client.hIncrBy(key, "attempts", 1);
        return { valid: false, msg: "Invalid OTP" };
    }

    await client.del(key);
    return { valid: true };
}