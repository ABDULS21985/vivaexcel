import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssistantAction } from '../entities/chat-conversation.entity';

export class ChatContextDto {
  @ApiPropertyOptional({ description: 'Current page the user is browsing' })
  @IsOptional()
  @IsString()
  currentPage?: string;

  @ApiPropertyOptional({ description: 'Current product ID being viewed' })
  @IsOptional()
  @IsUUID()
  currentProductId?: string;

  @ApiPropertyOptional({
    description: 'Product IDs currently in the cart',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cartItems?: string[];
}

export class SendMessageDto {
  @ApiProperty({ description: 'User message to send to the AI assistant' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({ description: 'Existing conversation ID to continue' })
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiPropertyOptional({
    description: 'Session ID for guest users without authentication',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'Browsing context for context-aware responses',
    type: ChatContextDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ChatContextDto)
  context?: ChatContextDto;
}

export class ChatResponseDto {
  @ApiProperty({ description: 'Conversation ID' })
  conversationId: string;

  @ApiProperty({ description: 'AI assistant response message' })
  message: string;

  @ApiProperty({
    description: 'Structured actions the frontend should execute',
    type: 'array',
  })
  actions: AssistantAction[];

  @ApiProperty({
    description: 'Quick reply suggestions for the user',
    type: [String],
  })
  suggestions: string[];
}

export class GetConversationDto {
  @ApiProperty({ description: 'Conversation ID' })
  @IsUUID()
  conversationId: string;
}

export class ProactiveSuggestionDto {
  @ApiProperty({
    description: 'Current page path the user is on',
    example: '/store',
  })
  @IsString()
  @IsNotEmpty()
  page: string;

  @ApiPropertyOptional({
    description: 'Product ID if the user is viewing a specific product',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;
}

export class ProactiveSuggestionResponseDto {
  @ApiProperty({
    description: 'Suggested messages or prompts for the user',
    type: [String],
  })
  suggestions: string[];

  @ApiPropertyOptional({
    description: 'Welcome or contextual greeting message',
  })
  greeting?: string;
}
