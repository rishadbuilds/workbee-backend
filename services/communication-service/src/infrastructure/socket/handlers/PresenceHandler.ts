import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../types/SocketTypes';

export interface UserStatusPayload {
  userId: string;
  status: 'online' | 'offline';
}

/**
 * Tracks and broadcasts user online/offline presence.
 */
export class PresenceHandler {
  constructor(
    private io: Server,
    private userSockets: Map<string, string>,
  ) {}

  public register(socket: AuthenticatedSocket): void {
    const userId = socket.userId;
    if (!userId) return;

    // Announce this user is online to everyone (cheap; payload is tiny).
    this.io.emit('user_status_changed', { userId, status: 'online' } as UserStatusPayload);

    socket.on('get_online_status', (userIds: string[]) => {
      if (!Array.isArray(userIds)) return;
      const statuses: UserStatusPayload[] = userIds.map((id) => ({
        userId: id,
        status: this.userSockets.has(id) ? 'online' : 'offline',
      }));
      socket.emit('online_status_bulk', statuses);
    });

    socket.on('disconnect', () => {

      setImmediate(() => {
        if (!this.userSockets.has(userId)) {
          this.io.emit('user_status_changed', { userId, status: 'offline' } as UserStatusPayload);
        }
      });
    });
  }
}