import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { IJwtPayload } from 'workbee-common';
import { Notification } from '../../domain/entities/Notification';
import { ENV } from '../config/env';
import { logger } from '../config/logger';
import { AuthenticatedSocket } from './SocketTypes';
import { ConnectionHandler } from './ConnectionHandler';

export class SocketGateway {
  private io: Server;
  private userSockets: Map<string, string> = new Map();
  private connectionHandler: ConnectionHandler;

  constructor(httpServer: HttpServer) {

    this.io = new Server(httpServer, {
      path: '/notification/socket.io',
      cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST'],
      },
    });

    this.connectionHandler = new ConnectionHandler(this.userSockets);

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
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          logger.warn('socket authentication failed - access token expired')
          return next(new Error('authentication error: token expired'))
        }
        if (error instanceof jwt.JsonWebTokenError) {
          logger.warn('socket auth failed - invalid token')
          return next(new Error('auth error - invalid token'))
        }
        logger.error('unexpected socket auth error', error)
        return next(new Error('authentication error'))
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.connectionHandler.register(socket);
    });
  }

  public emitNotificationToUser(userId: string, notification: Notification): void {
    logger.info(`Emitting notification to user: ${userId}`);
    this.io.to(`user:${userId}`).emit('new_notification', notification);
  }

  public broadcast(event: string, data: Notification): void {
    this.io.emit(event, data);
  }

  public getIO(): Server {
    return this.io;
  }

  public isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}
