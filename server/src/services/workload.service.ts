import { prisma } from '../lib/prisma';
import { TaskStatus } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

export interface ColumnCounts {
  TODO: number;
  IN_PROGRESS: number;
  DONE: number;
}

export interface UserWorkload {
  userId: string;
  name: string;
  email: string;
  role: string;
  inProgressCount: number;
  totalTasks: number;
  isOverloaded: boolean;
}

export interface ProjectBoardState {
  project: {
    id: string;
    name: string;
    description: string | null;
  };
  columnCounts: ColumnCounts;
  userWorkloads: UserWorkload[];
  columns: {
    TODO: any[];
    IN_PROGRESS: any[];
    DONE: any[];
  };
}

export class WorkloadService {
  /**
   * Calculates column task totals for a project
   */
  static async getColumnCounts(projectId: string): Promise<ColumnCounts> {
    const counts = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId },
      _count: {
        id: true,
      },
    });

    const result: ColumnCounts = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    };

    counts.forEach((item) => {
      if (item.status in result) {
        result[item.status as TaskStatus] = item._count.id;
      }
    });

    return result;
  }

  /**
   * CORE REQUIREMENT:
   * Calculate each user's number of "In Progress" tasks.
   * If a user has MORE THAN 5 tasks in "In Progress", isOverloaded = true.
   * Exactly 5 tasks must NOT trigger the warning (isOverloaded = false).
   */
  static async getUserWorkloads(projectId: string): Promise<UserWorkload[]> {
    // 1. Fetch all members belonging to this project
    const projectMembers = await prisma.projectMember.findMany({
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

    // 2. Compute workload for each member in the context of this project
    const workloads: UserWorkload[] = await Promise.all(
      projectMembers.map(async (member) => {
        // Count In Progress tasks for this user in this project
        const inProgressCount = await prisma.task.count({
          where: {
            projectId,
            assignedUserId: member.userId,
            status: TaskStatus.IN_PROGRESS,
          },
        });

        // Count total tasks for this user in this project
        const totalTasks = await prisma.task.count({
          where: {
            projectId,
            assignedUserId: member.userId,
          },
        });

        // STRICT ASSESSMENT BUSINESS RULE:
        // More than 5 triggers the warning; 5 or fewer does not.
        const isOverloaded = inProgressCount > 5;

        return {
          userId: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
          inProgressCount,
          totalTasks,
          isOverloaded,
        };
      })
    );

    return workloads;
  }

  /**
   * Unified Board Aggregator
   * Returns column counts, tasks grouped by column, and user workload metrics
   */
  static async getProjectBoardState(projectId: string): Promise<ProjectBoardState> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    if (!project) {
      throw new NotFoundError('Project');
    }

    // Parallel fetch: Column counts, User workloads, and All tasks
    const [columnCounts, userWorkloads, allTasks] = await Promise.all([
      this.getColumnCounts(projectId),
      this.getUserWorkloads(projectId),
      prisma.task.findMany({
        where: { projectId },
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
      }),
    ]);

    // Group tasks into Kanban columns
    const columns: ProjectBoardState['columns'] = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };

    allTasks.forEach((task) => {
      if (task.status in columns) {
        columns[task.status as TaskStatus].push(task);
      }
    });

    return {
      project,
      columnCounts,
      userWorkloads,
      columns,
    };
  }
}
