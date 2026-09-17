import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode: number = 200): Response {
  const payload: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    data,
  };
  return res.status(statusCode).json(payload);
}

export function sendCreated<T>(res: Response, data: T, message: string = 'Resource created successfully'): Response {
  return sendSuccess(res, data, message, 201);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 400,
  details?: any
): Response {
  const payload: ApiResponse = {
    success: false,
    error: {
      message,
      ...(details && { details }),
    },
  };
  return res.status(statusCode).json(payload);
}
