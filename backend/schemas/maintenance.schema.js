import { z } from 'zod';

const maintenanceStatusEnum = z.enum(['ACTIVE', 'COMPLETED']);

/**
 * Schema for registering a new maintenance log.
 */
export const registerMaintenanceSchema = z.object({
    vehicleId: z.coerce.number().int().positive("Vehicle ID must be a positive integer."),
    description: z.string().min(1, "Description is required."),
    cost: z.number().min(0, "Cost must be non-negative."),
    maintenanceDate: z.coerce.date({ message: "Invalid date format for maintenance date." }),
    status: maintenanceStatusEnum.default('ACTIVE'),
});

/**
 * Schema for updating a maintenance log's details. All fields are optional.
 */
export const updateMaintenanceSchema = registerMaintenanceSchema.partial();
