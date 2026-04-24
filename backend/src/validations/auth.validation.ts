import { z } from "zod";

const passwordSchema = z.string().min(8, "Password must be at least 8 characters long")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*]/, "Password must contain at least one special character");

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
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
    otp: z.union([z.string(), z.number()]),
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
    otp: z.union([z.string(), z.number()]),
    newPassword: passwordSchema,
  }),
});
