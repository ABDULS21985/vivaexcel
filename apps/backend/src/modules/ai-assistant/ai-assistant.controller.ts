import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AIAssistantService } from './services/ai-assistant.service';
import {
  SendMessageDto,
  ChatResponseDto,
  ProactiveSuggestionDto,
  ProactiveSuggestionResponseDto,
} from './dto/chat.dto';
import { Public } from '../../common/decorators/public.decorator';
import {
  CurrentUser,
  JwtUserPayload,
} from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ApiResponse } from '../../common/interfaces/response.interface';

@ApiTags('AI Assistant')
@Controller('ai-assistant')
@UseGuards(RolesGuard, PermissionsGuard)
export class AIAssistantController {
  constructor(private readonly aiAssistantService: AIAssistantService) {}

  @Post('chat')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send a message to the AI assistant',
    description:
      'Send a chat message and receive an AI-powered response. Works for both authenticated users and guests (via sessionId).',
  })
  @SwaggerResponse({
    status: 200,
    description: 'AI assistant response returned successfully',
  })
  @SwaggerResponse({
    status: 400,
    description: 'Invalid input or rate limit exceeded',
  })
  @SwaggerResponse({
    status: 503,
    description: 'AI service is unavailable',
  })
  async sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser() user?: JwtUserPayload,
  ): Promise<ApiResponse<ChatResponseDto>> {
    const userId = user?.sub;
    const response = await this.aiAssistantService.processMessage(dto, userId);

    return {
      status: 'success',
      message: 'Message processed successfully',
      data: response,
    };
  }

  @Get('conversations/:id')
  @Public()
  @ApiOperation({
    summary: 'Get a conversation by ID',
    description: 'Retrieve a full conversation with all messages by its ID.',
  })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  @SwaggerResponse({
    status: 200,
    description: 'Conversation retrieved successfully',
  })
  @SwaggerResponse({
    status: 404,
    description: 'Conversation not found',
  })
  async getConversation(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<any>> {
    const conversation = await this.aiAssistantService.getConversation(id);

    return {
      status: 'success',
      message: 'Conversation retrieved successfully',
      data: conversation,
    };
  }

  @Get('conversations')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List authenticated user\'s conversations',
    description:
      'Retrieve all past conversations for the currently authenticated user.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Conversations retrieved successfully',
  })
  @SwaggerResponse({
    status: 401,
    description: 'Unauthorized — authentication required',
  })
  async getUserConversations(
    @CurrentUser('sub') userId: string,
  ): Promise<ApiResponse<any>> {
    const conversations =
      await this.aiAssistantService.getUserConversations(userId);

    return {
      status: 'success',
      message: 'Conversations retrieved successfully',
      data: conversations,
    };
  }

  @Post('suggestions')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get proactive suggestions based on page context',
    description:
      'Returns context-aware chat suggestions and a greeting based on which page the user is currently viewing.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Suggestions returned successfully',
  })
  async getProactiveSuggestions(
    @Body() dto: ProactiveSuggestionDto,
  ): Promise<ApiResponse<ProactiveSuggestionResponseDto>> {
    const suggestions =
      await this.aiAssistantService.getProactiveSuggestions(
        dto.page,
        dto.productId,
      );

    return {
      status: 'success',
      message: 'Suggestions retrieved successfully',
      data: suggestions,
    };
  }
}
