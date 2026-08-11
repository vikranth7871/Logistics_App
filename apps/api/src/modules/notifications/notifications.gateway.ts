import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  entityType?: string;
  entityId?: string;
  createdAt: Date;
}

/**
 * WebSocket gateway for real-time notifications.
 * Clients authenticate with JWT token on connection.
 * Users are placed in a room named by their user ID.
 */
@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.data.role = payload.role;

      // Join rooms: personal + role-based
      await client.join(`user:${payload.sub}`);
      await client.join(`role:${payload.role}`);

      this.logger.log(
        `Client connected: ${client.id} (user: ${payload.sub}, role: ${payload.role})`,
      );
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Send notification to a specific user.
   */
  sendToUser(userId: string, payload: NotificationPayload) {
    this.server.to(`user:${userId}`).emit('notification', payload);
  }

  /**
   * Send notification to all users with a given role.
   */
  sendToRole(role: string, payload: NotificationPayload) {
    this.server.to(`role:${role}`).emit('notification', payload);
  }

  /**
   * Broadcast to all connected clients.
   */
  broadcast(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  /**
   * Emit trip status update — all managers/dispatchers get this.
   */
  emitTripUpdate(tripId: string, status: string, vehicleRegNo: string) {
    this.server.to('role:admin').to('role:manager').to('role:dispatcher').emit(
      'trip_update',
      { tripId, status, vehicleRegNo, timestamp: new Date() },
    );
  }
}
