import { z } from 'zod';

/**
 * Schema for validating a numeric ID in request parameters.
 */
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a positive integer."),
});
