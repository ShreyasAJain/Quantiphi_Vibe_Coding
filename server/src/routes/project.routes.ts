import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { TaskController } from '../controllers/task.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createProjectSchema,
  projectIdParamSchema,
  addProjectMemberSchema,
} from '../schemas/project.schema';
import { createTaskSchema, getTasksQuerySchema } from '../schemas/task.schema';

const router = Router();

// Project Base Endpoints
router.post('/', validateRequest(createProjectSchema), ProjectController.createProject);
router.get('/', ProjectController.getAllProjects);
router.get('/:id', validateRequest(projectIdParamSchema), ProjectController.getProjectById);

// Project Membership Endpoints
router.post(
  '/:id/members',
  validateRequest(addProjectMemberSchema),
  ProjectController.addProjectMember
);
router.get(
  '/:id/members',
  validateRequest(projectIdParamSchema),
  ProjectController.getProjectMembers
);

// Project Tasks Endpoints
router.post(
  '/:id/tasks',
  validateRequest(createTaskSchema),
  TaskController.createTask
);
router.get(
  '/:id/tasks',
  validateRequest(getTasksQuerySchema),
  TaskController.getTasksForProject
);

export const projectRouter = router;
