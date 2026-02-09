import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { WebTemplate, WebTemplateStatus } from '../../entities/web-template.entity';
import { TemplateLicense } from '../../entities/template-license.entity';
import { TemplateDemo } from '../../entities/template-demo.entity';
import { WebTemplateQueryDto } from './dto/web-template-query.dto';

@Injectable()
export class TemplatesRepository {
  constructor(
    @InjectRepository(WebTemplate)
    private readonly templateRepo: Repository<WebTemplate>,
    @InjectRepository(TemplateLicense)
    private readonly licenseRepo: Repository<TemplateLicense>,
    @InjectRepository(TemplateDemo)
    private readonly demoRepo: Repository<TemplateDemo>,
  ) {}

  // --- Templates ---

  async findAll(query: WebTemplateQueryDto): Promise<{ items: WebTemplate[]; total: number; hasNextPage: boolean; nextCursor: string | null }> {
    const {
      cursor,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      status,
      templateType,
      framework,
      licenseType,
      categorySlug,
      tagSlug,
      minPrice,
      maxPrice,
      minRating,
      hasTypeScript,
      isFeatured,
      isBestseller,
      features,
      browserSupport,
    } = query;

    const qb = this.templateRepo
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.creator', 'creator')
      .leftJoinAndSelect('template.category', 'category')
      .leftJoinAndSelect('template.tags', 'tags')
      .leftJoinAndSelect('template.demos', 'demos');

    // Search
    if (search) {
      qb.andWhere(
        '(template.title ILIKE :search OR template.description ILIKE :search OR template.shortDescription ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filters
    if (status) {
      qb.andWhere('template.status = :status', { status });
    } else {
      qb.andWhere('template.status = :defaultStatus', { defaultStatus: WebTemplateStatus.PUBLISHED });
    }

    if (templateType) {
      qb.andWhere('template.templateType = :templateType', { templateType });
    }

    if (framework) {
      qb.andWhere('template.framework = :framework', { framework });
    }

    if (licenseType) {
      qb.andWhere('template.license = :licenseType', { licenseType });
    }

    if (categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    if (tagSlug) {
      qb.innerJoin('template.tags', 'filterTag', 'filterTag.slug = :tagSlug', { tagSlug });
    }

    if (minPrice !== undefined) {
      qb.andWhere('template.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('template.price <= :maxPrice', { maxPrice });
    }

    if (minRating !== undefined) {
      qb.andWhere('template.averageRating >= :minRating', { minRating });
    }

    if (hasTypeScript !== undefined) {
      qb.andWhere('template.hasTypeScript = :hasTypeScript', { hasTypeScript });
    }

    if (isFeatured !== undefined) {
      qb.andWhere('template.isFeatured = :isFeatured', { isFeatured });
    }

    if (isBestseller !== undefined) {
      qb.andWhere('template.isBestseller = :isBestseller', { isBestseller });
    }

    if (features && features.length > 0) {
      qb.andWhere('template.features @> :features', { features: JSON.stringify(features) });
    }

    if (browserSupport && browserSupport.length > 0) {
      qb.andWhere('template.browserSupport @> :browserSupport', {
        browserSupport: JSON.stringify(browserSupport),
      });
    }

    // Cursor pagination
    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded) {
        const op = sortOrder === 'ASC' ? '>' : '<';
        qb.andWhere(`template.${sortBy} ${op} :cursorValue`, { cursorValue: decoded.value });
      }
    }

    const total = await qb.getCount();

    qb.orderBy(`template.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;
    if (hasNextPage) items.pop();

    const nextCursor =
      hasNextPage && items.length > 0
        ? this.encodeCursor({ value: (items[items.length - 1] as any)[sortBy] })
        : null;

    return { items, total, hasNextPage, nextCursor };
  }

  async findById(id: string): Promise<WebTemplate | null> {
    return this.templateRepo.findOne({
      where: { id },
      relations: ['creator', 'category', 'tags', 'demos'],
    });
  }

  async findBySlug(slug: string): Promise<WebTemplate | null> {
    return this.templateRepo.findOne({
      where: { slug },
      relations: ['creator', 'category', 'tags', 'demos'],
    });
  }

  async create(data: Partial<WebTemplate>): Promise<WebTemplate> {
    const template = this.templateRepo.create(data);
    return this.templateRepo.save(template);
  }

  async update(id: string, data: Partial<WebTemplate>): Promise<WebTemplate> {
    await this.templateRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.templateRepo.softDelete(id);
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.templateRepo.createQueryBuilder('template').where('template.slug = :slug', { slug });
    if (excludeId) {
      qb.andWhere('template.id != :excludeId', { excludeId });
    }
    const count = await qb.getCount();
    return count > 0;
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.templateRepo.increment({ id }, 'viewCount', 1);
  }

  // --- Licenses ---

  async findLicensesByTemplate(templateId: string): Promise<TemplateLicense[]> {
    return this.licenseRepo.find({
      where: { templateId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findLicenseByKey(licenseKey: string): Promise<TemplateLicense | null> {
    return this.licenseRepo.findOne({
      where: { licenseKey },
      relations: ['template', 'user'],
    });
  }

  async findLicensesByUser(userId: string): Promise<TemplateLicense[]> {
    return this.licenseRepo.find({
      where: { userId },
      relations: ['template'],
      order: { createdAt: 'DESC' },
    });
  }

  async createLicense(data: Partial<TemplateLicense>): Promise<TemplateLicense> {
    const license = this.licenseRepo.create(data);
    return this.licenseRepo.save(license);
  }

  async updateLicense(id: string, data: Partial<TemplateLicense>): Promise<TemplateLicense> {
    await this.licenseRepo.update(id, data);
    return this.licenseRepo.findOne({ where: { id }, relations: ['template', 'user'] });
  }

  // --- Demos ---

  async findDemosByTemplate(templateId: string): Promise<TemplateDemo[]> {
    return this.demoRepo.find({
      where: { templateId },
      order: { sortOrder: 'ASC' },
    });
  }

  async createDemo(data: Partial<TemplateDemo>): Promise<TemplateDemo> {
    const demo = this.demoRepo.create(data);
    return this.demoRepo.save(demo);
  }

  async updateDemo(id: string, data: Partial<TemplateDemo>): Promise<TemplateDemo> {
    await this.demoRepo.update(id, data);
    return this.demoRepo.findOne({ where: { id } });
  }

  async deleteDemo(id: string): Promise<void> {
    await this.demoRepo.delete(id);
  }

  // --- Cursor helpers ---

  private encodeCursor(data: { value: any }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): { value: any } | null {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      return null;
    }
  }
}
