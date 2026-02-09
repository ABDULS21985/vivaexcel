import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TemplatesRepository } from '../templates.repository';
import { CreateTemplateDemoDto } from '../dto/create-template-demo.dto';

@Injectable()
export class TemplateDemosService {
  private readonly logger = new Logger(TemplateDemosService.name);

  constructor(private readonly repository: TemplatesRepository) {}

  async findByTemplate(templateId: string) {
    const demos = await this.repository.findDemosByTemplate(templateId);
    return {
      status: 'success',
      message: 'Demos retrieved successfully',
      data: demos,
    };
  }

  async create(templateId: string, dto: CreateTemplateDemoDto) {
    const demo = await this.repository.createDemo({
      ...dto,
      templateId,
    });

    return {
      status: 'success',
      message: 'Demo created successfully',
      data: demo,
    };
  }

  async update(id: string, dto: Partial<CreateTemplateDemoDto>) {
    const updated = await this.repository.updateDemo(id, dto as any);
    if (!updated) {
      throw new NotFoundException('Demo not found');
    }

    return {
      status: 'success',
      message: 'Demo updated successfully',
      data: updated,
    };
  }

  async remove(id: string) {
    await this.repository.deleteDemo(id);
    return {
      status: 'success',
      message: 'Demo deleted successfully',
      data: null,
    };
  }
}
