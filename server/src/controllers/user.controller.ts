import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { sendCreated, sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import { CreateUserInput } from '../schemas/user.schema';

export class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email }: CreateUserInput = req.body;

      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
        },
      });

      sendCreated(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              assignedTasks: true,
              projectMembers: true,
            },
          },
        },
      });

      sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          projectMembers: {
            include: {
              project: {
                select: { id: true, name: true },
              },
            },
          },
          assignedTasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('User');
      }

      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
