import { inject, injectable } from 'tsyringe';
import { IBidRepository } from '../../../domain/repositories/IBidRepository';
import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { IChatRepository } from '../../../domain/repositories/IChatRepository';
import { ISendBidOfferUseCase } from '../../ports/bid/ISendBidOfferUseCase';
import { SendBidOfferDTO, BidActionResult } from '../../dtos/bid/BidDTO';
import { UserRole } from 'workbee-common';
import { ErrorMessages } from '../../../shared/constants/ErrorMessages';
import { BidEventPublisher } from '../../../infrastructure/message-bus/BidEventPublisher';

@injectable()
export class SendBidOfferUseCase implements ISendBidOfferUseCase {
  constructor(
    @inject('BidRepository') private readonly _bidRepository: IBidRepository,
    @inject('MessageRepository') private readonly _messageRepository: IMessageRepository,
    @inject('ChatRepository') private readonly _chatRepository: IChatRepository,
    @inject('BidEventPublisher') private readonly _bidEventPublisher: BidEventPublisher

  ) { }

  async execute(data: SendBidOfferDTO): Promise<BidActionResult> {
    if (!data.amount || data.amount <= 0) {
      throw new Error(ErrorMessages.BID.OFFER_AMOUNT_NOT_VALID);
    }

    const existing = await this._bidRepository.findActiveByWorkId(data.workId);

    let bid;

    if (!existing) {
      if (data.offeredBy !== UserRole.WORKER) {
        throw new Error(ErrorMessages.BID.ONLY_WORKER_CAN_MAKE_THE_FIRST_OFFER);
      }

      bid = await this._bidRepository.create({
        chatId: data.chatId,
        workId: data.workId,
        workTitle: data.workTitle,
        userId: data.userId,
        workerId: data.workerId,
        workerName: data.workerName,
        amount: data.amount,
        status: 'pending',
        awaitingResponseFrom: UserRole.USER,
        lastOfferBy: UserRole.WORKER,
        history: [{ amount: data.amount, offeredBy: UserRole.WORKER, at: new Date() }],
      });
    } else {
      if (existing.status !== 'pending') {
        throw new Error(ErrorMessages.BID.BID_FINALIZED);
      }
      if (existing.awaitingResponseFrom !== data.offeredBy) {
        throw new Error(ErrorMessages.BID.NOT_YOUR_TURN);
      }

      // Only ONE counter offer is allowed total (eg history length must be exactly 1 here).
      if (existing.history.length >= 2) {
        throw new Error(ErrorMessages.BID.ONE_COUNTER_OFFER_IS_ALLOWED);
      }

      const nextAwaiting = data.offeredBy === UserRole.USER ? UserRole.WORKER : UserRole.USER;

      const updated = await this._bidRepository.update(existing.id!, {
        amount: data.amount,
        lastOfferBy: data.offeredBy,
        awaitingResponseFrom: nextAwaiting,
        history: [...existing.history, { amount: data.amount, offeredBy: data.offeredBy, at: new Date() }],
      });
      bid = updated!;
    }

    const isCounter = bid.history.length > 1;

    const payload = {
      type: isCounter ? 'WORK_BID_COUNTER' : 'WORK_BID_OFFER',
      bidId: bid.id,
      workId: bid.workId,
      workTitle: bid.workTitle,
      userId: bid.userId,
      workerId: bid.workerId,
      workerName: bid.workerName,
      amount: bid.amount,
      offeredBy: data.offeredBy,
    };

    const systemMessageContent = JSON.stringify(payload);

    const senderId = data.offeredBy === UserRole.WORKER ? bid.workerId : bid.userId;
    const senderRole = data.offeredBy;

    const message = await this._messageRepository.create({
      chatId: data.chatId,
      senderId,
      senderRole,
      content: systemMessageContent,
      type: 'system',
      isRead: false,
    });

    await this._chatRepository.updateLastMessage(
      data.chatId,
      isCounter ? `Countered with ₹${bid.amount}` : `Offered ₹${bid.amount}`
    );

    // notify the other party
    const recipientId = data.offeredBy === UserRole.WORKER ? bid.userId : bid.workerId;
    const recipientRole = data.offeredBy === UserRole.WORKER ? UserRole.USER : UserRole.WORKER;

    await this._bidEventPublisher.publishBidOffer({
      bidId: bid.id!,
      chatId: data.chatId,
      workId: bid.workId,
      workTitle: bid.workTitle,
      amount: bid.amount,
      offeredBy: data.offeredBy,
      recipientId,
      recipientRole,
      senderName: data.offeredBy === UserRole.WORKER ? bid.workerName : 'Client',
    });

    return { bid, systemMessageContent: JSON.stringify({ ...JSON.parse(systemMessageContent), messageId: message.id }) };
  }
}