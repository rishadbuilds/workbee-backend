import { Router } from 'express';
import { container } from 'tsyringe';
import { ChatController } from '../controllers/ChatController';

const router = Router();
const chatController = container.resolve(ChatController);

/** chat routes */

router.post('/chat/create', chatController.createChat.bind(chatController));
router.get('/chat/my-chats', chatController.getUserChats.bind(chatController));
router.get('/chat/:chatId/messages', chatController.getMessages.bind(chatController));
router.patch('/chat/:chatId/read', chatController.markChatAsRead.bind(chatController));

export default router;