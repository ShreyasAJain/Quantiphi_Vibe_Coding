import { Router } from 'express';
import { healthRouter } from './health.routes';
import { userRouter } from './user.routes';

const rootRouter = Router();

rootRouter.use('/health', healthRouter);
rootRouter.use('/users', userRouter);

export { rootRouter };
