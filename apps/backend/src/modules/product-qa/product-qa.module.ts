import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductQAController } from './product-qa.controller';
import { ProductQAService } from './product-qa.service';
import { ProductQuestion, ProductAnswer } from './entities';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductQuestion,
      ProductAnswer,
      DigitalProduct,
      User,
    ]),
  ],
  controllers: [ProductQAController],
  providers: [ProductQAService],
  exports: [ProductQAService],
})
export class ProductQAModule {}
