import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  display_name: z.string().optional().nullable(),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female']).optional().nullable().or(z.literal('')),
  occupation: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
