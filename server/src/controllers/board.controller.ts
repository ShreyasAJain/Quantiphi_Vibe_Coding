import { Request, Response, NextFunction } from 'express';
import { WorkloadService } from '../services/workload.service';
import { sendSuccess } from '../utils/response';

export class BoardController {
  static async getBoardState(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id as string;
      const board = await WorkloadService.getProjectBoardState(projectId);
      sendSuccess(res, board, 'Board state retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getWorkload(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id as string;
      const workloads = await WorkloadService.getUserWorkloads(projectId);
      sendSuccess(res, workloads, 'Workload metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
