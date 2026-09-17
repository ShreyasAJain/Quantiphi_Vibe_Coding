import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createProjectSchema,
  projectIdParamSchema,
  addProjectMemberSchema,
} from '../schemas/project.schema';

const router = Router();

router.post('/', validateRequest(createProjectSchema), ProjectController.createProject);
router.get('/', ProjectController.getAllProjects);
router.get('/:id', validateRequest(projectIdParamSchema), ProjectController.getProjectById);
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

export const projectRouter = router;
