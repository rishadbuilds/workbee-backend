import { NextFunction, Request, Response } from "express";

export interface IWorkerController {
  workerLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
  workerForgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  workerResetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
}
