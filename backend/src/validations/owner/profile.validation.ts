import { z } from "zod";

export const setupOwnerProfileSchema = z.object({
  body: z.object({
    businessName: z.string().min(2, "Business name is required"),
    industry: z.string().min(2, "Industry is required"),
    companySize: z.string().min(1, "Company size is required"),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    description: z.string().min(10, "Description must be at least 10 characters long").max(2000, "Description cannot exceed 2000 characters"),
    location: z.string().min(2, "Location is required"),
  }),
});
