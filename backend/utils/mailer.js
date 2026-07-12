import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOtpEmail = async (to, otp, purpose = "Account Verification") => {
  const subject = `Your OTP for ${purpose}`;
  const html = `
    <div style="font-family:sans-serif; padding:10px;">
      <h2>OTP Verification</h2>
      <p>Your OTP code is:</p>
      <h3 style="color:#0070f3;">${otp}</h3>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `;
  await transporter.sendMail({
    from: `"Auth System" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
