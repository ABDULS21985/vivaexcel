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
import { AIAssistantService } from './services/ai-assistant.service';
import { SendMessageDto } from './dto/chat.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/ai-assistant',
})
export class AIAssistantGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AIAssistantGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly aiAssistantService: AIAssistantService,
  ) {}

  /**
   * Handle new WebSocket connections.
   * Supports both authenticated (JWT token) and guest (sessionId) connections.
   */
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const sessionId = client.handshake.auth.sessionId;

      if (token) {
        // Authenticated user connection
        try {
          const payload = this.jwtService.verify(token);
          client.data.userId = payload.sub;
          client.data.authenticated = true;
          client.join(`user:${payload.sub}`);
          this.logger.log(
            `Authenticated client connected: ${client.id} (User: ${payload.sub})`,
          );
        } catch (jwtError) {
          // JWT verification failed — fall back to guest mode
          this.logger.warn(
            `JWT verification failed for client ${client.id}, falling back to guest mode`,
          );
          client.data.authenticated = false;

          if (sessionId) {
            client.data.sessionId = sessionId;
            client.join(`session:${sessionId}`);
          } else {
            this.logger.warn(
              `Client ${client.id} has invalid token and no sessionId — disconnecting`,
            );
            client.disconnect();
            return;
          }
        }
      } else if (sessionId) {
        // Guest user connection with session ID
        client.data.sessionId = sessionId;
        client.data.authenticated = false;
        client.join(`session:${sessionId}`);
        this.logger.log(
          `Guest client connected: ${client.id} (Session: ${sessionId})`,
        );
      } else {
        // No auth token and no session ID — reject connection
        this.logger.warn(
          `Client ${client.id} connected without token or sessionId — disconnecting`,
        );
        client.disconnect();
        return;
      }

      // Send connection acknowledgment
      client.emit('chat:connected', {
        status: 'connected',
        authenticated: client.data.authenticated || false,
      });
    } catch (error: unknown) {
      this.logger.error(
        `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Handle incoming chat messages from clients.
   */
  @SubscribeMessage('chat:send')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      const userId = client.data.userId || undefined;
      const sessionId = client.data.sessionId || data.sessionId;

      // Ensure sessionId is set for the message
      const messageDto: SendMessageDto = {
        ...data,
        sessionId: sessionId,
      };

      // Emit typing indicator
      client.emit('chat:typing', { isTyping: true });

      // Process the message
      const response = await this.aiAssistantService.processMessage(
        messageDto,
        userId,
      );

      // Stop typing indicator and send response
      client.emit('chat:typing', { isTyping: false });
      client.emit('chat:response', {
        status: 'success',
        data: response,
      });
    } catch (error: unknown) {
      client.emit('chat:typing', { isTyping: false });

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.';

      this.logger.error(
        `Chat message error for client ${client.id}: ${errorMessage}`,
      );

      client.emit('chat:response', {
        status: 'error',
        message: errorMessage,
      });
    }
  }

  /**
   * Handle typing indicator events from clients.
   */
  @SubscribeMessage('chat:typing')
  handleTypingIndicator(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId?: string; isTyping: boolean },
  ) {
    // Broadcast typing status to the conversation room if needed
    if (data.conversationId) {
      client.to(`conversation:${data.conversationId}`).emit('chat:typing', {
        userId: client.data.userId,
        isTyping: data.isTyping,
      });
    }
  }

  /**
   * Handle request for proactive suggestions.
   */
  @SubscribeMessage('chat:suggestions')
  async handleSuggestionsRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { page: string; productId?: string },
  ) {
    try {
      const suggestions =
        await this.aiAssistantService.getProactiveSuggestions(
          data.page,
          data.productId,
        );

      client.emit('chat:suggestions', {
        status: 'success',
        data: suggestions,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get suggestions';

      this.logger.error(
        `Suggestions error for client ${client.id}: ${errorMessage}`,
      );

      client.emit('chat:suggestions', {
        status: 'error',
        message: errorMessage,
      });
    }
  }
}
