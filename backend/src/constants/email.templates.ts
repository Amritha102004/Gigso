import { ENV } from "../config/env.config";

export const EmailTemplates = {
  otp: (otp: string): { subject: string; html: string } => ({
    subject: "Your Gigso OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1f2937; margin-bottom: 8px;">Your Verification Code</h2>
        <p style="color: #6b7280; margin-bottom: 24px;">Use the code below to complete your request. It expires in <strong>${ENV.OTP_EXPIRY_MINUTES} minutes</strong>.</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; letter-spacing: 8px; font-size: 32px; font-weight: bold; color: #111827;">
          ${otp}
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">If you did not request this, you can safely ignore this email.</p>
        <p style="color: #9ca3af; font-size: 12px;">— The Gigso Team</p>
      </div>
    `,
  }),
};
