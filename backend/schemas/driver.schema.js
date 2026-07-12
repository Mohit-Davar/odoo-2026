import { z } from 'zod';

const driverStatusEnum = z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']);

/**
 * Schema for registering a new driver.
 */
export const registerDriverSchema = z.object({
    fullName: z.string().min(1, "Full name is required."),
    licenseNumber: z.string().min(1, "License number is required."),
    licenseCategory: z.string().min(1, "License category is required."),
    licenseExpiryDate: z.coerce.date({ message: "Invalid date format for license expiry." }),
    contactNumber: z.string().optional(),
    rating: z.number().min(0).max(100).optional(),
    status: driverStatusEnum.default('AVAILABLE'),
});

/**
 * Schema for updating a driver's details. All fields are optional.
 */
export const updateDriverSchema = registerDriverSchema.partial();
