import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DiscussionsController } from './discussions.controller';
import { DiscussionsService } from './discussions.service';
import {
  DiscussionCategory,
  DiscussionThread,
  DiscussionReply,
  DiscussionReplyLike,
} from './entities';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiscussionCategory,
      DiscussionThread,
      DiscussionReply,
      DiscussionReplyLike,
      User,
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [DiscussionsController],
  providers: [DiscussionsService],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
