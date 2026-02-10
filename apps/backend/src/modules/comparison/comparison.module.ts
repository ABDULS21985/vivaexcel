import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComparisonSet } from './entities';
import { ComparisonService } from './comparison.service';
import { ComparisonController } from './comparison.controller';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { DigitalProductCategory } from '../../entities/digital-product-category.entity';
import { DigitalProductTag } from '../../entities/digital-product-tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComparisonSet,
      DigitalProduct,
      DigitalProductCategory,
      DigitalProductTag,
    ]),
  ],
  controllers: [ComparisonController],
  providers: [ComparisonService],
  exports: [ComparisonService],
})
export class ComparisonModule {}
