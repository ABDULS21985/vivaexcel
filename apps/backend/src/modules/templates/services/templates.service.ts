import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TemplatesRepository } from '../templates.repository';
import { CacheService } from '../../../cache/cache.service';
import { CreateWebTemplateDto } from '../dto/create-web-template.dto';
import { UpdateWebTemplateDto } from '../dto/update-web-template.dto';
import { WebTemplateQueryDto } from '../dto/web-template-query.dto';
import { TemplateStatus } from '../../../entities/web-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DigitalProductTag } from '../../../entities/digital-product-tag.entity';

const CACHE_TTL_LIST = 300;
const CACHE_TTL_SINGLE = 600;
const CACHE_TAG = 'web-templates';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    private readonly repository: TemplatesRepository,
    private readonly cacheService: CacheService,
    @InjectRepository(DigitalProductTag)
    private readonly tagRepo: Repository<DigitalProductTag>,
  ) {}

  async findAll(query: WebTemplateQueryDto) {
    const result = await this.repository.findAll(query);
    return {
      status: 'success',
      message: 'Templates retrieved successfully',
      data: {
        items: result.items,
        meta: {
          total: result.total,
          hasNextPage: result.hasNextPage,
          nextCursor: result.nextCursor,
        },
      },
    };
  }

  async findById(id: string) {
    const template = await this.repository.findById(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    // Increment view count async
    this.repository.incrementViewCount(id).catch((err) => {
      this.logger.warn(`Failed to increment view count for ${id}: ${err.message}`);
    });
    return {
      status: 'success',
      message: 'Template retrieved successfully',
      data: template,
    };
  }

  async findBySlug(slug: string) {
    const template = await this.repository.findBySlug(slug);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    // Increment view count async
    this.repository.incrementViewCount(template.id).catch((err) => {
      this.logger.warn(`Failed to increment view count for ${template.id}: ${err.message}`);
    });
    return {
      status: 'success',
      message: 'Template retrieved successfully',
      data: template,
    };
  }

  async create(dto: CreateWebTemplateDto, creatorId: string) {
    const slug = dto.slug || generateSlug(dto.title);
    const slugExists = await this.repository.slugExists(slug);
    if (slugExists) {
      throw new ConflictException('A template with this slug already exists');
    }

    let tags = [];
    if (dto.tagIds && dto.tagIds.length > 0) {
      tags = await this.tagRepo.find({ where: { id: In(dto.tagIds) } });
    }

    const { tagIds, ...templateData } = dto;
    const template = await this.repository.create({
      ...templateData,
      slug,
      createdBy: creatorId,
      tags,
    });

    await this.cacheService.invalidateByTag(CACHE_TAG);

    return {
      status: 'success',
      message: 'Template created successfully',
      data: template,
    };
  }

  async update(id: string, dto: UpdateWebTemplateDto) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Template not found');
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.repository.slugExists(dto.slug, id);
      if (slugExists) {
        throw new ConflictException('A template with this slug already exists');
      }
    }

    let tags;
    if (dto.tagIds) {
      tags = await this.tagRepo.find({ where: { id: In(dto.tagIds) } });
    }

    const { tagIds, ...templateData } = dto;
    const updateData: any = { ...templateData };
    if (tags) {
      updateData.tags = tags;
    }

    const template = await this.repository.update(id, updateData);
    await this.cacheService.invalidateByTag(CACHE_TAG);

    return {
      status: 'success',
      message: 'Template updated successfully',
      data: template,
    };
  }

  async remove(id: string) {
    const template = await this.repository.findById(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    await this.repository.remove(id);
    await this.cacheService.invalidateByTag(CACHE_TAG);

    return {
      status: 'success',
      message: 'Template deleted successfully',
      data: null,
    };
  }

  async publish(id: string) {
    const template = await this.repository.findById(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    const updated = await this.repository.update(id, {
      status: TemplateStatus.PUBLISHED,
      publishedAt: new Date(),
    } as any);
    await this.cacheService.invalidateByTag(CACHE_TAG);

    return {
      status: 'success',
      message: 'Template published successfully',
      data: updated,
    };
  }

  async archive(id: string) {
    const template = await this.repository.findById(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    const updated = await this.repository.update(id, {
      status: TemplateStatus.ARCHIVED,
    } as any);
    await this.cacheService.invalidateByTag(CACHE_TAG);

    return {
      status: 'success',
      message: 'Template archived successfully',
      data: updated,
    };
  }
}
