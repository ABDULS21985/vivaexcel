import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ProductQAController } from './product-qa.controller';
import { ProductQAService } from './product-qa.service';
import { ProductQuestion } from './entities/product-question.entity';
import { ProductAnswer } from './entities/product-answer.entity';
import { QuestionUpvote } from './entities/question-upvote.entity';
import { AnswerUpvote } from './entities/answer-upvote.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { User } from '../../entities/user.entity';
import { SellerProfile } from '../../entities/seller-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductQuestion,
      ProductAnswer,
      QuestionUpvote,
      AnswerUpvote,
      DigitalProduct,
      User,
      SellerProfile,
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ProductQAController],
  providers: [ProductQAService],
  exports: [ProductQAService],
})
export class ProductQAModule {}
