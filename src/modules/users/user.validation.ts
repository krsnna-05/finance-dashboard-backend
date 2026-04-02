import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z.string().uuid("Invalid user id"),
});

export const listUsersQuerySchema = z.object({
  email: z.string().trim().optional(),
  search: z.string().trim().optional(),
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a valid number")
    .transform((value) => Number(value))
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a valid number")
    .transform((value) => Number(value))
    .optional(),
});

export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]).optional(),
  isActive: z.boolean().optional(),
});

export const updateUserSchema = z
  .object({
    email: z.string().email("Invalid email format").optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .optional(),
    role: z.enum(["ADMIN", "ANALYST", "VIEWER"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });
