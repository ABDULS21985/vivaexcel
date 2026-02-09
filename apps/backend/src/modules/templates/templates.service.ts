import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { nanoid } from 'nanoid';
import { TemplatesRepository } from './templates.repository';
import { CreateWebTemplateDto } from './dto/create-web-template.dto';
import { UpdateWebTemplateDto } from './dto/update-web-template.dto';
import { WebTemplateQueryDto } from './dto/web-template-query.dto';
import { CreateTemplateDemoDto } from './dto/create-template-demo.dto';
import { CreateTemplateLicenseDto } from './dto/create-template-license.dto';
import { CompatibilityCheckDto } from './dto/compatibility-check.dto';
import {
  WebTemplate,
  Framework,
  WebTemplateStatus,
} from '../../entities/web-template.entity';
import { TemplateLicense } from '../../entities/template-license.entity';
import { TemplateDemo } from '../../entities/template-demo.entity';
import { DigitalProductTag } from '../../entities/digital-product-tag.entity';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces/response.interface';
import { CacheService } from '../../common/cache/cache.service';

// Cache constants
const CACHE_TTL_TEMPLATES_LIST = 300; // 5 minutes
const CACHE_TTL_SINGLE_TEMPLATE = 600; // 10 minutes
const CACHE_TAG_TEMPLATES = 'templates';

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
    private readonly templatesRepository: TemplatesRepository,
    private readonly cacheService: CacheService,
    @InjectRepository(DigitalProductTag)
    private readonly tagRepo: Repository<DigitalProductTag>,
  ) {}

  // ─── Template CRUD ──────────────────────────────────────────────────

  async findAll(query: WebTemplateQueryDto): Promise<ApiResponse<PaginatedResponse<WebTemplate>>> {
    const cacheKey = this.cacheService.generateKey('templates', 'list', query);

    const result = await this.cacheService.wrap(
      cacheKey,
      () => this.templatesRepository.findAll(query),
      { ttl: CACHE_TTL_TEMPLATES_LIST, tags: [CACHE_TAG_TEMPLATES] },
    );

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

  async findById(id: string): Promise<ApiResponse<WebTemplate>> {
    const cacheKey = this.cacheService.generateKey('templates', 'id', id);

    const template = await this.cacheService.wrap(
      cacheKey,
      () => this.templatesRepository.findById(id),
      { ttl: CACHE_TTL_SINGLE_TEMPLATE, tags: [CACHE_TAG_TEMPLATES, `template:${id}`] },
    );

    if (!template) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }

    // Increment views (don't await to not block response)
    this.templatesRepository.incrementViewCount(id).catch((err) => {
      this.logger.warn(`Failed to increment views for template ${id}: ${err.message}`);
    });

    return {
      status: 'success',
      message: 'Template retrieved successfully',
      data: template,
    };
  }

  async findBySlug(slug: string): Promise<ApiResponse<WebTemplate>> {
    const cacheKey = this.cacheService.generateKey('templates', 'slug', slug);

    const template = await this.cacheService.wrap(
      cacheKey,
      () => this.templatesRepository.findBySlug(slug),
      { ttl: CACHE_TTL_SINGLE_TEMPLATE, tags: [CACHE_TAG_TEMPLATES, `template:slug:${slug}`] },
    );

    if (!template) {
      throw new NotFoundException(`Template with slug "${slug}" not found`);
    }

    // Increment views (don't await to not block response)
    this.templatesRepository.incrementViewCount(template.id).catch((err) => {
      this.logger.warn(`Failed to increment views for template ${slug}: ${err.message}`);
    });

    return {
      status: 'success',
      message: 'Template retrieved successfully',
      data: template,
    };
  }

  async create(dto: CreateWebTemplateDto, userId: string): Promise<ApiResponse<WebTemplate>> {
    const slug = dto.slug || generateSlug(dto.title);

    // Check if slug already exists
    const slugExists = await this.templatesRepository.slugExists(slug);
    if (slugExists) {
      throw new ConflictException('Template slug already exists');
    }

    let tags = [];
    if (dto.tagIds && dto.tagIds.length > 0) {
      tags = await this.tagRepo.find({ where: { id: In(dto.tagIds) } });
    }

    const { tagIds, ...templateData } = dto;
    const template = await this.templatesRepository.create({
      ...templateData,
      slug,
      createdBy: userId,
      tags,
    });

    // Invalidate templates cache
    await this.cacheService.invalidateByTag(CACHE_TAG_TEMPLATES);
    this.logger.debug('Invalidated templates cache after create');

    return {
      status: 'success',
      message: 'Template created successfully',
      data: template,
    };
  }

  async update(id: string, dto: UpdateWebTemplateDto): Promise<ApiResponse<WebTemplate>> {
    const existingTemplate = await this.templatesRepository.findById(id);
    if (!existingTemplate) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }

    // Check if new slug already exists (if updating slug)
    if (dto.slug && dto.slug !== existingTemplate.slug) {
      const slugExists = await this.templatesRepository.slugExists(dto.slug, id);
      if (slugExists) {
        throw new ConflictException('Template slug already exists');
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

    const updatedTemplate = await this.templatesRepository.update(id, updateData);

    // Invalidate templates cache and specific template cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_TEMPLATES,
      `template:${id}`,
      `template:slug:${existingTemplate.slug}`,
    ]);
    this.logger.debug(`Invalidated templates cache after update for template ${id}`);

    return {
      status: 'success',
      message: 'Template updated successfully',
      data: updatedTemplate!,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const template = await this.templatesRepository.findById(id);
    if (!template) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }

    await this.templatesRepository.remove(id);

    // Invalidate templates cache and specific template cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_TEMPLATES,
      `template:${id}`,
      `template:slug:${template.slug}`,
    ]);
    this.logger.debug(`Invalidated templates cache after delete for template ${id}`);

    return {
      status: 'success',
      message: 'Template deleted successfully',
      data: null,
    };
  }

  async findByFramework(
    framework: Framework,
    limit?: number,
  ): Promise<ApiResponse<WebTemplate[]>> {
    const cacheKey = this.cacheService.generateKey('templates', 'framework', framework, limit ?? 'all');

    const query: WebTemplateQueryDto = {
      framework,
      limit: limit ?? 20,
    };

    const result = await this.cacheService.wrap(
      cacheKey,
      () => this.templatesRepository.findAll(query),
      { ttl: CACHE_TTL_TEMPLATES_LIST, tags: [CACHE_TAG_TEMPLATES, `template:framework:${framework}`] },
    );

    return {
      status: 'success',
      message: `Templates for framework "${framework}" retrieved successfully`,
      data: result.items,
    };
  }

  // ─── Demo Management ────────────────────────────────────────────────

  async findDemos(templateId: string): Promise<ApiResponse<TemplateDemo[]>> {
    const cacheKey = this.cacheService.generateKey('templates', 'demos', templateId);

    const demos = await this.cacheService.wrap(
      cacheKey,
      () => this.templatesRepository.findDemosByTemplate(templateId),
      { ttl: CACHE_TTL_SINGLE_TEMPLATE, tags: [CACHE_TAG_TEMPLATES, `template:demos:${templateId}`] },
    );

    return {
      status: 'success',
      message: 'Demos retrieved successfully',
      data: demos,
    };
  }

  async createDemo(dto: CreateTemplateDemoDto & { templateId: string }): Promise<ApiResponse<TemplateDemo>> {
    const demo = await this.templatesRepository.createDemo({
      ...dto,
    });

    // Invalidate demos cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG_TEMPLATES,
      `template:demos:${dto.templateId}`,
    ]);
    this.logger.debug(`Invalidated demos cache after create for template ${dto.templateId}`);

    return {
      status: 'success',
      message: 'Demo created successfully',
      data: demo,
    };
  }

  async updateDemo(id: string, dto: Partial<CreateTemplateDemoDto>): Promise<ApiResponse<TemplateDemo>> {
    const updated = await this.templatesRepository.updateDemo(id, dto as any);
    if (!updated) {
      throw new NotFoundException(`Demo with ID "${id}" not found`);
    }

    // Invalidate demos cache
    await this.cacheService.invalidateByTag(CACHE_TAG_TEMPLATES);
    this.logger.debug(`Invalidated templates cache after demo update for demo ${id}`);

    return {
      status: 'success',
      message: 'Demo updated successfully',
      data: updated,
    };
  }

  async removeDemo(id: string): Promise<ApiResponse<null>> {
    await this.templatesRepository.deleteDemo(id);

    // Invalidate demos cache
    await this.cacheService.invalidateByTag(CACHE_TAG_TEMPLATES);
    this.logger.debug(`Invalidated templates cache after demo delete for demo ${id}`);

    return {
      status: 'success',
      message: 'Demo deleted successfully',
      data: null,
    };
  }

  // ─── License Management ─────────────────────────────────────────────

  private generateLicenseKey(): string {
    return `KTB-${nanoid(8)}-${nanoid(8)}-${nanoid(8)}-${nanoid(8)}`.toUpperCase();
  }

  async createLicense(dto: CreateTemplateLicenseDto): Promise<ApiResponse<TemplateLicense>> {
    const licenseKey = this.generateLicenseKey();
    const maxActivations = dto.maxActivations || this.getDefaultMaxActivations(dto.licenseType);

    const license = await this.templatesRepository.createLicense({
      ...dto,
      licenseKey,
      maxActivations,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });

    this.logger.log(`License created: ${licenseKey} for template ${dto.templateId}`);

    return {
      status: 'success',
      message: 'License created successfully',
      data: license,
    };
  }

  async validateLicense(licenseKey: string): Promise<ApiResponse<{ isValid: boolean; license: TemplateLicense; reason: string | null }>> {
    const license = await this.templatesRepository.findLicenseByKey(licenseKey);
    if (!license) {
      throw new NotFoundException(`License with key "${licenseKey}" not found`);
    }

    const isValid =
      license.isActive &&
      license.activationCount < license.maxActivations &&
      (!license.expiresAt || new Date(license.expiresAt) > new Date());

    let reason: string | null = null;
    if (!license.isActive) {
      reason = 'License is deactivated';
    } else if (license.activationCount >= license.maxActivations) {
      reason = 'Maximum activations reached';
    } else if (license.expiresAt && new Date(license.expiresAt) <= new Date()) {
      reason = 'License has expired';
    }

    return {
      status: 'success',
      message: isValid ? 'License is valid' : 'License is not valid',
      data: {
        isValid,
        license,
        reason,
      },
    };
  }

  async activateLicense(licenseKey: string): Promise<ApiResponse<TemplateLicense>> {
    const license = await this.templatesRepository.findLicenseByKey(licenseKey);
    if (!license) {
      throw new NotFoundException(`License with key "${licenseKey}" not found`);
    }

    if (!license.isActive) {
      throw new BadRequestException('License is deactivated');
    }

    if (license.activationCount >= license.maxActivations) {
      throw new BadRequestException('Maximum activations reached');
    }

    if (license.expiresAt && new Date(license.expiresAt) <= new Date()) {
      throw new BadRequestException('License has expired');
    }

    const updated = await this.templatesRepository.updateLicense(license.id, {
      activationCount: license.activationCount + 1,
    } as any);

    return {
      status: 'success',
      message: 'License activated successfully',
      data: updated,
    };
  }

  async deactivateLicense(licenseKey: string): Promise<ApiResponse<TemplateLicense>> {
    const license = await this.templatesRepository.findLicenseByKey(licenseKey);
    if (!license) {
      throw new NotFoundException(`License with key "${licenseKey}" not found`);
    }

    const updated = await this.templatesRepository.updateLicense(license.id, {
      isActive: false,
    } as any);

    return {
      status: 'success',
      message: 'License deactivated successfully',
      data: updated,
    };
  }

  async getUserLicenses(userId: string): Promise<ApiResponse<TemplateLicense[]>> {
    const licenses = await this.templatesRepository.findLicensesByUser(userId);

    return {
      status: 'success',
      message: 'User licenses retrieved successfully',
      data: licenses,
    };
  }

  // ─── AI Integration (Stubs) ─────────────────────────────────────────

  async suggestPricing(templateId: string): Promise<ApiResponse<{ suggestedPrice: number; tier: string; reasoning: string }>> {
    const template = await this.templatesRepository.findById(templateId);
    if (!template) {
      throw new NotFoundException(`Template with ID "${templateId}" not found`);
    }

    // Stub: analyze features, framework, and type to suggest a price tier
    const featureCount = template.features?.length ?? 0;
    let tier = 'basic';
    let suggestedPrice = 29;

    if (featureCount > 20) {
      tier = 'premium';
      suggestedPrice = 99;
    } else if (featureCount > 10) {
      tier = 'professional';
      suggestedPrice = 59;
    }

    return {
      status: 'success',
      message: 'Pricing suggestion generated',
      data: {
        suggestedPrice,
        tier,
        reasoning: `Based on ${featureCount} features, ${template.framework} framework, and ${template.templateType} type.`,
      },
    };
  }

  async generateDescription(templateId: string): Promise<ApiResponse<{ description: string; shortDescription: string }>> {
    const template = await this.templatesRepository.findById(templateId);
    if (!template) {
      throw new NotFoundException(`Template with ID "${templateId}" not found`);
    }

    // Stub: generate marketing description
    const description = `${template.title} is a ${template.framework} ${template.templateType.toLowerCase().replace(/_/g, ' ')} template. It includes ${template.features?.join(', ') || 'various features'} and is designed for modern web development.`;
    const shortDescription = `A ${template.framework} ${template.templateType.toLowerCase().replace(/_/g, ' ')} template with ${template.features?.length ?? 0} features.`;

    return {
      status: 'success',
      message: 'Description generated',
      data: {
        description,
        shortDescription,
      },
    };
  }

  async suggestSeoKeywords(templateId: string): Promise<ApiResponse<{ keywords: string[]; title: string; description: string }>> {
    const template = await this.templatesRepository.findById(templateId);
    if (!template) {
      throw new NotFoundException(`Template with ID "${templateId}" not found`);
    }

    // Stub: suggest SEO keywords
    const keywords = [
      template.framework.toLowerCase(),
      template.templateType.toLowerCase().replace(/_/g, ' '),
      'web template',
      'website template',
      template.hasTypeScript ? 'typescript' : 'javascript',
      ...(template.features?.slice(0, 5) ?? []),
    ];

    return {
      status: 'success',
      message: 'SEO keywords suggested',
      data: {
        keywords,
        title: `${template.title} - ${template.framework} ${template.templateType.replace(/_/g, ' ')} Template`,
        description: `Download ${template.title}, a professional ${template.framework} ${template.templateType.toLowerCase().replace(/_/g, ' ')} template with ${template.features?.length ?? 0} features.`,
      },
    };
  }

  // ─── Compatibility Checker ──────────────────────────────────────────

  async checkCompatibility(dto: CompatibilityCheckDto): Promise<ApiResponse<WebTemplate[]>> {
    const query: WebTemplateQueryDto = {
      framework: dto.framework,
      limit: 20,
    };

    if (dto.templateType) {
      query.templateType = dto.templateType;
    }

    if (dto.hasTypeScript !== undefined) {
      query.hasTypeScript = dto.hasTypeScript;
    }

    if (dto.requiredFeatures && dto.requiredFeatures.length > 0) {
      query.features = dto.requiredFeatures;
    }

    const result = await this.templatesRepository.findAll(query);

    // Additional filtering for node version and package manager compatibility
    let filteredItems = result.items;

    if (dto.nodeVersion) {
      filteredItems = filteredItems.filter(
        (t) => !t.nodeVersion || t.nodeVersion <= dto.nodeVersion,
      );
    }

    if (dto.packageManager) {
      filteredItems = filteredItems.filter(
        (t) => !t.packageManager || t.packageManager === dto.packageManager,
      );
    }

    return {
      status: 'success',
      message: `Found ${filteredItems.length} compatible templates`,
      data: filteredItems,
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────

  private getDefaultMaxActivations(licenseType: string): number {
    switch (licenseType) {
      case 'SINGLE_USE':
        return 1;
      case 'MULTI_USE':
        return 5;
      case 'EXTENDED':
        return 25;
      case 'UNLIMITED':
        return 999;
      default:
        return 1;
    }
  }
}
