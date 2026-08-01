import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  display_name: z.string().optional().nullable(),
  phone: z
    .string()
    .regex(/^\+91\d{10}$/, 'Phone must be in format +91XXXXXXXXXX')
    .optional()
    .nullable()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
    .refine(
      (val) => !['admin', 'root', 'support', 'help', 'host', 'users', 'login', 'signup', 'settings', 'notifications', 'messages', 'profile', 'api'].includes(val ?? ''),
      'This username is reserved'
    )
    .optional()
    .nullable(),
  timezone: z.string().optional().nullable(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
