import { UserRole } from "workbee-common";
import { Message } from "../../../domain/entities/Message";

export interface CreateChatDTO {
  userId: string;
  workerId: string;
}

export interface SendMessageDTO {
  chatId: string;
  senderId: string;
  senderRole: UserRole.USER | UserRole.WORKER;
  content: string;
  type?: 'text' | 'image' | 'video' | 'file' | 'system';
  // uploads to Cloudinary
  mediaUrl?: string;
  mediaPublicId?: string;
  recipientId?: string;
}

export interface SendMessageResultDTO extends Message {
  recipientId?: string;
}


export interface GetMessagesDTO {
  chatId: string;
  limit?: number;
  offset?: number;
}

export interface GetUserChatsDTO {
  userId: string;
  role: UserRole.USER | UserRole.WORKER;
}


export interface MarkChatAsReadDTO {
  chatId: string;
  role: UserRole.USER | UserRole.WORKER;
}