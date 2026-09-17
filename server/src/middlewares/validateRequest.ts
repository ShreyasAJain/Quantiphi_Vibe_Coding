import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if ((parsed as any).body !== undefined) {
        req.body = (parsed as any).body;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
