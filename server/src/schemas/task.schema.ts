import { z } from 'zod';
import { TaskStatus, Priority } from '@prisma/client';

export const createTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format. Must be a valid UUID'),
  }),
  body: z.object({
    title: z
      .string({ message: 'Task title is required' })
      .trim()
      .min(2, 'Title must be at least 2 characters long')
      .max(200, 'Title cannot exceed 200 characters'),
    description: z.string().trim().max(2000).optional(),
    priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
    dueDate: z
      .string()
      .datetime({ message: 'Due date must be a valid ISO 8601 date string' })
      .optional()
      .nullable(),
    assignedUserId: z
      .string()
      .uuid('Invalid assigned user ID format')
      .optional()
      .nullable(),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format. Must be a valid UUID'),
  }),
  body: z.object({
    status: z.nativeEnum(TaskStatus, {
      message: 'Status must be one of: TODO, IN_PROGRESS, DONE',
    }),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format. Must be a valid UUID'),
  }),
  body: z.object({
    title: z.string().trim().min(2).max(200).optional(),
    description: z.string().trim().max(2000).optional().nullable(),
    priority: z.nativeEnum(Priority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    dueDate: z.string().datetime().optional().nullable(),
    assignedUserId: z.string().uuid().optional().nullable(),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format. Must be a valid UUID'),
  }),
});

export const getTasksQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format. Must be a valid UUID'),
  }),
  query: z.object({
    priority: z.nativeEnum(Priority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>['body'];
