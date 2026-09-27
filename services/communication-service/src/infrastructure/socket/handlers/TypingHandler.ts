import { AuthenticatedSocket } from '../types/SocketTypes';

export class TypingHandler {
  public register(socket: AuthenticatedSocket): void {
    socket.on('typing', (data: { chatId: string; isTyping: boolean }) => {
      socket.to(`chat:${data.chatId}`).emit('user_typing', {
        chatId: data.chatId,
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });
  }
}