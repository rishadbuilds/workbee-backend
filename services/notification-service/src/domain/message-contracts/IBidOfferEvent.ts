import { UserRole } from 'workbee-common';

export interface IBidOfferEvent {
  bidId: string;
  chatId: string;
  workId: string;
  workTitle: string;
  amount: number;
  offeredBy: UserRole;
  recipientId: string;
  recipientRole: UserRole;
  senderName: string;
}