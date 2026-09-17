import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { validateRequest } from '../middlewares/validateRequest';
import {
  taskIdParamSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../schemas/task.schema';

const router = Router();

router.get('/:id', validateRequest(taskIdParamSchema), TaskController.getTaskById);
router.patch(
  '/:id/status',
  validateRequest(updateTaskStatusSchema),
  TaskController.updateTaskStatus
);
router.patch(
  '/:id',
  validateRequest(updateTaskSchema),
  TaskController.updateTask
);
router.delete('/:id', validateRequest(taskIdParamSchema), TaskController.deleteTask);

export const taskRouter = router;
