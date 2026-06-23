import { z } from "zod";

export const createGigSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    categoryId: z.string().min(1, "Category is required"),
    location: z.string().min(1, "Location is required"),
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    startTime: z.string().min(1, "Start time is required"),
    roles: z.array(
      z.object({
        roleName: z.string().min(1, "Role name is required"),
        spots: z.number().min(1, "Spots must be at least 1"),
        payPerPerson: z.number().min(0, "Pay must be at least 0"),
      })
    ).min(1, "At least one role is required"),
    status: z.enum(["draft", "active"]).optional(),
  }),
});

export const updateGigSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    categoryId: z.string().min(1, "Category is required").optional(),
    location: z.string().min(1, "Location is required").optional(),
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format").optional(),
    startTime: z.string().min(1, "Start time is required").optional(),
    roles: z.array(
      z.object({
        roleName: z.string().min(1, "Role name is required"),
        spots: z.number().min(1, "Spots must be at least 1"),
        payPerPerson: z.number().min(0, "Pay must be at least 0"),
      })
    ).min(1, "At least one role is required").optional(),
  }),
});
