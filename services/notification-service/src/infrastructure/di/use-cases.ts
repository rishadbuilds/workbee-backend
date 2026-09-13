import { container } from "tsyringe";

import { CreateNotificationUseCase } from "../../application/use-cases/CreateNotificationUseCase";
import { GetUnreadCountUseCase } from "../../application/use-cases/GetUnreadCountUseCase";
import { GetUserNotificationsUseCase } from "../../application/use-cases/GetUserNotificationsUseCase";
import { MarkAllAsReadUseCase } from "../../application/use-cases/MarkAllAsReadUseCase";
import { MarkNotificationAsReadUseCase } from "../../application/use-cases/MarkNotificationAsReadUseCase";
import { ICreateNotificationUseCase } from "../../application/ports/ICreateNotificationUseCase";
import { IGetUserNotificationsUseCase } from "../../application/ports/IGetUserNotificationsUseCase";
import { IMarkNotificationAsReadUseCase } from "../../application/ports/IMarkNotificationAsReadUseCase";
import { IMarkAllAsReadUseCase } from "../../application/ports/IMarkAllAsReadUseCase";
import { IGetUnreadCountUseCase } from "../../application/ports/IGetUnreadCountUseCase";


container.registerSingleton<ICreateNotificationUseCase>("CreateNotificationUseCase", CreateNotificationUseCase);
container.registerSingleton<IGetUserNotificationsUseCase>("GetUserNotificationsUseCase", GetUserNotificationsUseCase);
container.registerSingleton<IMarkNotificationAsReadUseCase>("MarkNotificationAsReadUseCase", MarkNotificationAsReadUseCase);
container.registerSingleton<IMarkAllAsReadUseCase>("MarkAllAsReadUseCase", MarkAllAsReadUseCase);
container.registerSingleton<IGetUnreadCountUseCase>("GetUnreadCountUseCase", GetUnreadCountUseCase);

