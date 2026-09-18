import { inject, injectable } from 'tsyringe';
import { IBidRepository } from '../../../domain/repositories/IBidRepository';
import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { IChatRepository } from '../../../domain/repositories/IChatRepository';
import { IRespondToBidUseCase } from '../../ports/bid/IRespondToBidUseCase';
import { RespondToBidDTO, BidActionResult } from '../../dtos/bid/BidDTO';
import { UserRole } from 'workbee-common';
import { ErrorMessages } from '../../../shared/constants/ErrorMessages';
import { BidEventPublisher } from '../../../infrastructure/message-bus/BidEventPublisher';

@injectable()
export class RespondToBidUseCase implements IRespondToBidUseCase {
  constructor(
    @inject('BidRepository') private readonly _bidRepository: IBidRepository,
    @inject('MessageRepository') private readonly _messageRepository: IMessageRepository,
    @inject('ChatRepository') private readonly _chatRepository: IChatRepository,
    @inject('BidEventPublisher') private readonly _bidEventPublisher: BidEventPublisher

  ) { }

  async execute(data: RespondToBidDTO): Promise<BidActionResult> {
    const bid = await this._bidRepository.findById(data.bidId);
    if (!bid) throw new Error(ErrorMessages.BID.BID_NOT_FOUND);
    if (bid.status !== 'pending') throw new Error(ErrorMessages.BID.BID_FINALIZED);
    if (bid.awaitingResponseFrom !== data.respondedBy) {
      throw new Error(ErrorMessages.BID.NOT_YOUR_TURN);
    }

    const updated = await this._bidRepository.update(bid.id!, {
      status: data.action === 'accept' ? 'accepted' : 'rejected',
    });

    const payload = {
      type: data.action === 'accept' ? 'WORK_BID_ACCEPTED' : 'WORK_BID_REJECTED',
      bidId: bid.id,
      workId: bid.workId,
      workTitle: bid.workTitle,
      userId: bid.userId,
      workerId: bid.workerId,
      workerName: bid.workerName,
      amount: bid.amount,
      respondedBy: data.respondedBy,
    };

    const senderId = data.respondedBy === UserRole.WORKER ? bid.workerId : bid.userId;

    const message = await this._messageRepository.create({
      chatId: bid.chatId,
      senderId,
      senderRole: data.respondedBy,
      content: JSON.stringify(payload),
      type: 'system',
      isRead: false,
    });

    await this._chatRepository.updateLastMessage(
      bid.chatId,
      data.action === 'accept' ? `Offer of ₹${bid.amount} accepted` : `Offer of ₹${bid.amount} rejected`
    );

    // notify whoever made the offer being responded to
    const recipientId = data.respondedBy === UserRole.WORKER ? bid.userId : bid.workerId;
    const recipientRole = data.respondedBy === UserRole.WORKER ? UserRole.USER : UserRole.WORKER;

    await this._bidEventPublisher.publishBidResponse({
      bidId: bid.id!,
      chatId: bid.chatId,
      workId: bid.workId,
      workTitle: bid.workTitle,
      amount: bid.amount,
      action: data.action,
      respondedBy: data.respondedBy,
      recipientId,
      recipientRole,
      responderName: data.respondedBy === UserRole.WORKER ? bid.workerName : 'Client',
    });

    return {
      bid: updated!,
      systemMessageContent: JSON.stringify({ ...payload, messageId: message.id }),
    };
  }
}