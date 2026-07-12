import { z } from 'zod';

const vehicleStatusEnum = z.enum(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']);

/**
 * Schema for registering a new vehicle.
 */
export const registerVehicleSchema = z.object({
    registrationNumber: z.string().min(1, "Registration number is required."),
    vehicleName: z.string().min(1, "Vehicle name is required."),
    vehicleType: z.string().min(1, "Vehicle type is required."),
    maxLoadCapacityKg: z.number().positive("Max load capacity must be a positive number."),
    odometerKm: z.number().nonnegative("Odometer reading must be a non-negative number.").optional(),
    acquisitionCost: z.number().nonnegative("Acquisition cost must be a non-negative number."),
    status: vehicleStatusEnum.default('AVAILABLE'),
});

/**
 * Schema for updating a vehicle's details. All fields are optional.
 */
export const updateVehicleSchema = registerVehicleSchema.partial();
