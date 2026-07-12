import { z } from 'zod';

/**
 * Schema for dashboard endpoints.
 * Validates an optional 'limit' query parameter.
 */
export const dashboardQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional(),
});