import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { sendCreated, sendSuccess } from '../utils/response';
import { NotFoundError, ValidationError } from '../utils/errors';
import { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput } from '../schemas/task.schema';
import { Priority, TaskStatus } from '@prisma/client';

export class TaskController {
  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id as string;
      const {
        title,
        description,
        priority,
        status,
        dueDate,
        assignedUserId,
      }: CreateTaskInput = req.body;

      // 1. Verify Project Exists
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundError('Project');
      }

      // 2. CRITICAL RULE: If assignee is provided, verify they are a member of THIS project
      if (assignedUserId) {
        const isMember = await prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId: assignedUserId,
            },
          },
        });
        if (!isMember) {
          throw new ValidationError(
            'Assigned user must be an active member of this project before tasks can be assigned'
          );
        }
      }

      // 3. Create Task
      const task = await prisma.task.create({
        data: {
          title,
          description: description || null,
          priority: priority || Priority.MEDIUM,
          status: status || TaskStatus.TODO,
          dueDate: dueDate ? new Date(dueDate) : null,
          projectId,
          assignedUserId: assignedUserId || null,
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      sendCreated(res, task, 'Task created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getTasksForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id as string;
      const { priority, status } = req.query as {
        priority?: Priority;
        status?: TaskStatus;
      };

      // Verify Project Exists
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundError('Project');
      }

      const tasks = await prisma.task.findMany({
        where: {
          projectId,
          ...(priority && { priority }),
          ...(status && { status }),
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      });

      sendSuccess(res, tasks, 'Tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          project: {
            select: { id: true, name: true },
          },
          assignedUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!task) {
        throw new NotFoundError('Task');
      }

      sendSuccess(res, task, 'Task retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status }: UpdateTaskStatusInput = req.body;

      const existingTask = await prisma.task.findUnique({
        where: { id },
      });
      if (!existingTask) {
        throw new NotFoundError('Task');
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status },
        include: {
          assignedUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      sendSuccess(res, updatedTask, `Task moved to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const {
        title,
        description,
        priority,
        status,
        dueDate,
        assignedUserId,
      }: UpdateTaskInput = req.body;

      const existingTask = await prisma.task.findUnique({
        where: { id },
      });
      if (!existingTask) {
        throw new NotFoundError('Task');
      }

      // If reassigning user, verify the new user is a member of this project
      if (assignedUserId && assignedUserId !== existingTask.assignedUserId) {
        const isMember = await prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId: existingTask.projectId,
              userId: assignedUserId,
            },
          },
        });
        if (!isMember) {
          throw new ValidationError(
            'Assigned user must be an active member of this project'
          );
        }
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(priority !== undefined && { priority }),
          ...(status !== undefined && { status }),
          ...(dueDate !== undefined && {
            dueDate: dueDate ? new Date(dueDate) : null,
          }),
          ...(assignedUserId !== undefined && { assignedUserId }),
        },
        include: {
          assignedUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      sendSuccess(res, updatedTask, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const existingTask = await prisma.task.findUnique({
        where: { id },
      });
      if (!existingTask) {
        throw new NotFoundError('Task');
      }

      await prisma.task.delete({
        where: { id },
      });

      sendSuccess(res, { id }, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
