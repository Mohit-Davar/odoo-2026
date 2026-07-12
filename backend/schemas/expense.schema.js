import { z } from 'zod';

export const expenseTypeEnum = z.enum(['TOLL', 'MAINTENANCE', 'OTHER']);

/**
 * Schema for logging a new transport expense.
 */
export const createExpenseSchema = z.object({
    tripId: z.coerce.number().int().positive().optional().nullable(),
    vehicleId: z.coerce.number().int().positive().optional().nullable(),
    expenseType: expenseTypeEnum,
    amount: z.number().min(0, "Expense amount cannot be negative."),
    expenseDate: z.coerce.date({ message: "Invalid date format for expense date." }),
    notes: z.string().optional().nullable()
});
