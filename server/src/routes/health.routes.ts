import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { sendSuccess } from '../utils/response';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startTime = Date.now();
    // Verify database connectivity with a lightweight ping
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;

    sendSuccess(
      res,
      {
        status: 'healthy',
        uptimeSeconds: Math.floor(process.uptime()),
        database: {
          status: 'connected',
          latencyMs: dbLatencyMs,
        },
        timestamp: new Date().toISOString(),
      },
      'Kanban API is operational'
    );
  } catch (error) {
    next(error);
  }
});

export const healthRouter = router;
