import { Router } from 'express';
import { healthRouter } from './health.routes';
import { userRouter } from './user.routes';
import { projectRouter } from './project.routes';

const rootRouter = Router();

rootRouter.use('/health', healthRouter);
rootRouter.use('/users', userRouter);
rootRouter.use('/projects', projectRouter);

export { rootRouter };
