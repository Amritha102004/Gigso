import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required").max(100),
    description: z.string().min(1, "Description is required").max(500),
    icon: z.string().min(1, "Icon is required"),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required").max(100).optional(),
    description: z.string().min(1, "Description is required").max(500).optional(),
    icon: z.string().min(1, "Icon is required").optional(),
  }),
});
