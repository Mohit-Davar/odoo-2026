import { z } from 'zod';

/**
 * Schema for resending OTP.
 * Validates email and purpose in the request body.
 */
export const resendOtpSchema = z.object({
  email: z.email({ message: 'Invalid email address.' }),
  purpose: z.enum(['login', 'register'], { required_error: 'Purpose is required.' }),
});

/**
 * Schema for user registration.
 * Validates name, email, and password.
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

/**
 * Schema for OTP verification.
 * Validates email and a 6-digit OTP.
 */
export const verifyOtpSchema = z.object({
  email: z.email('Invalid email address.'),
  otp: z.string().length(6, 'OTP must be a 6-digit string.'),
});

/**
 * Schema for user login.
 * Validates email and password.
 */
export const loginSchema = z.object({
  email: z.email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

/**
 * Schema for getting OTP cooldown.
 * Validates email and purpose from query parameters.
 */
export const getOtpCooldownSchema = z.object({
  email: z.email({ message: 'Invalid email address.' }),
  purpose: z.enum(['login', 'register'], { required_error: 'Purpose is required.' }),
});
