import { z } from 'zod';

/**
 * Schema for creating a draft trip.
 */
export const createDraftTripSchema = z.object({
    source: z.string().min(1, "Source is required."),
    destination: z.string().min(1, "Destination is required."),
    vehicleId: z.number().int().positive(),
    driverId: z.number().int().positive(),
    cargoWeightKg: z.number().positive("Cargo weight must be a positive number."),
    plannedDistanceKm: z.number().positive("Planned distance must be a positive number."),
});

/**
 * Schema for completing a trip.
 */
export const completeTripSchema = z.object({
    endOdometerKm: z.number().nonnegative("Odometer reading must be a non-negative number.").optional(),
});
