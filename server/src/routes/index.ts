import { Router } from 'express';
import { healthRouter } from './health.routes';

const rootRouter = Router();

// Mount modular sub-routers
rootRouter.use('/health', healthRouter);

export { rootRouter };
