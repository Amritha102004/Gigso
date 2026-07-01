import { z } from "zod";

const alphanumericRegex = /[\p{L}\p{N}]/u;

const validateString = (fieldName: string, minLength = 1, maxLength = 500) =>
  z.string()
    .trim()
    .min(minLength, `${fieldName} is required`)
    .max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
    .refine((val) => alphanumericRegex.test(val), `${fieldName} must contain at least one letter or digit`);

const validateStringOptional = (fieldName: string, minLength = 1, maxLength = 500) =>
  z.string()
    .trim()
    .min(minLength, `${fieldName} is required`)
    .max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
    .refine((val) => alphanumericRegex.test(val), `${fieldName} must contain at least one letter or digit`)
    .optional();

export const createCategorySchema = z.object({
  body: z.object({
    name: validateString("Category name", 1, 100),
    description: validateString("Description", 1, 500),
    icon: z.string().trim().min(1, "Icon is required"),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: validateStringOptional("Category name", 1, 100),
    description: validateStringOptional("Description", 1, 500),
    icon: z.string().trim().min(1, "Icon is required").optional(),
  }),
});
