import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebTemplate } from '../../entities/web-template.entity';
import { TemplateLicense } from '../../entities/template-license.entity';
import { TemplateDemo } from '../../entities/template-demo.entity';
import { DigitalProductTag } from '../../entities/digital-product-tag.entity';
import { TemplatesRepository } from './templates.repository';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WebTemplate,
      TemplateLicense,
      TemplateDemo,
      DigitalProductTag,
    ]),
  ],
  controllers: [TemplatesController],
  providers: [TemplatesRepository, TemplatesService],
  exports: [TemplatesService, TemplatesRepository],
})
export class TemplatesModule {}
