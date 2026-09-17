import {
  ApiResponse,
  Project,
  User,
  ProjectMember,
  Task,
  ProjectBoardState,
  UserWorkload,
  Priority,
  TaskStatus,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const payload: ApiResponse<T> = await response.json();

  if (!response.ok || !payload.success) {
    const errorMsg = payload.error?.message || 'Network request failed';
    throw new Error(errorMsg);
  }

  return payload.data as T;
}

export const api = {
  // Health
  checkHealth: () => request<any>('/health'),

  // Projects
  getProjects: () => request<Project[]>('/projects'),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (name: string, description?: string) =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),

  // Project Members
  getProjectMembers: (projectId: string) =>
    request<ProjectMember[]>(`/projects/${projectId}/members`),
  addProjectMember: (projectId: string, userId: string, role: string = 'MEMBER') =>
    request<ProjectMember>(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    }),

  // Users
  getUsers: () => request<User[]>('/users'),
  createUser: (name: string, email: string) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    }),

  // Tasks
  getProjectTasks: (projectId: string, priority?: Priority, status?: TaskStatus) => {
    const query = new URLSearchParams();
    if (priority) query.append('priority', priority);
    if (status) query.append('status', status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<Task[]>(`/projects/${projectId}/tasks${queryString}`);
  },

  createTask: (
    projectId: string,
    data: {
      title: string;
      description?: string;
      priority?: Priority;
      status?: TaskStatus;
      dueDate?: string | null;
      assignedUserId?: string | null;
    }
  ) =>
    request<Task>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTaskStatus: (taskId: string, status: TaskStatus) =>
    request<Task>(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateTask: (
    taskId: string,
    data: Partial<{
      title: string;
      description: string | null;
      priority: Priority;
      status: TaskStatus;
      dueDate: string | null;
      assignedUserId: string | null;
    }>
  ) =>
    request<Task>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteTask: (taskId: string) =>
    request<{ id: string }>(`/tasks/${taskId}`, {
      method: 'DELETE',
    }),

  // Board & Workload (Unified Core Aggregates)
  getBoardState: (projectId: string) =>
    request<ProjectBoardState>(`/projects/${projectId}/board`),

  getWorkload: (projectId: string) =>
    request<UserWorkload[]>(`/projects/${projectId}/workload`),
};
