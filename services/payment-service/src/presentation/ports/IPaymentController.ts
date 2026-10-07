import { NextFunction, Request, Response } from "express";

/** interface of payment controller */

export interface IPaymentController {
    createOrder(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    verifyPayment(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    workCompleted(req: Request, res: Response, next:NextFunction) : Promise<Response | void>;
    getWallet(req: Request, res : Response,next:NextFunction) : Promise<Response | void>
    getAdminSummary(req: Request, res : Response, next:NextFunction) : Promise<Response | void>
    getAdminPaymentsList(req: Request, res: Response, next:NextFunction) : Promise<Response | void>
    markPaymentFailed(req: Request, res: Response, next: NextFunction): Promise<void>;
}