import { z } from "zod";

export const setupWorkerProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().optional().or(z.literal("")),
    profileImage: z.string().optional().or(z.literal("")),
    skills: z.array(z.string()).min(1, "At least one skill is required"),
    portfolio: z.array(z.string().url("Must be a valid URL")).optional(),
    age: z.number().min(18, "Must be at least 18 years old"),
    bio: z.string().min(10, "Bio must be at least 10 characters long").max(1000, "Bio cannot exceed 1000 characters").optional().or(z.literal("")),
    location: z.string().min(2, "Location is required"),
  }),
});
