import { z } from "zod";

// Free-text fields: must contain at least one letter or digit (blocks "---", "   ")
const hasAlphanumericRegex = /[\p{L}\p{N}]/u;

// MongoDB ObjectId: 24-character hexadecimal string
const objectIdRegex = /^[a-f\d]{24}$/i;

// Time in HH:MM 24-hour format
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const validateText = (fieldName: string, minLength = 1, maxLength = 500) =>
  z.string()
    .trim()
    .min(minLength, `${fieldName} is required`)
    .max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
    .refine((val) => hasAlphanumericRegex.test(val), `${fieldName} must contain at least one letter or digit`);

const validateTextOptional = (fieldName: string, minLength = 1, maxLength = 500) =>
  z.string()
    .trim()
    .min(minLength, `${fieldName} is required`)
    .max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
    .refine((val) => hasAlphanumericRegex.test(val), `${fieldName} must contain at least one letter or digit`)
    .optional();

export const createGigSchema = z.object({
  body: z.object({
    title: validateText("Title", 3, 150),
    description: validateText("Description", 10, 3000),
    categoryId: z.string()
      .trim()
      .regex(objectIdRegex, "Invalid category ID"),
    location: validateText("Location", 2, 200),
    eventDate: z.string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
      .refine((val) => new Date(val) > new Date(), "Event date must be in the future"),
    startTime: z.string()
      .trim()
      .regex(timeRegex, "Start time must be in HH:MM format (e.g. 09:30 or 14:00)"),
    roles: z.array(
      z.object({
        roleName: validateText("Role name", 2, 100),
        spots: z.number()
          .int("Spots must be a whole number")
          .min(1, "Spots must be at least 1")
          .max(500, "Spots cannot exceed 500"),
        payPerPerson: z.number()
          .nonnegative("Pay cannot be negative")
          .max(1000000, "Pay per person cannot exceed 1,000,000"),
      })
    ).min(1, "At least one role is required"),
    status: z.enum(["draft", "active"]).optional(),
  }),
});

export const updateGigSchema = z.object({
  body: z.object({
    title: validateTextOptional("Title", 3, 150),
    description: validateTextOptional("Description", 10, 3000),
    categoryId: z.string()
      .trim()
      .regex(objectIdRegex, "Invalid category ID")
      .optional(),
    location: validateTextOptional("Location", 2, 200),
    eventDate: z.string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
      .refine((val) => new Date(val) > new Date(), "Event date must be in the future")
      .optional(),
    startTime: z.string()
      .trim()
      .regex(timeRegex, "Start time must be in HH:MM format (e.g. 09:30 or 14:00)")
      .optional(),
    roles: z.array(
      z.object({
        roleName: validateText("Role name", 2, 100),
        spots: z.number()
          .int("Spots must be a whole number")
          .min(1, "Spots must be at least 1")
          .max(500, "Spots cannot exceed 500"),
        payPerPerson: z.number()
          .nonnegative("Pay cannot be negative")
          .max(1000000, "Pay per person cannot exceed 1,000,000"),
      })
    ).min(1, "At least one role is required").optional(),
  }),
});
