import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { rootRouter } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { NotFoundError } from './utils/errors';

const app = express();

// 1. CORS Configuration (Allows React frontend communication)
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// 2. Request Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Mount Root API Router
app.use('/api', rootRouter);

// 4. Handle 404 for Unmatched Routes
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
});

// 5. Centralized Error Handling Middleware (MUST be registered last)
app.use(errorHandler);

export default app;
