import { z } from "zod";

// Name fields: only letters, spaces, hyphens, apostrophes, dots — no numbers
const nameRegex = /^[\p{L}\s'\-.]+$/u;

// Free-text fields: must contain at least one letter or digit (blocks "---", "   ")
const hasAlphanumericRegex = /[\p{L}\p{N}]/u;

// Phone: optional E.164-style — starts with optional +, then 7-15 digits
const phoneRegex = /^\+?[1-9]\d{6,14}$/;

const validateName = (fieldName: string, minLength = 2) =>
  z.string()
    .trim()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(100, `${fieldName} cannot exceed 100 characters`)
    .regex(nameRegex, `${fieldName} can only contain letters, spaces, hyphens, or apostrophes`);

const validateText = (fieldName: string, minLength = 1, maxLength = 500) =>
  z.string()
    .trim()
    .min(minLength, `${fieldName} is required`)
    .max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
    .refine((val) => hasAlphanumericRegex.test(val), `${fieldName} must contain at least one letter or digit`);

export const setupWorkerProfileSchema = z.object({
  body: z.object({
    name: validateName("Name"),
    phone: z.string()
      .trim()
      .regex(phoneRegex, "Phone must be a valid number (7–15 digits, optional + prefix)")
      .optional()
      .or(z.literal("")),
    profileImage: z.string().url("Profile image must be a valid URL").optional().or(z.literal("")),
    skills: z.array(
      z.string()
        .trim()
        .min(1, "Skill cannot be empty")
        .max(50, "Skill cannot exceed 50 characters")
        .regex(nameRegex, "Each skill must contain only letters, spaces, hyphens, or apostrophes")
    ).min(1, "At least one skill is required"),
    portfolio: z.array(z.string().url("Must be a valid URL")).optional(),
    age: z.number()
      .int("Age must be a whole number")
      .min(18, "Must be at least 18 years old")
      .max(80, "Age cannot exceed 80"),
    bio: validateText("Bio", 10, 1000),
    location: validateText("Location", 2),
  }),
});
