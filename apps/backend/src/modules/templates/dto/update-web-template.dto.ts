import { PartialType } from '@nestjs/swagger';
import { CreateWebTemplateDto } from './create-web-template.dto';

export class UpdateWebTemplateDto extends PartialType(CreateWebTemplateDto) {}
