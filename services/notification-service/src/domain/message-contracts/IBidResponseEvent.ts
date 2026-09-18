import { UserRole } from 'workbee-common';

export interface IBidResponseEvent {
  bidId: string;
  chatId: string;
  workId: string;
  workTitle: string;
  amount: number;
  action: 'accept' | 'reject';
  respondedBy: UserRole.WORKER | UserRole.USER;
  recipientId: string;
  recipientRole: UserRole.WORKER | UserRole.USER;
  responderName: string;
}