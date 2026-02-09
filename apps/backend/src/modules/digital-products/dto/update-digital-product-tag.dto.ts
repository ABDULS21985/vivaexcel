import { PartialType } from '@nestjs/swagger';
import { CreateDigitalProductTagDto } from './create-digital-product-tag.dto';

export class UpdateDigitalProductTagDto extends PartialType(CreateDigitalProductTagDto) {}
