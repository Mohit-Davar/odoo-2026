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
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; margin-top: 20px; background-color: #ffffff; border: 1px solid #dddddd;">
            <tr>
                <td align="center" style="padding: 40px 0 30px 0; background-color: #007bff; color: #ffffff;">
                    <h1 style="margin: 0;">OTP Verification</h1>
                </td>
            </tr>
            <tr>
                <td style="padding: 40px 30px 40px 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">Hi there,</p>
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">Your One-Time Password for ${purpose} is:</p>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                            <td align="center" style="padding: 15px; font-size: 24px; font-weight: bold; color: #333333; background-color: #f0f0f0; border-radius: 5px; letter-spacing: 2px;">
                                ${otp}
                            </td>
                        </tr>
                    </table>
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555555;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 30px; text-align: center; font-size: 12px; color: #888888; background-color: #f9f9f9;">
                    <p style="margin: 0;">This is an automated message. Please do not reply.</p>
                    <p style="margin: 0;">&copy; 2026 Fleet Management System. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
  await transporter.sendMail({
    from: `"Fleet Management System" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendLicenseExpiryNotification = async (to, drivers) => {
  const subject = "Driver License Expiry Alert";
  const driverListHtml = drivers.map(driver => {
    const daysRemaining = driver.days_remaining;
    let statusColor = '#ffc107'; // Yellow for warning
    let textColor = '#333';
    if (daysRemaining <= 7 && daysRemaining > 0) {
        statusColor = '#fd7e14'; // Orange for urgent
    } else if (daysRemaining <= 0) {
        statusColor = '#dc3545'; // Red for expired
        textColor = '#fff';
    }

    return `
      <tr>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee;">${driver.full_name}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee;">${driver.license_number}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee;">${new Date(driver.license_expiry_date).toLocaleDateString()}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; text-align: center;">
          <span style="background-color: ${statusColor}; color: ${textColor}; padding: 5px 12px; border-radius: 15px; font-size: 12px; font-weight: bold;">
            ${daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>License Expiry Alert</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; margin-top: 20px; background-color: #ffffff; border: 1px solid #dddddd;">
            <tr>
                <td align="center" style="padding: 40px 0 30px 0; background-color: #dc3545; color: #ffffff;">
                    <h1 style="margin: 0;">Urgent: License Expiry Alert</h1>
                </td>
            </tr>
            <tr>
                <td style="padding: 40px 30px 40px 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">Hello,</p>
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">The following driver licenses require your immediate attention. Please take the necessary action.</p>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="padding: 12px 15px; text-align: left; background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">Driver Name</th>
                                <th style="padding: 12px 15px; text-align: left; background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">License No.</th>
                                <th style="padding: 12px 15px; text-align: left; background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">Expires On</th>
                                <th style="padding: 12px 15px; text-align: center; background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${driverListHtml}
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 30px; text-align: center; font-size: 12px; color: #888888; background-color: #f9f9f9;">
                    <p style="margin: 0;">This is an automated notification. Please do not reply.</p>
                    <p style="margin: 0;">&copy; 2026 Fleet Management System. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Fleet Management System" <${process.env.SMTP_USER}>`,
    to: to.join(','), // Send to a comma-separated list of admins
    subject,
    html,
  });
};
