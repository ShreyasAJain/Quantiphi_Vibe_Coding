export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type ProjectRole = 'OWNER' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt?: string;
  _count?: {
    members: number;
    tasks: number;
  };
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  projectId: string;
  assignedUserId: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  assignedUser?: User | null;
}

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
    TODO: Task[];
    IN_PROGRESS: Task[];
    DONE: Task[];
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}
