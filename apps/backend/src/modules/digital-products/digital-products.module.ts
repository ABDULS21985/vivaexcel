import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DigitalProductsController } from './controllers/digital-products.controller';
import { DigitalProductCategoriesController } from './controllers/digital-product-categories.controller';
import { DigitalProductTagsController } from './controllers/digital-product-tags.controller';
import { DigitalProductsService } from './services/digital-products.service';
import { DigitalProductCategoriesService } from './services/digital-product-categories.service';
import { DigitalProductTagsService } from './services/digital-product-tags.service';
import { DigitalProductsRepository } from './digital-products.repository';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { DigitalProductCategory } from '../../entities/digital-product-category.entity';
import { DigitalProductTag } from '../../entities/digital-product-tag.entity';
import { DigitalProductVariant } from '../../entities/digital-product-variant.entity';
import { DigitalProductFile } from '../../entities/digital-product-file.entity';
import { DigitalProductPreview } from '../../entities/digital-product-preview.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DigitalProduct,
      DigitalProductCategory,
      DigitalProductTag,
      DigitalProductVariant,
      DigitalProductFile,
      DigitalProductPreview,
    ]),
  ],
  controllers: [
    DigitalProductsController,
    DigitalProductCategoriesController,
    DigitalProductTagsController,
  ],
  providers: [
    DigitalProductsRepository,
    DigitalProductsService,
    DigitalProductCategoriesService,
    DigitalProductTagsService,
  ],
  exports: [
    DigitalProductsService,
    DigitalProductCategoriesService,
    DigitalProductTagsService,
  ],
})
export class DigitalProductsModule {}
