import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { ENV } from '../../config/env';
import jwt from 'jsonwebtoken';
import { container } from 'tsyringe';
import { CacheService } from '../../services/CacheService';
import { MessageEventPublisher } from '../../message-bus/MessageEventPublisher';
import { IJwtPayload, NotificationDTO } from 'workbee-common';
import { logger } from '../../logger/logger';
import { AuthenticatedSocket } from '../types/SocketTypes';
import { ChatHandler } from '../handlers/ChatHandler';
import { BidHandler } from '../handlers/BidHandler';
import { WorkHandler } from '../handlers/WorkHandler';
import { PaymentHandler } from '../handlers/PaymentHandler';
import { TypingHandler } from '../handlers/TypingHandler';

export class SocketGateway {
  private io: Server;
  private userSockets: Map<string, string> = new Map();

  private chatHandler: ChatHandler;
  private bidHandler: BidHandler;
  private workHandler: WorkHandler;
  private paymentHandler: PaymentHandler;
  private typingHandler: TypingHandler;

  constructor(httpServer: HttpServer) {
    // this.io = new Server(httpServer, {
    //   cors: {
    //     origin: process.env.CORS_ORIGIN,
    //     credentials: true,
    //     methods: ['GET', 'POST'],
    //   },
    // });
    this.io = new Server(httpServer, {
      path: '/communication/socket.io',
      cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST'],
      },
    });

    const cacheService = container.resolve(CacheService);
    const messageEventPublisher = container.resolve(MessageEventPublisher);

    this.chatHandler = new ChatHandler(this.io, this.userSockets, cacheService, messageEventPublisher);
    this.bidHandler = new BidHandler(this.io);
    this.workHandler = new WorkHandler(this.io);
    this.paymentHandler = new PaymentHandler(this.io);
    this.typingHandler = new TypingHandler();

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as IJwtPayload;
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        next();
      } catch {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info(`[Socket] connected: ${socket.userId} (${socket.userRole})`);

      if (socket.userId) {
        this.userSockets.set(socket.userId, socket.id);
      }

      socket.join(`user:${socket.userId}`);

      this.chatHandler.register(socket);
      this.bidHandler.register(socket);
      this.workHandler.register(socket);
      this.paymentHandler.register(socket);
      this.typingHandler.register(socket);

      socket.on('disconnect', () => {
        logger.info(`[Socket] disconnected: ${socket.userId}`);
        if (socket.userId) this.userSockets.delete(socket.userId);
      });
    });
  }

  public emitNotificationToUser(userId: string, notification: NotificationDTO): void {
    this.io.to(`user:${userId}`).emit('new_notification', notification);
  }

  public getIO(): Server {
    return this.io;
  }
}