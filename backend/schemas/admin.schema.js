import { z } from 'zod';

/**
 * Schema for adding a new person (user).
 * Validates name, email, password, and an optional roleId.
 */
export const addPersonSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  roleId: z.number().int().positive().optional(),
});

/**
 * Schema for assigning a role to a user.
 * Validates roleId in the body and a numeric ID in params.
 */
export const assignRoleSchema = z.object({
  body: z.object({
    roleId: z.number().int().positive({ message: 'Role ID must be a positive integer.' }),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string."),
  }),
});
