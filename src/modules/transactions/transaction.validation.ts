import { z } from "zod";

const transactionTypeSchema = z.enum(["income", "expense"]);

export const transactionIdParamSchema = z.object({
  id: z.string().uuid("Invalid transaction id"),
});

export const createTransactionSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  type: transactionTypeSchema,
  category: z.string().min(1, "Category is required").max(100),
  date: z.coerce.date(),
  note: z.string().max(500).optional(),
  userId: z.string().uuid("Invalid user id"),
});

export const updateTransactionSchema = z
  .object({
    amount: z.number().positive("Amount must be greater than zero").optional(),
    type: transactionTypeSchema.optional(),
    category: z.string().min(1, "Category is required").max(100).optional(),
    date: z.coerce.date().optional(),
    note: z.string().max(500).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update",
  });

export const listTransactionsQuerySchema = z.object({
  userId: z.string().uuid("Invalid user id").optional(),
  type: transactionTypeSchema.optional(),
  category: z.string().trim().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
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
