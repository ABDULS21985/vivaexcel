import { PartialType } from '@nestjs/swagger';
import { CreateDigitalProductCategoryDto } from './create-digital-product-category.dto';

export class UpdateDigitalProductCategoryDto extends PartialType(CreateDigitalProductCategoryDto) {}
