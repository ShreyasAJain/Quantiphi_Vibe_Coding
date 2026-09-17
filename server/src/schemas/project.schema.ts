import { z } from 'zod';
import { ProjectRole } from '@prisma/client';

export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Project name is required' })
      .trim()
      .min(2, 'Project name must be at least 2 characters long')
      .max(150, 'Project name cannot exceed 150 characters'),
    description: z
      .string()
      .trim()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),
  }),
});

export const projectIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format. Must be a valid UUID'),
  }),
});

export const addProjectMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format. Must be a valid UUID'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID format. Must be a valid UUID'),
    role: z.enum([ProjectRole.OWNER, ProjectRole.MEMBER]).default(ProjectRole.MEMBER),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>['body'];
