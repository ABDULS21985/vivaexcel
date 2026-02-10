import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowcasesController } from './showcases.controller';
import { ShowcasesService } from './showcases.service';
import { Showcase } from './entities/showcase.entity';
import { ShowcaseLike } from './entities/showcase-like.entity';
import { ShowcaseComment } from './entities/showcase-comment.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Showcase,
      ShowcaseLike,
      ShowcaseComment,
      Order,
      OrderItem,
      DigitalProduct,
    ]),
  ],
  controllers: [ShowcasesController],
  providers: [ShowcasesService],
  exports: [ShowcasesService],
})
export class ShowcasesModule {}
