import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolutionDocument } from '../../entities/solution-document.entity';
import { DocumentBundle } from '../../entities/document-bundle.entity';
import { DocumentUpdate } from '../../entities/document-update.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { SolutionDocumentQueryDto } from './dto/solution-document-query.dto';
import { PaginatedResponse } from '../../common/interfaces/response.interface';
import {
  DocumentStatus,
  Domain,
} from './enums/solution-document.enums';

@Injectable()
export class SolutionDocumentsRepository {
  constructor(
    @InjectRepository(SolutionDocument)
    private readonly documentRepository: Repository<SolutionDocument>,
    @InjectRepository(DocumentBundle)
    private readonly bundleRepository: Repository<DocumentBundle>,
    @InjectRepository(DocumentUpdate)
    private readonly updateRepository: Repository<DocumentUpdate>,
    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepository: Repository<DigitalProduct>,
  ) {}

  // ──────────────────────────────────────────────
  //  Solution document methods
  // ──────────────────────────────────────────────

  async findAll(query: SolutionDocumentQueryDto): Promise<PaginatedResponse<SolutionDocument>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      domain,
      documentType,
      cloudPlatform,
      complianceFramework,
      technology,
      maturityLevel,
      hasEditableDiagrams,
      templateFormat,
      isFeatured,
      minPageCount,
      maxPageCount,
      minPrice,
      maxPrice,
    } = query;

    const qb = this.documentRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.digitalProduct', 'digitalProduct')
      .leftJoinAndSelect('digitalProduct.creator', 'creator')
      .leftJoinAndSelect('digitalProduct.category', 'category');

    // Search across title and description
    if (search) {
      qb.andWhere(
        '(doc.title ILIKE :search OR doc.description ILIKE :search OR digitalProduct.title ILIKE :search OR digitalProduct.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Domain filter
    if (domain) {
      qb.andWhere('doc.domain = :domain', { domain });
    }

    // Document type filter
    if (documentType) {
      qb.andWhere('doc.documentType = :documentType', { documentType });
    }

    // Cloud platform filter (JSONB @> operator)
    if (cloudPlatform) {
      qb.andWhere('doc.cloudPlatform @> :cloudPlatform', {
        cloudPlatform: JSON.stringify([cloudPlatform]),
      });
    }

    // Compliance framework filter (JSONB @> operator)
    if (complianceFramework) {
      qb.andWhere('doc.complianceFrameworks @> :complianceFramework', {
        complianceFramework: JSON.stringify([complianceFramework]),
      });
    }

    // Technology filter (JSONB @> operator on technologyStack)
    if (technology) {
      qb.andWhere('doc.technologyStack @> :technology', {
        technology: JSON.stringify([technology]),
      });
    }

    // Maturity level filter
    if (maturityLevel) {
      qb.andWhere('doc.maturityLevel = :maturityLevel', { maturityLevel });
    }

    // Editable diagrams filter
    if (hasEditableDiagrams !== undefined) {
      qb.andWhere('doc.hasEditableDiagrams = :hasEditableDiagrams', { hasEditableDiagrams });
    }

    // Template format filter (JSONB @> operator)
    if (templateFormat) {
      qb.andWhere('doc.templateFormat @> :templateFormat', {
        templateFormat: JSON.stringify([templateFormat]),
      });
    }

    // Featured filter (from digital product)
    if (isFeatured !== undefined) {
      qb.andWhere('digitalProduct.isFeatured = :isFeatured', { isFeatured });
    }

    // Page count range
    if (minPageCount !== undefined && maxPageCount !== undefined) {
      qb.andWhere('doc.pageCount BETWEEN :minPageCount AND :maxPageCount', {
        minPageCount,
        maxPageCount,
      });
    } else if (minPageCount !== undefined) {
      qb.andWhere('doc.pageCount >= :minPageCount', { minPageCount });
    } else if (maxPageCount !== undefined) {
      qb.andWhere('doc.pageCount <= :maxPageCount', { maxPageCount });
    }

    // Digital product price filters
    if (minPrice !== undefined && maxPrice !== undefined) {
      qb.andWhere('digitalProduct.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });
    } else if (minPrice !== undefined) {
      qb.andWhere('digitalProduct.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      qb.andWhere('digitalProduct.price <= :maxPrice', { maxPrice });
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortOrder === 'DESC') {
        qb.andWhere(`doc.${sortBy} < :cursorValue`, { cursorValue: decodedCursor.value });
      } else {
        qb.andWhere(`doc.${sortBy} > :cursorValue`, { cursorValue: decodedCursor.value });
      }
    }

    // Order and limit
    qb.orderBy(`doc.${sortBy}`, sortOrder);
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const nextCursor = hasNextPage && items.length > 0
      ? this.encodeCursor({ value: (items[items.length - 1] as unknown as Record<string, unknown>)[sortBy] })
      : undefined;

    return {
      items,
      meta: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor,
        previousCursor: cursor,
      },
    };
  }

  async findById(id: string): Promise<SolutionDocument | null> {
    return this.documentRepository.findOne({
      where: { id },
      relations: [
        'digitalProduct',
        'digitalProduct.creator',
        'digitalProduct.category',
        'digitalProduct.tags',
      ],
    });
  }

  async findBySlug(slug: string): Promise<SolutionDocument | null> {
    return this.documentRepository.findOne({
      where: { slug },
      relations: [
        'digitalProduct',
        'digitalProduct.creator',
        'digitalProduct.category',
        'digitalProduct.tags',
      ],
    });
  }

  async findByProductId(digitalProductId: string): Promise<SolutionDocument | null> {
    return this.documentRepository.findOne({
      where: { digitalProductId },
      relations: [
        'digitalProduct',
        'digitalProduct.creator',
        'digitalProduct.category',
      ],
    });
  }

  async create(data: Partial<SolutionDocument>): Promise<SolutionDocument> {
    const document = this.documentRepository.create(data);
    return this.documentRepository.save(document);
  }

  async update(id: string, data: Partial<SolutionDocument>): Promise<SolutionDocument | null> {
    const document = await this.findById(id);
    if (!document) return null;

    Object.assign(document, data);
    return this.documentRepository.save(document);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.documentRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  // ──────────────────────────────────────────────
  //  Featured & discovery methods
  // ──────────────────────────────────────────────

  async findFeatured(limit: number = 10): Promise<SolutionDocument[]> {
    return this.documentRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.digitalProduct', 'digitalProduct')
      .leftJoinAndSelect('digitalProduct.creator', 'creator')
      .where('doc.status = :status', { status: DocumentStatus.PUBLISHED })
      .orderBy('doc.lastUpdated', 'DESC')
      .take(limit)
      .getMany();
  }

  async findByDomain(domain: string, limit: number = 10): Promise<SolutionDocument[]> {
    return this.documentRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.digitalProduct', 'digitalProduct')
      .leftJoinAndSelect('digitalProduct.creator', 'creator')
      .where('doc.domain = :domain', { domain })
      .andWhere('doc.status = :status', { status: DocumentStatus.PUBLISHED })
      .orderBy('doc.lastUpdated', 'DESC')
      .take(limit)
      .getMany();
  }

  async findByType(type: string, limit: number = 10): Promise<SolutionDocument[]> {
    return this.documentRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.digitalProduct', 'digitalProduct')
      .leftJoinAndSelect('digitalProduct.creator', 'creator')
      .where('doc.documentType = :type', { type })
      .andWhere('doc.status = :status', { status: DocumentStatus.PUBLISHED })
      .orderBy('doc.lastUpdated', 'DESC')
      .take(limit)
      .getMany();
  }

  // ──────────────────────────────────────────────
  //  Stats methods
  // ──────────────────────────────────────────────

  async countByDomain(): Promise<{ domain: string; count: number }[]> {
    const results = await this.documentRepository
      .createQueryBuilder('doc')
      .select('doc.domain', 'domain')
      .addSelect('COUNT(doc.id)', 'count')
      .where('doc.status = :status', { status: DocumentStatus.PUBLISHED })
      .groupBy('doc.domain')
      .orderBy('count', 'DESC')
      .getRawMany();

    return results.map((row) => ({
      domain: row.domain,
      count: parseInt(row.count, 10),
    }));
  }

  async countByType(): Promise<{ documentType: string; count: number }[]> {
    const results = await this.documentRepository
      .createQueryBuilder('doc')
      .select('doc.document_type', 'documentType')
      .addSelect('COUNT(doc.id)', 'count')
      .where('doc.status = :status', { status: DocumentStatus.PUBLISHED })
      .groupBy('doc.document_type')
      .orderBy('count', 'DESC')
      .getRawMany();

    return results.map((row) => ({
      documentType: row.documentType,
      count: parseInt(row.count, 10),
    }));
  }

  // ──────────────────────────────────────────────
  //  Freshness score
  // ──────────────────────────────────────────────

  /**
   * Calculate freshness score (0-100) based on lastUpdated and domain velocity.
   * Tech domains like AI_ML deprecate faster (90 days = stale),
   * infrastructure domains slower (365 days = stale).
   */
  calculateFreshnessScore(document: SolutionDocument): number {
    const now = new Date();
    const lastUpdated = document.lastUpdated ? new Date(document.lastUpdated) : new Date(document.createdAt);
    const daysSinceUpdate = Math.floor(
      (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Domain-specific staleness thresholds (days until considered fully stale)
    const domainVelocity: Record<string, number> = {
      [Domain.AI_ML]: 90,
      [Domain.DEVOPS]: 120,
      [Domain.CYBERSECURITY]: 120,
      [Domain.MICROSERVICES]: 150,
      [Domain.MOBILE]: 150,
      [Domain.ECOMMERCE]: 180,
      [Domain.DATA_ANALYTICS]: 180,
      [Domain.APPLICATION_MODERNIZATION]: 240,
      [Domain.CLOUD_INFRASTRUCTURE]: 270,
      [Domain.IOT]: 240,
      [Domain.BLOCKCHAIN]: 180,
      [Domain.CRM]: 300,
      [Domain.ERP]: 365,
    };

    const staleDays = domainVelocity[document.domain] || 270;

    if (daysSinceUpdate >= staleDays) {
      return 0;
    }

    // Linear decay from 100 to 0 over the staleness period
    const score = Math.round(100 * (1 - daysSinceUpdate / staleDays));
    return Math.max(0, Math.min(100, score));
  }

  // ──────────────────────────────────────────────
  //  Bundle methods
  // ──────────────────────────────────────────────

  async findAllBundles(query: { limit?: number; status?: DocumentStatus }): Promise<DocumentBundle[]> {
    const qb = this.bundleRepository
      .createQueryBuilder('bundle')
      .leftJoinAndSelect('bundle.documents', 'documents')
      .leftJoinAndSelect('documents.digitalProduct', 'digitalProduct');

    if (query.status) {
      qb.andWhere('bundle.status = :status', { status: query.status });
    }

    qb.orderBy('bundle.createdAt', 'DESC');

    if (query.limit) {
      qb.take(query.limit);
    }

    return qb.getMany();
  }

  async findBundleById(id: string): Promise<DocumentBundle | null> {
    return this.bundleRepository.findOne({
      where: { id },
      relations: ['documents', 'documents.digitalProduct'],
    });
  }

  async findBundleBySlug(slug: string): Promise<DocumentBundle | null> {
    return this.bundleRepository.findOne({
      where: { slug },
      relations: ['documents', 'documents.digitalProduct'],
    });
  }

  async createBundle(data: Partial<DocumentBundle>): Promise<DocumentBundle> {
    const bundle = this.bundleRepository.create(data);
    return this.bundleRepository.save(bundle);
  }

  async updateBundle(id: string, data: Partial<DocumentBundle>): Promise<DocumentBundle | null> {
    const bundle = await this.findBundleById(id);
    if (!bundle) return null;

    Object.assign(bundle, data);
    return this.bundleRepository.save(bundle);
  }

  async deleteBundle(id: string): Promise<boolean> {
    const result = await this.bundleRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }

  /**
   * Calculate savings for a bundle by summing individual document prices
   * and comparing against the bundle price.
   */
  async calculateBundleSavings(bundlePrice: number, documentIds: string[]): Promise<{
    individualTotal: number;
    bundlePrice: number;
    savings: number;
    savingsPercent: number;
  }> {
    if (documentIds.length === 0) {
      return { individualTotal: 0, bundlePrice, savings: 0, savingsPercent: 0 };
    }

    const result = await this.documentRepository
      .createQueryBuilder('doc')
      .select('SUM(doc.price)', 'total')
      .where('doc.id IN (:...documentIds)', { documentIds })
      .getRawOne();

    const individualTotal = parseFloat(result?.total) || 0;
    const savings = Math.max(0, individualTotal - bundlePrice);
    const savingsPercent = individualTotal > 0
      ? Math.round((savings / individualTotal) * 100)
      : 0;

    return {
      individualTotal,
      bundlePrice,
      savings,
      savingsPercent,
    };
  }

  // ──────────────────────────────────────────────
  //  Document update methods
  // ──────────────────────────────────────────────

  async findUpdates(documentId: string): Promise<DocumentUpdate[]> {
    return this.updateRepository.find({
      where: { documentId },
      order: { createdAt: 'DESC' },
    });
  }

  async createUpdate(data: Partial<DocumentUpdate>): Promise<DocumentUpdate> {
    const update = this.updateRepository.create(data);
    return this.updateRepository.save(update);
  }

  // ──────────────────────────────────────────────
  //  Cursor helpers
  // ──────────────────────────────────────────────

  private encodeCursor(data: { value: any }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): { value: any } {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      return { value: null };
    }
  }
}
