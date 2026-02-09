import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebTemplate } from '../../entities/web-template.entity';
import { TemplateLicense } from '../../entities/template-license.entity';
import { TemplateDemo } from '../../entities/template-demo.entity';
import { DigitalProductTag } from '../../entities/digital-product-tag.entity';
import { TemplatesRepository } from './templates.repository';
import { TemplatesService } from './services/templates.service';
import { TemplateLicensesService } from './services/template-licenses.service';
import { TemplateDemosService } from './services/template-demos.service';
import { TemplatesController } from './controllers/templates.controller';
import { TemplateLicensesController } from './controllers/template-licenses.controller';
import { TemplateDemosController } from './controllers/template-demos.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WebTemplate,
      TemplateLicense,
      TemplateDemo,
      DigitalProductTag,
    ]),
  ],
  controllers: [
    TemplatesController,
    TemplateLicensesController,
    TemplateDemosController,
  ],
  providers: [
    TemplatesRepository,
    TemplatesService,
    TemplateLicensesService,
    TemplateDemosService,
  ],
  exports: [
    TemplatesService,
    TemplateLicensesService,
    TemplateDemosService,
  ],
})
export class TemplatesModule {}
