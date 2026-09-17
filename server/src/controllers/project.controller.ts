import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { sendCreated, sendSuccess } from '../utils/response';
import { NotFoundError, ConflictError } from '../utils/errors';
import { CreateProjectInput, AddProjectMemberInput } from '../schemas/project.schema';

export class ProjectController {
  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description }: CreateProjectInput = req.body;

      const project = await prisma.project.create({
        data: {
          name,
          description: description || null,
        },
      });

      sendCreated(res, project, 'Project created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAllProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
        },
      });

      sendSuccess(res, projects, 'Projects retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundError('Project');
      }

      sendSuccess(res, project, 'Project retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async addProjectMember(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id as string;
      const { userId, role }: AddProjectMemberInput = req.body;

      // 1. Verify Project Exists
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundError('Project');
      }

      // 2. Verify User Exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundError('User');
      }

      // 3. Check for Existing Membership
      const existingMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      });
      if (existingMember) {
        throw new ConflictError('User is already a member of this project');
      }

      // 4. Create Membership
      const member = await prisma.projectMember.create({
        data: {
          projectId,
          userId,
          role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      sendCreated(res, member, 'Member added to project successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getProjectMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id as string;

      // Verify Project Exists
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundError('Project');
      }

      const members = await prisma.projectMember.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      sendSuccess(res, members, 'Project members retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
