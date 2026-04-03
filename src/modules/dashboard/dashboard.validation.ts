import { z } from "zod";

export const dashboardSummaryQuerySchema = z.object({
  userId: z.string().uuid("Invalid user id").optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  months: z
    .string()
    .regex(/^\d+$/, "Months must be a valid number")
    .transform((value) => Number(value))
    .optional(),
});
