import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  accountId?: string;
  email?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // Configure based on your frontend URL
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('🔌 WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract JWT token from handshake auth or query
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        client.handshake.query?.token;

      if (!token) {
        this.logger.warn(
          `❌ Client ${client.id} connection rejected: No token provided`
        );
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Attach user info to socket
      client.userId = payload.sub;
      client.accountId = payload.accountId;
      client.email = payload.email;

      // Join account-specific room for multi-tenant isolation
      const accountRoom = `account:${client.accountId}`;
      client.join(accountRoom);

      this.logger.log(
        `✅ Client connected: ${client.id} (User: ${client.email}, Account: ${client.accountId})`
      );
      this.logger.log(`👥 Joined room: ${accountRoom}`);

      // Send connection confirmation
      client.emit('connected', {
        message: 'Connected to real-time events',
        userId: client.userId,
        accountId: client.accountId,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `❌ Client ${client.id} authentication failed: ${err.message}`
      );
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(
      `🔌 Client disconnected: ${client.id} (User: ${client.email || 'unknown'})`
    );
  }

  // Subscribe to ping message for connection testing
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    this.logger.debug(`⚡ Ping from ${client.id}`);
    return { event: 'pong', data: { timestamp: new Date().toISOString() } };
  }

  // Broadcast event to specific account room
  broadcastToAccount(accountId: string, event: string, data: any) {
    const room = `account:${accountId}`;
    this.logger.debug(
      `📢 Broadcasting ${event} to room ${room}: ${JSON.stringify(data).substring(0, 100)}`
    );
    this.server.to(room).emit(event, data);
  }

  // Broadcast event to specific user
  broadcastToUser(userId: string, event: string, data: any) {
    const clients = Array.from(this.server.sockets.sockets.values()) as AuthenticatedSocket[];
    const userSockets = clients.filter((socket) => socket.userId === userId);

    userSockets.forEach((socket) => {
      this.logger.debug(`📢 Broadcasting ${event} to user ${userId}`);
      socket.emit(event, data);
    });
  }

  // Broadcast to all connected clients (admin only)
  broadcastToAll(event: string, data: any) {
    this.logger.debug(`📢 Broadcasting ${event} to all clients`);
    this.server.emit(event, data);
  }

  // Get connection statistics
  getStats() {
    const clients = Array.from(this.server.sockets.sockets.values()) as AuthenticatedSocket[];
    const accountCounts = clients.reduce((acc, socket) => {
      if (socket.accountId) {
        acc[socket.accountId] = (acc[socket.accountId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalConnections: clients.length,
      accountConnections: accountCounts,
      rooms: Array.from(this.server.sockets.adapter.rooms.keys()),
    };
  }
}
