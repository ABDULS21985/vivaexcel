import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ChatConversation } from './entities/chat-conversation.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { AIAssistantService } from './services/ai-assistant.service';
import { AIAssistantGateway } from './ai-assistant.gateway';
import { AIAssistantController } from './ai-assistant.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatConversation, DigitalProduct]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [AIAssistantController],
  providers: [AIAssistantService, AIAssistantGateway],
  exports: [AIAssistantService],
})
export class AIAssistantModule {}
