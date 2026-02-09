import { PartialType } from '@nestjs/swagger';
import { CreateDigitalProductVariantDto } from './create-digital-product-variant.dto';

export class UpdateDigitalProductVariantDto extends PartialType(CreateDigitalProductVariantDto) {}
