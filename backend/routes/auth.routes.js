import express from "express"

import { register, login, refresh, verifyLoginOtp, verifyRegisterOtp, logout, resendOtp, getOtpCooldown } from "../controllers/auth.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";
import { getProfile } from "../controllers/user.controller.js";
const router = express.Router();

router.post("/register", register);
router.post("/verify-register", verifyRegisterOtp);
router.post("/login", login);
router.post("/verify-login", verifyLoginOtp);
router.get("/refresh", refresh);
router.post("/resend-otp", resendOtp);
router.get("/otp-cooldown", getOtpCooldown);
router.post("/logout", logout);

router.get("/me", verifyAccessToken, getProfile);

export default router;
