import { z } from "zod";

const alphanumericRegex = /[\p{L}\p{N}]/u;

const validateString = (fieldName: string, minLength = 1) =>
  z.string()
    .trim()
    .min(minLength, `${fieldName} is required`)
    .refine((val) => alphanumericRegex.test(val), `${fieldName} must contain at least one letter or digit`);

export const setupWorkerProfileSchema = z.object({
  body: z.object({
    name: validateString("Name"),
    phone: z.string().optional().or(z.literal("")),
    profileImage: z.string().optional().or(z.literal("")),
    skills: z.array(z.string()).min(1, "At least one skill is required"),
    portfolio: z.array(z.string().url("Must be a valid URL")).optional(),
    age: z.number().min(18, "Must be at least 18 years old"),
    bio: z.string()
      .trim()
      .min(10, "Bio must be at least 10 characters long")
      .max(1000, "Bio cannot exceed 1000 characters")
      .refine((val) => alphanumericRegex.test(val), "Bio must contain at least one letter or digit")
      .optional()
      .or(z.literal("")),
    location: validateString("Location", 2),
  }),
});
