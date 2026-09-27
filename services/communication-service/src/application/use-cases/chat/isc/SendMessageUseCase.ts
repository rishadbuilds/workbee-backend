
import { inject, injectable } from 'tsyringe';
import { IMessageRepository, NewMessage } from '../../../../domain/repositories/IMessageRepository';
import { IChatRepository } from '../../../../domain/repositories/IChatRepository';
import { SendMessageDTO, SendMessageResultDTO } from '../../../dtos/chat/ChatDTO';
import { ISendMessageUseCase } from '../../../ports/chat/ISendMessageUseCase';
import { UserRole } from 'workbee-common';
import { ErrorMessages } from '../../../../shared/constants/ErrorMessages';

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    @inject("MessageRepository") private readonly _messageRepository: IMessageRepository,
    @inject("ChatRepository") private readonly _chatRepository: IChatRepository
  ) { }

  async execute(data: SendMessageDTO): Promise<SendMessageResultDTO> {
    const chat = await this._chatRepository.findById(data.chatId);

    if (!chat) {
      throw new Error(ErrorMessages.CHAT.CHAT_NOT_FOUND);
    }

    // determine recipient based on sender role
    let recipientId: string | undefined;
    if (data.senderRole === UserRole.USER) {
      recipientId = chat.participants.workerId;
    } else if (data.senderRole === UserRole.WORKER) {
      recipientId = chat.participants.userId;
    }

    const message: NewMessage = {
      chatId: data.chatId,
      senderId: data.senderId,
      senderRole: data.senderRole,
      content: data.content,
      type: data.type || 'text',
      isRead: false
    };

    const savedMessage = await this._messageRepository.create(message);
    await this._chatRepository.updateLastMessage(data.chatId, data.content);

    return { ...savedMessage, recipientId };
  }
}