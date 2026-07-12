import { z } from 'zod';

/**
 * Schema for analytics report endpoints.
 * Validates an optional 'format' query parameter.
 */
export const reportFormatSchema = z.object({
  format: z.enum(['csv', 'pdf']).optional(),
});