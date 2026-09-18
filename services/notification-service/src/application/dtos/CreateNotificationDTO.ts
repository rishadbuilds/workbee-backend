import { UserRole } from "workbee-common";

export type NotificationType =
  | "NEW_MESSAGE"
  | "WORK_UPDATE"
  | "BOOKING_UPDATE"
  | "PAYMENT"
  | "BID_OFFER"
  | "BID_RESPONSE"

export type SenderRole = UserRole.WORKER | UserRole.USER;

export interface NotificationDataDTO {
  chatId?: string;
  senderId?: string;
  senderName?: string;
  senderRole?: SenderRole;
  workId?: string;
  workerId?: string;
  progress?: "started" | "ongoing" | "completed";
  bidId?: string;
  amount?: number;
}

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationDataDTO;
}
