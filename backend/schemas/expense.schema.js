import { z } from 'zod';

const expenseTypeEnum = z.enum(['FUEL', 'MAINTENANCE', 'TOLL', 'OTHER']);

/**
 * Schema for creating a new expense.
 */
export const createExpenseSchema = z.object({
    amount: z.number().positive('Amount must be a positive number.'),
    notes: z.string().optional(),
    expenseType: expenseTypeEnum,
    expenseDate: z.coerce.date(),
    vehicleId: z.number().int().positive().optional(),
    tripId: z.number().int().positive().optional(),
});

/**
 * Schema for updating an expense. All fields are optional.
 */
export const updateExpenseSchema = createExpenseSchema.partial();
