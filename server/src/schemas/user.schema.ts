import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string({ message: 'Email is required' })
      .trim()
      .email('Invalid email address format')
      .max(255, 'Email cannot exceed 255 characters'),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format. Must be a valid UUID'),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
