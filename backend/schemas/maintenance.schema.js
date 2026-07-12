import { z } from 'zod';

const maintenanceStatusEnum = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

/**
 * Schema for creating a new maintenance log.
 */
export const registerMaintenanceSchema = z.object({
    vehicleId: z.number().int().positive(),
    maintenanceType: z.string().min(1, "Maintenance type is required."),
    description: z.string().optional(),
    cost: z.number().nonnegative(),
    maintenanceDate: z.coerce.date(),
    status: maintenanceStatusEnum.default('SCHEDULED'),
});

/**
 * Schema for updating a maintenance log. All fields are optional.
 */
export const updateMaintenanceSchema = registerMaintenanceSchema.partial();