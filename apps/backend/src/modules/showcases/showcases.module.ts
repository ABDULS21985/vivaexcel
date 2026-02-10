import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ShowcasesController } from './showcases.controller';
import { ShowcasesService } from './showcases.service';
import { Showcase, ShowcaseLike, ShowcaseComment } from './entities';
import { User } from '../../entities/user.entity';
import { Order } from '../../entities/order.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Showcase,
      ShowcaseLike,
      ShowcaseComment,
      User,
      Order,
      DigitalProduct,
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ShowcasesController],
  providers: [ShowcasesService],
  exports: [ShowcasesService],
})
export class ShowcasesModule {}
