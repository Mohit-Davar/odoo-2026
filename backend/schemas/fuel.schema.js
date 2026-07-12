import { z } from 'zod';

/**
 * Schema for creating a new fuel log.
 */
export const createFuelLogSchema = z.object({
    vehicleId: z.number().int().positive(),
    tripId: z.number().int().positive().optional(),
    fuelDate: z.coerce.date(),
    litres: z.number().positive(),
    totalCost: z.number().positive(),
});

/**
 * Schema for updating a fuel log. All fields are optional.
 */
export const updateFuelLogSchema = createFuelLogSchema.partial();
