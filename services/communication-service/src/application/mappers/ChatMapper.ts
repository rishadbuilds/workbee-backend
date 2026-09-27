import { UserRole } from "workbee-common";
import { Chat } from "../../domain/entities/Chat";
import { Message } from "../../domain/entities/Message";
import { ICacheService } from "../../domain/services/ICacheService";

export class ChatMapper {
  
  /* 
   * chat mapping
   * 
   */

  static async toChatWithParticipants(chat: Chat, cacheService: ICacheService): Promise<Chat> {
    const userProfile = await cacheService.getUserProfile(
      chat.participants.userId
    );

    const workerProfile = await cacheService.getWorkerProfile(
      chat.participants.workerId
    );

    return {
      ...chat, participantDetails: {
        user: userProfile ? {
          id: userProfile.id,
          name: userProfile.name,
          avatar: userProfile.avatar,
        } : undefined, worker: workerProfile ? {
          id: workerProfile.id,
          name: workerProfile.name,
          avatar: workerProfile.avatar,
        } : undefined,
      },
    };
  }

  static async toChatListWithParticipants(chats: Chat[], cacheService: ICacheService): Promise<Chat[]> {
    return Promise.all(chats.map((chat) =>
      ChatMapper.toChatWithParticipants(chat, cacheService)
    ));
  }

  /* 
   * message mapping
   *  */

  static async toMessageWithSender(message: Message, cacheService: ICacheService): Promise<Message> {
    let senderProfile;

    if (message.senderRole === UserRole.USER) {
      senderProfile = await cacheService.getUserProfile(message.senderId);
    } else {
      senderProfile = await cacheService.getWorkerProfile(message.senderId);
    }

    return {
      ...message, senderDetails: senderProfile ? { name: senderProfile.name, avatar: senderProfile.avatar } : undefined
    };
  }

  static async toMessageListWithSender(messages: Message[], cacheService: ICacheService): Promise<Message[]> {
    return Promise.all(messages.map((message) =>
      ChatMapper.toMessageWithSender(message, cacheService)));
  }
}
