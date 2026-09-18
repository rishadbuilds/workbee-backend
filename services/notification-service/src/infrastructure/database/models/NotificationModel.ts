import mongoose, { Schema, Document } from 'mongoose';
import { Notification } from '../../../domain/entities/Notification';
import { UserRole } from 'workbee-common';

export interface NotificationDocument extends Omit<Notification, 'id'>, Document { }

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['NEW_MESSAGE', 'WORK_UPDATE', 'BOOKING_UPDATE', 'PAYMENT', 'BID_OFFER',  "BID_RESPONSE" ],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: {
      chatId: String,
      senderId: String,
      senderName: String,
      senderRole: {
        type: String,
        enum: [UserRole.USER, UserRole.WORKER]
      },
      workId: String,
      workerId: String,
      progress: {
        type: String,
        enum: ["started", "ongoing", "completed"],
      },
      bidId: String,
      amount: Number,
    },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export const NotificationModel = mongoose.model<NotificationDocument>('Notification', NotificationSchema);