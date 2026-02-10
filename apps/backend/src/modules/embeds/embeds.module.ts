import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbedsController } from './embeds.controller';
import { EmbedsService } from './embeds.service';
import { Product } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/product-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductCategory])],
  controllers: [EmbedsController],
  providers: [EmbedsService],
  exports: [EmbedsService],
})
export class EmbedsModule {}
