import { z } from "zod";

// Validates name-type fields: only letters, spaces, hyphens, apostrophes, dots
const nameRegex = /^[\p{L}\s'\-.]+$/u;

// Validates free-text fields: must contain at least one letter or digit (blocks "---", "   ")
const hasAlphanumericRegex = /[\p{L}\p{N}]/u;

const validateName = (fieldName: string, minLength = 2) =>
  z.string()
    .trim()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(100, `${fieldName} cannot exceed 100 characters`)
    .regex(nameRegex, `${fieldName} can only contain letters, spaces, hyphens, or apostrophes`);

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[!@#$%^&*]/, "Password must contain at least one special character");

const otpSchema = z.union([
  z.string().trim().min(4, "OTP must be at least 4 digits").max(8, "OTP cannot exceed 8 digits"),
  z.number().int().gte(1000, "OTP must be at least 4 digits").lte(99999999, "OTP cannot exceed 8 digits"),
]);

export const signupSchema = z.object({
  body: z.object({
    name: validateName("Name"),
    email: z.string().email("Invalid email format"),
    password: passwordSchema,
    role: z.enum(["owner", "worker"] as const, { message: "Role must be either 'owner' or 'worker'" }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    otp: otpSchema,
    type: z.enum(["registration", "password-reset"]),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    type: z.enum(["registration", "password-reset"]),
  }),
});

export const googleLoginSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Google token is required"),
    role: z.enum(["owner", "worker"]).optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    otp: otpSchema,
    newPassword: passwordSchema,
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: passwordSchema,
  }),
});
