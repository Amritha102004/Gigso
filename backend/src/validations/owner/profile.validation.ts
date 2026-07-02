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

export const setupOwnerProfileSchema = z.object({
  body: z.object({
    name: validateName("Name"),
    phone: z.string()
      .trim()
      .regex(phoneRegex, "Phone must be a valid number (7–15 digits, optional + prefix)")
      .optional()
      .or(z.literal("")),
    profileImage: z.string().url("Profile image must be a valid URL").optional().or(z.literal("")),
    businessName: validateName("Business name"),
    industry: validateName("Industry"),
    companySize: z.string()
      .trim()
      .min(1, "Company size is required")
      .refine((val) => hasAlphanumericRegex.test(val), "Company size must contain at least one letter or digit"),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    description: validateText("Description", 10, 2000),
    location: validateText("Location", 2),
  }),
});
