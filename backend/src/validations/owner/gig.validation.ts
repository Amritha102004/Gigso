import { z } from "zod";

const alphanumericRegex = /[\p{L}\p{N}]/u;

const validateString = (fieldName: string, minLength = 1) =>
  z.string()
    .trim()
    .min(minLength, `${fieldName} is required`)
    .refine((val) => alphanumericRegex.test(val), `${fieldName} must contain at least one letter or digit`);

const validateStringOptional = (fieldName: string, minLength = 1) =>
  z.string()
    .trim()
    .min(minLength, `${fieldName} is required`)
    .refine((val) => alphanumericRegex.test(val), `${fieldName} must contain at least one letter or digit`)
    .optional();

export const createGigSchema = z.object({
  body: z.object({
    title: validateString("Title"),
    description: validateString("Description"),
    categoryId: z.string().trim().min(1, "Category is required"),
    location: validateString("Location"),
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    startTime: validateString("Start time"),
    roles: z.array(
      z.object({
        roleName: validateString("Role name"),
        spots: z.number().min(1, "Spots must be at least 1"),
        payPerPerson: z.number().min(0, "Pay must be at least 0"),
      })
    ).min(1, "At least one role is required"),
    status: z.enum(["draft", "active"]).optional(),
  }),
});

export const updateGigSchema = z.object({
  body: z.object({
    title: validateStringOptional("Title"),
    description: validateStringOptional("Description"),
    categoryId: z.string().trim().min(1, "Category is required").optional(),
    location: validateStringOptional("Location"),
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format").optional(),
    startTime: validateStringOptional("Start time"),
    roles: z.array(
      z.object({
        roleName: validateString("Role name"),
        spots: z.number().min(1, "Spots must be at least 1"),
        payPerPerson: z.number().min(0, "Pay must be at least 0"),
      })
    ).min(1, "At least one role is required").optional(),
  }),
});
