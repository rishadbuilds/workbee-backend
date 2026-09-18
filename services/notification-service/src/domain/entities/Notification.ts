import { UserRole } from "workbee-common";

export interface Notification {
  id: string;
  userId: string;
  type: 'NEW_MESSAGE' | 'WORK_UPDATE' | 'BOOKING_UPDATE' | 'PAYMENT' | 'BID_OFFER';
  title: string;
  message: string;
  data?: {
    chatId?: string;
    senderId?: string;
    senderName?: string;
    senderRole?: UserRole.USER | UserRole.WORKER;
    workId?: string;
    workerId?: string;
    progress?: "started" | "ongoing" | "completed";
    bidId?: string;
    amount?: number;
  };
  isRead: boolean;
  createdAt: Date;
}