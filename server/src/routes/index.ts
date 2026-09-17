import { Router } from 'express';
import { healthRouter } from './health.routes';
import { userRouter } from './user.routes';
import { projectRouter } from './project.routes';
import { taskRouter } from './task.routes';

const rootRouter = Router();

rootRouter.use('/health', healthRouter);
rootRouter.use('/users', userRouter);
rootRouter.use('/projects', projectRouter);
rootRouter.use('/tasks', taskRouter);

export { rootRouter };
