import nodemailer from 'nodemailer';
import { ENV } from '../config/env.config';

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: ENV.NODEMAILER_EMAIL,
        pass: ENV.NODEMAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: ENV.NODEMAILER_EMAIL,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};
