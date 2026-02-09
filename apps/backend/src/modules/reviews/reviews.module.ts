import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ReviewsController } from './controllers/reviews.controller';
import { ReviewsService } from './services/reviews.service';
import { ReviewsRepository } from './reviews.repository';
import { Review } from '../../entities/review.entity';
import { ReviewVote } from '../../entities/review-vote.entity';
import { ReviewReport } from '../../entities/review-report.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      ReviewVote,
      ReviewReport,
      Order,
      OrderItem,
      DigitalProduct,
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsService],
})
export class ReviewsModule {}
