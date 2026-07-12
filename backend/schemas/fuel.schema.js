import { z } from 'zod';

/**
 * Schema for registering a new fuel log.
 */
export const createFuelLogSchema = z.object({
    vehicleId: z.coerce.number().int().positive("Vehicle ID must be a positive integer."),
    tripId: z.coerce.number().int().positive().optional().nullable(),
    fuelDate: z.coerce.date({ message: "Invalid date format for fuel date." }),
    litres: z.number().positive("Litres must be greater than 0."),
    totalCost: z.number().min(0, "Total cost cannot be negative.")
});
