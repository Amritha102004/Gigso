import { z } from "zod";

const alphanumericRegex = /[\p{L}\p{N}]/u;

const validateString = (fieldName: string, minLength = 1) =>
  z.string()
    .trim()
    .min(minLength, `${fieldName} is required`)
    .refine((val) => alphanumericRegex.test(val), `${fieldName} must contain at least one letter or digit`);

export const setupOwnerProfileSchema = z.object({
  body: z.object({
    name: validateString("Name"),
    phone: z.string().optional().or(z.literal("")),
    profileImage: z.string().optional().or(z.literal("")),
    businessName: validateString("Business name", 2),
    industry: validateString("Industry", 2),
    companySize: z.string().trim().min(1, "Company size is required"),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    description: z.string()
      .trim()
      .min(10, "Description must be at least 10 characters long")
      .max(2000, "Description cannot exceed 2000 characters")
      .refine((val) => alphanumericRegex.test(val), "Description must contain at least one letter or digit"),
    location: validateString("Location", 2),
  }),
});
