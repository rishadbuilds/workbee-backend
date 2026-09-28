import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { INotificationController } from "../ports/INotificationController";

import { IGetUserNotificationsUseCase } from "../../application/ports/IGetUserNotificationsUseCase";
import { IMarkNotificationAsReadUseCase } from "../../application/ports/IMarkNotificationAsReadUseCase";
import { IMarkAllAsReadUseCase } from "../../application/ports/IMarkAllAsReadUseCase";
import { IGetUnreadCountUseCase } from "../../application/ports/IGetUnreadCountUseCase";

import { GetUserNotificationsDTO } from "../../application/dtos/GetUserNotificationsDTO";
import { MarkNotificationAsReadDTO } from "../../application/dtos/MarkNotificationAsReadDTO";
import { MarkAllAsReadDTO } from "../../application/dtos/MarkAllAsReadDTO";
import { GetUnreadCountDTO } from "../../application/dtos/GetUnreadCountDTO";
import { HttpStatus } from "../../shared/enums/HttpStatus";
import { ResponseHelper } from "../../shared/helpers/ResponseHelper";
import { ResponseMessage } from "../../shared/constants/ResponseMessages";
import { ErrorMessage } from "../../shared/constants/ErrorMessages";

/** notification controller */

@injectable()
export class NotificationController implements INotificationController {
  constructor(
    @inject("GetUserNotificationsUseCase") private readonly _getUserNotificationsUseCase: IGetUserNotificationsUseCase,
    @inject("MarkNotificationAsReadUseCase") private readonly _markNotificationAsReadUseCase: IMarkNotificationAsReadUseCase,
    @inject("MarkAllAsReadUseCase") private readonly _markAllAsReadUseCase: IMarkAllAsReadUseCase,
    @inject("GetUnreadCountUseCase") private readonly _getUnreadCountUseCase: IGetUnreadCountUseCase
  ) { }

  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      const { limit, offset } = req.query;

      if (!user?.userId) {
        res.status(HttpStatus.UNAUTHERIZED).json(ResponseHelper.error(ErrorMessage.AUTH.UNAUTHENTICATED));
        return;
      }

      const dto: GetUserNotificationsDTO = {
        userId: user.userId,
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0
      };

      const notifications = await this._getUserNotificationsUseCase.execute(dto);
      res.status(HttpStatus.OK).json(ResponseHelper.success(notifications, ResponseMessage.NOTIFICATION.NOTIFICATION_RETRIEVED));
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let { notificationId } = req.params;

      if (Array.isArray(notificationId)) {
        notificationId = notificationId[0];
      }

      const dto: MarkNotificationAsReadDTO = { notificationId };
      const result = await this._markNotificationAsReadUseCase.execute(dto);

      res.status(HttpStatus.OK).json(ResponseHelper.success(result, ResponseMessage.NOTIFICATION.MARKED_AS_READ));
    } catch (error) {
      next(error)
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const user = req.user;

      if (!user?.userId) {
        res.status(HttpStatus.UNAUTHERIZED).json(ResponseHelper.error(ErrorMessage.AUTH.UNAUTHENTICATED));
        return;
      }

      const dto: MarkAllAsReadDTO = { userId: user.userId };
      const result = await this._markAllAsReadUseCase.execute(dto);

      res.status(HttpStatus.OK).json(ResponseHelper.success(result, ResponseMessage.NOTIFICATION.MARKED_ALL_AS_READ));
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;

      if (!user?.userId) {
        res.status(HttpStatus.UNAUTHERIZED).json(ResponseHelper.error(ErrorMessage.AUTH.UNAUTHENTICATED));
        return;
      }

      const dto: GetUnreadCountDTO = { userId: user.userId };
      const count = await this._getUnreadCountUseCase.execute(dto);

      res.status(HttpStatus.OK).json(ResponseHelper.success(count, ResponseMessage.NOTIFICATION.UNREAD_COUNT_RETRIEVED));
    } catch (error) {
      next(error);
    }
  }
}