import { PartialType } from '@nestjs/swagger';
import { CreateSlidePreviewDto } from './create-slide-preview.dto';

export class UpdateSlidePreviewDto extends PartialType(CreateSlidePreviewDto) {}
