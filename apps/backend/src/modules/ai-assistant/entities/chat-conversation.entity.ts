import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';

export enum ChatMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum AssistantActionType {
  PLAIN_TEXT = 'plain_text',
  SHOW_PRODUCTS = 'show_products',
  APPLY_COUPON = 'apply_coupon',
  NAVIGATE = 'navigate',
  ADD_TO_CART = 'add_to_cart',
  COMPARE = 'compare',
}

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  timestamp: string;
  actions?: AssistantAction[];
}

export interface AssistantAction {
  type: AssistantActionType;
  payload: Record<string, any>;
}

@Entity('chat_conversations')
export class ChatConversation extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId?: string;

  @Column({ name: 'session_id' })
  @Index()
  sessionId: string;

  @Column({ type: 'jsonb', default: '[]' })
  messages: ChatMessage[];

  @Column({ type: 'jsonb', nullable: true })
  context?: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'message_count', type: 'int', default: 0 })
  messageCount: number;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt?: Date;
}
