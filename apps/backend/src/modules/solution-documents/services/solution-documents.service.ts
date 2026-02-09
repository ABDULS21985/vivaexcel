import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SolutionDocumentsRepository } from '../solution-documents.repository';
import { AiService } from '../../ai/ai.service';
import { CacheService } from '../../../common/cache/cache.service';
import { CreateSolutionDocumentDto } from '../dto/create-solution-document.dto';
import { UpdateSolutionDocumentDto } from '../dto/update-solution-document.dto';
import { SolutionDocumentQueryDto } from '../dto/solution-document-query.dto';
import { CreateDocumentBundleDto } from '../dto/create-document-bundle.dto';
import { UpdateDocumentBundleDto } from '../dto/update-document-bundle.dto';
import { CreateDocumentUpdateDto } from '../dto/create-document-update.dto';
import { SolutionDocument, TableOfContentsItem } from '../../../entities/solution-document.entity';
import { DocumentBundle } from '../../../entities/document-bundle.entity';
import { DocumentUpdate } from '../../../entities/document-update.entity';
import { PaginatedResponse, ApiResponse } from '../../../common/interfaces/response.interface';
import { DocumentStatus } from '../enums/solution-document.enums';

// Cache constants
const CACHE_TTL_LIST = 300; // 5 minutes
const CACHE_TTL_SINGLE = 600; // 10 minutes
const CACHE_TAG = 'solution-documents';

@Injectable()
export class SolutionDocumentsService {
  private readonly logger = new Logger(SolutionDocumentsService.name);

  constructor(
    private readonly repository: SolutionDocumentsRepository,
    private readonly cacheService: CacheService,
    private readonly aiService: AiService,
  ) {}

  // ──────────────────────────────────────────────
  //  Document CRUD
  // ──────────────────────────────────────────────

  async findAll(query: SolutionDocumentQueryDto): Promise<ApiResponse<PaginatedResponse<SolutionDocument>>> {
    const cacheKey = this.cacheService.generateKey('solution-documents', 'list', query);

    const result = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findAll(query),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Solution documents retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async findById(id: string): Promise<ApiResponse<SolutionDocument>> {
    const cacheKey = this.cacheService.generateKey('solution-documents', 'id', id);

    const document = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findById(id),
      { ttl: CACHE_TTL_SINGLE, tags: [CACHE_TAG, `solution-document:${id}`] },
    );

    if (!document) {
      throw new NotFoundException(`Solution document with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Solution document retrieved successfully',
      data: document,
    };
  }

  async findBySlug(slug: string): Promise<ApiResponse<SolutionDocument>> {
    const cacheKey = this.cacheService.generateKey('solution-documents', 'slug', slug);

    const document = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findBySlug(slug),
      { ttl: CACHE_TTL_SINGLE, tags: [CACHE_TAG, `solution-document:slug:${slug}`] },
    );

    if (!document) {
      throw new NotFoundException(`Solution document with slug "${slug}" not found`);
    }

    return {
      status: 'success',
      message: 'Solution document retrieved successfully',
      data: document,
    };
  }

  async create(userId: string, dto: CreateSolutionDocumentDto): Promise<ApiResponse<SolutionDocument>> {
    const document = await this.repository.create({
      ...dto,
      createdBy: userId,
    } as Partial<SolutionDocument>);

    // Invalidate cache
    await this.cacheService.invalidateByTag(CACHE_TAG);
    this.logger.debug('Invalidated solution-documents cache after create');

    return {
      status: 'success',
      message: 'Solution document created successfully',
      data: document,
    };
  }

  async update(id: string, dto: UpdateSolutionDocumentDto): Promise<ApiResponse<SolutionDocument>> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Solution document with ID "${id}" not found`);
    }

    const updated = await this.repository.update(id, dto as Partial<SolutionDocument>);

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `solution-document:${id}`,
      `solution-document:slug:${existing.slug}`,
    ]);
    this.logger.debug(`Invalidated solution-documents cache after update for document ${id}`);

    return {
      status: 'success',
      message: 'Solution document updated successfully',
      data: updated!,
    };
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const document = await this.repository.findById(id);
    if (!document) {
      throw new NotFoundException(`Solution document with ID "${id}" not found`);
    }

    await this.repository.softDelete(id);

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `solution-document:${id}`,
      `solution-document:slug:${document.slug}`,
    ]);
    this.logger.debug(`Invalidated solution-documents cache after delete for document ${id}`);

    return {
      status: 'success',
      message: 'Solution document deleted successfully',
      data: null,
    };
  }

  // ──────────────────────────────────────────────
  //  Featured & discovery
  // ──────────────────────────────────────────────

  async getFeatured(limit: number = 10): Promise<ApiResponse<SolutionDocument[]>> {
    const cacheKey = this.cacheService.generateKey('solution-documents', 'featured', limit);

    const documents = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findFeatured(limit),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Featured solution documents retrieved successfully',
      data: documents,
    };
  }

  async getByDomain(domain: string, limit: number = 10): Promise<ApiResponse<SolutionDocument[]>> {
    const cacheKey = this.cacheService.generateKey('solution-documents', 'domain', domain, limit);

    const documents = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findByDomain(domain, limit),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: `Solution documents for domain "${domain}" retrieved successfully`,
      data: documents,
    };
  }

  async getByType(type: string, limit: number = 10): Promise<ApiResponse<SolutionDocument[]>> {
    const cacheKey = this.cacheService.generateKey('solution-documents', 'type', type, limit);

    const documents = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findByType(type, limit),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: `Solution documents of type "${type}" retrieved successfully`,
      data: documents,
    };
  }

  async getDomainStats(): Promise<ApiResponse<{ domain: string; count: number }[]>> {
    const cacheKey = this.cacheService.generateKey('solution-documents', 'stats', 'domain');

    const stats = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.countByDomain(),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Domain statistics retrieved successfully',
      data: stats,
    };
  }

  async getTypeStats(): Promise<ApiResponse<{ documentType: string; count: number }[]>> {
    const cacheKey = this.cacheService.generateKey('solution-documents', 'stats', 'type');

    const stats = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.countByType(),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Type statistics retrieved successfully',
      data: stats,
    };
  }

  async getLandingPageData(): Promise<ApiResponse<{
    featured: SolutionDocument[];
    domainStats: { domain: string; count: number }[];
    typeStats: { documentType: string; count: number }[];
  }>> {
    const cacheKey = this.cacheService.generateKey('solution-documents', 'landing');

    const data = await this.cacheService.wrap(
      cacheKey,
      async () => {
        const [featured, domainStats, typeStats] = await Promise.all([
          this.repository.findFeatured(8),
          this.repository.countByDomain(),
          this.repository.countByType(),
        ]);

        return {
          featured,
          domainStats,
          typeStats,
        };
      },
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Landing page data retrieved successfully',
      data,
    };
  }

  // ──────────────────────────────────────────────
  //  Freshness score
  // ──────────────────────────────────────────────

  async calculateFreshnessScore(documentId: string): Promise<ApiResponse<{ score: number }>> {
    const document = await this.repository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Solution document with ID "${documentId}" not found`);
    }

    const score = this.repository.calculateFreshnessScore(document);

    return {
      status: 'success',
      message: 'Freshness score calculated successfully',
      data: { score },
    };
  }

  // ──────────────────────────────────────────────
  //  Bundle management
  // ──────────────────────────────────────────────

  async getAllBundles(status?: DocumentStatus): Promise<ApiResponse<DocumentBundle[]>> {
    const cacheKey = this.cacheService.generateKey('solution-documents', 'bundles', 'list', status || 'all');

    const bundles = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findAllBundles({ status }),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG, 'solution-bundles'] },
    );

    return {
      status: 'success',
      message: 'Document bundles retrieved successfully',
      data: bundles,
    };
  }

  async getBundleById(id: string): Promise<ApiResponse<DocumentBundle>> {
    const cacheKey = this.cacheService.generateKey('solution-documents', 'bundle', 'id', id);

    const bundle = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findBundleById(id),
      { ttl: CACHE_TTL_SINGLE, tags: [CACHE_TAG, 'solution-bundles', `solution-bundle:${id}`] },
    );

    if (!bundle) {
      throw new NotFoundException(`Document bundle with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Document bundle retrieved successfully',
      data: bundle,
    };
  }

  async getBundleBySlug(slug: string): Promise<ApiResponse<DocumentBundle>> {
    const cacheKey = this.cacheService.generateKey('solution-documents', 'bundle', 'slug', slug);

    const bundle = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findBundleBySlug(slug),
      { ttl: CACHE_TTL_SINGLE, tags: [CACHE_TAG, 'solution-bundles', `solution-bundle:slug:${slug}`] },
    );

    if (!bundle) {
      throw new NotFoundException(`Document bundle with slug "${slug}" not found`);
    }

    return {
      status: 'success',
      message: 'Document bundle retrieved successfully',
      data: bundle,
    };
  }

  async createBundle(userId: string, dto: CreateDocumentBundleDto): Promise<ApiResponse<DocumentBundle>> {
    const { documentIds, ...bundleData } = dto;

    // Fetch and validate all documents
    const documents: SolutionDocument[] = [];
    for (const docId of documentIds) {
      const doc = await this.repository.findById(docId);
      if (!doc) {
        throw new NotFoundException(`Solution document with ID "${docId}" not found`);
      }
      documents.push(doc);
    }

    // Calculate savings percentage
    const savings = await this.repository.calculateBundleSavings(dto.bundlePrice, documentIds);

    const bundle = await this.repository.createBundle({
      ...bundleData,
      savingsPercentage: savings.savingsPercent,
      documents,
    } as Partial<DocumentBundle>);

    await this.cacheService.invalidateByTags([CACHE_TAG, 'solution-bundles']);
    this.logger.debug('Invalidated solution-documents cache after bundle create');

    return {
      status: 'success',
      message: 'Document bundle created successfully',
      data: bundle,
    };
  }

  async updateBundle(id: string, dto: UpdateDocumentBundleDto): Promise<ApiResponse<DocumentBundle>> {
    const existing = await this.repository.findBundleById(id);
    if (!existing) {
      throw new NotFoundException(`Document bundle with ID "${id}" not found`);
    }

    const { documentIds, ...bundleData } = dto;

    let updateData: Partial<DocumentBundle> = { ...bundleData } as Partial<DocumentBundle>;

    // If documentIds provided, resolve them
    if (documentIds) {
      const documents: SolutionDocument[] = [];
      for (const docId of documentIds) {
        const doc = await this.repository.findById(docId);
        if (!doc) {
          throw new NotFoundException(`Solution document with ID "${docId}" not found`);
        }
        documents.push(doc);
      }
      updateData = { ...updateData, documents };
    }

    const updated = await this.repository.updateBundle(id, updateData);

    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      'solution-bundles',
      `solution-bundle:${id}`,
      `solution-bundle:slug:${existing.slug}`,
    ]);
    this.logger.debug(`Invalidated solution-documents cache after bundle update for ${id}`);

    return {
      status: 'success',
      message: 'Document bundle updated successfully',
      data: updated!,
    };
  }

  async addToBundle(bundleId: string, documentId: string): Promise<ApiResponse<DocumentBundle>> {
    const bundle = await this.repository.findBundleById(bundleId);
    if (!bundle) {
      throw new NotFoundException(`Document bundle with ID "${bundleId}" not found`);
    }

    const document = await this.repository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Solution document with ID "${documentId}" not found`);
    }

    // Check if already in bundle
    const alreadyExists = bundle.documents?.some((d) => d.id === documentId);
    if (alreadyExists) {
      return {
        status: 'success',
        message: 'Document is already in this bundle',
        data: bundle,
      };
    }

    // Add document to bundle
    bundle.documents = [...(bundle.documents || []), document];
    const updatedBundle = await this.repository.updateBundle(bundleId, { documents: bundle.documents } as any);

    // Recalculate savings
    if (updatedBundle && updatedBundle.documents) {
      const docIds = updatedBundle.documents.map((d) => d.id);
      const savings = await this.repository.calculateBundleSavings(Number(updatedBundle.bundlePrice), docIds);
      await this.repository.updateBundle(bundleId, { savingsPercentage: savings.savingsPercent });
    }

    await this.cacheService.invalidateByTags([CACHE_TAG, 'solution-bundles', `solution-bundle:${bundleId}`]);
    this.logger.debug(`Added document ${documentId} to bundle ${bundleId}`);

    const freshBundle = await this.repository.findBundleById(bundleId);

    return {
      status: 'success',
      message: 'Document added to bundle successfully',
      data: freshBundle!,
    };
  }

  async removeFromBundle(bundleId: string, documentId: string): Promise<ApiResponse<DocumentBundle>> {
    const bundle = await this.repository.findBundleById(bundleId);
    if (!bundle) {
      throw new NotFoundException(`Document bundle with ID "${bundleId}" not found`);
    }

    bundle.documents = (bundle.documents || []).filter((d) => d.id !== documentId);
    const updatedBundle = await this.repository.updateBundle(bundleId, { documents: bundle.documents } as any);

    // Recalculate savings
    if (updatedBundle && updatedBundle.documents) {
      const docIds = updatedBundle.documents.map((d) => d.id);
      const savings = await this.repository.calculateBundleSavings(Number(updatedBundle.bundlePrice), docIds);
      await this.repository.updateBundle(bundleId, { savingsPercentage: savings.savingsPercent });
    }

    await this.cacheService.invalidateByTags([CACHE_TAG, 'solution-bundles', `solution-bundle:${bundleId}`]);
    this.logger.debug(`Removed document ${documentId} from bundle ${bundleId}`);

    const freshBundle = await this.repository.findBundleById(bundleId);

    return {
      status: 'success',
      message: 'Document removed from bundle successfully',
      data: freshBundle!,
    };
  }

  async deleteBundle(id: string): Promise<ApiResponse<null>> {
    const bundle = await this.repository.findBundleById(id);
    if (!bundle) {
      throw new NotFoundException(`Document bundle with ID "${id}" not found`);
    }

    await this.repository.deleteBundle(id);

    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      'solution-bundles',
      `solution-bundle:${id}`,
      `solution-bundle:slug:${bundle.slug}`,
    ]);
    this.logger.debug(`Invalidated solution-documents cache after bundle delete for ${id}`);

    return {
      status: 'success',
      message: 'Document bundle deleted successfully',
      data: null,
    };
  }

  // ──────────────────────────────────────────────
  //  Version management
  // ──────────────────────────────────────────────

  async getDocumentUpdates(documentId: string): Promise<ApiResponse<DocumentUpdate[]>> {
    const document = await this.repository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Solution document with ID "${documentId}" not found`);
    }

    const cacheKey = this.cacheService.generateKey('solution-documents', 'updates', documentId);

    const updates = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findUpdates(documentId),
      { ttl: CACHE_TTL_SINGLE, tags: [CACHE_TAG, `solution-document:${documentId}:updates`] },
    );

    return {
      status: 'success',
      message: 'Document updates retrieved successfully',
      data: updates,
    };
  }

  async publishUpdate(documentId: string, dto: CreateDocumentUpdateDto): Promise<ApiResponse<DocumentUpdate>> {
    const document = await this.repository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Solution document with ID "${documentId}" not found`);
    }

    // Create the update record
    const update = await this.repository.createUpdate({
      documentId,
      version: dto.version,
      releaseNotes: dto.releaseNotes,
      fileId: dto.fileId,
    } as Partial<DocumentUpdate>);

    // Update the document's version and lastUpdated
    await this.repository.update(documentId, {
      version: dto.version,
      lastUpdated: new Date(),
    } as Partial<SolutionDocument>);

    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `solution-document:${documentId}`,
      `solution-document:${documentId}:updates`,
    ]);
    this.logger.debug(`Published update v${dto.version} for document ${documentId}`);

    return {
      status: 'success',
      message: 'Document update published successfully',
      data: update,
    };
  }

  // ──────────────────────────────────────────────
  //  AI-powered features
  // ──────────────────────────────────────────────

  async generateTableOfContents(documentId: string): Promise<ApiResponse<{ tableOfContents: Record<string, any> }>> {
    const document = await this.repository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Solution document with ID "${documentId}" not found`);
    }

    const prompt = `You are a technical documentation expert. Generate a structured table of contents for a ${document.documentType.replace(/_/g, ' ')} document with the following characteristics:
- Title: ${document.title}
- Domain: ${document.domain.replace(/_/g, ' ')}
- Description: ${document.description || 'N/A'}
- Technologies: ${document.technologyStack?.join(', ') || 'N/A'}
- Cloud Platforms: ${document.cloudPlatform?.join(', ') || 'N/A'}
- Compliance Frameworks: ${document.complianceFrameworks?.join(', ') || 'N/A'}
- Maturity Level: ${document.maturityLevel || 'N/A'}
- Page Count: ${document.pageCount || 'N/A'}

Return a JSON object representing the table of contents with numbered sections and subsections. Use this format:
{
  "sections": [
    { "number": "1", "title": "Section Title", "subsections": [{ "number": "1.1", "title": "Subsection Title" }] }
  ]
}

Return ONLY the JSON object, no markdown formatting, no code blocks.`;

    const text = await this.aiService.improveParagraph(prompt);

    let tableOfContents: Record<string, any>;
    try {
      const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      tableOfContents = JSON.parse(cleaned);
    } catch {
      this.logger.warn(`Failed to parse AI TOC response for document ${documentId}`);
      tableOfContents = { sections: [] };
    }

    // Update the document with the generated TOC
    await this.repository.update(documentId, { tableOfContents: tableOfContents as unknown as TableOfContentsItem[] });

    await this.cacheService.invalidateByTags([CACHE_TAG, `solution-document:${documentId}`]);
    this.logger.debug(`Generated TOC for document ${documentId}`);

    return {
      status: 'success',
      message: 'Table of contents generated successfully',
      data: { tableOfContents },
    };
  }

  async generateAiDescription(documentId: string): Promise<ApiResponse<SolutionDocument>> {
    const document = await this.repository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Solution document with ID "${documentId}" not found`);
    }

    const includes: string[] = [];
    if (document.includes?.editableTemplates) includes.push('editable templates');
    if (document.includes?.diagramFiles) includes.push('diagram source files');
    if (document.includes?.implementationChecklist) includes.push('implementation checklist');
    if (document.includes?.costEstimator) includes.push('cost estimator');

    const prompt = `Generate a compelling, detailed product description for a solution design document with the following characteristics:
- Title: ${document.title}
- Type: ${document.documentType.replace(/_/g, ' ')}
- Domain: ${document.domain.replace(/_/g, ' ')}
- Cloud platforms: ${document.cloudPlatform?.join(', ') || 'not specified'}
- Technology stack: ${document.technologyStack?.join(', ') || 'not specified'}
- Maturity level: ${document.maturityLevel}
- Page count: ${document.pageCount} pages
- Diagram count: ${document.diagramCount} diagrams
- Has editable diagrams: ${document.hasEditableDiagrams ? 'yes' : 'no'}
- Compliance frameworks: ${document.complianceFrameworks?.join(', ') || 'none'}
- Template formats: ${document.templateFormat?.join(', ') || 'not specified'}
- Includes: ${includes.length > 0 ? includes.join(', ') : 'standard package'}
${document.shortDescription ? `- Short description: ${document.shortDescription}` : ''}

Write a professional, engaging description (200-400 words) that highlights the value proposition, key features, and ideal use cases for IT architects and solution designers. The description should be SEO-friendly and appeal to enterprise professionals. Return only the description text, nothing else.`;

    const description = await this.aiService.improveParagraph(prompt);

    const updated = await this.repository.update(documentId, { description });

    await this.cacheService.invalidateByTags([CACHE_TAG, `solution-document:${documentId}`]);
    this.logger.debug(`Generated AI description for document ${documentId}`);

    return {
      status: 'success',
      message: 'AI description generated successfully',
      data: updated!,
    };
  }

  async suggestRelatedDocuments(documentId: string): Promise<ApiResponse<{ suggestions: string[] }>> {
    const document = await this.repository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Solution document with ID "${documentId}" not found`);
    }

    const content = `${document.title} - ${document.description || ''} - Domain: ${document.domain} - Technologies: ${document.technologyStack?.join(', ') || 'N/A'} - Cloud Platforms: ${document.cloudPlatform?.join(', ') || 'N/A'} - Type: ${document.documentType}`;

    const suggestions = await this.aiService.suggestRelatedTopics(content);

    return {
      status: 'success',
      message: 'Related document suggestions generated successfully',
      data: { suggestions },
    };
  }

  async generateSeoDescription(documentId: string): Promise<ApiResponse<{
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string[];
  }>> {
    const document = await this.repository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Solution document with ID "${documentId}" not found`);
    }

    const productTitle = document.digitalProduct?.title || document.title;
    const productDescription = document.digitalProduct?.description || document.description || '';

    const seoTitle = await this.aiService.generateTitleSuggestions(
      `${productTitle}. ${document.documentType.replace(/_/g, ' ')} for ${document.domain.replace(/_/g, ' ')} covering ${document.technologyStack?.join(', ') || 'various technologies'}.`,
    );

    const seoDescription = await this.aiService.generateMetaDescription(
      productTitle,
      `${productDescription} ${document.documentType.replace(/_/g, ' ')} for the ${document.domain.replace(/_/g, ' ')} domain. Covers ${document.cloudPlatform?.join(', ') || 'multiple platforms'}. Technologies: ${document.technologyStack?.join(', ') || 'various'}. ${document.pageCount ? `${document.pageCount} pages.` : ''}`,
    );

    const contentForTopics = `${productTitle} ${productDescription} ${document.documentType} ${document.domain} solution design document ${document.technologyStack?.join(' ') || ''}`;
    const analysis = await this.aiService.analyzeContent(contentForTopics);

    const result = {
      seoTitle: seoTitle[0] || productTitle,
      seoDescription,
      seoKeywords: analysis.keyTopics || [],
    };

    this.logger.debug(`Generated AI SEO metadata for document ${documentId}`);

    await this.cacheService.invalidateByTags([CACHE_TAG, `solution-document:${documentId}`]);

    return {
      status: 'success',
      message: 'SEO metadata generated successfully',
      data: result,
    };
  }

  async extractTechnologyStack(documentId: string): Promise<ApiResponse<{ technologies: string[] }>> {
    const document = await this.repository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Solution document with ID "${documentId}" not found`);
    }

    const prompt = `You are a technology expert. Analyze the following solution design document and extract all technologies, frameworks, tools, and platforms mentioned or implied:
- Title: ${document.title}
- Domain: ${document.domain.replace(/_/g, ' ')}
- Description: ${document.description || 'N/A'}
- Current technologies listed: ${document.technologyStack?.join(', ') || 'None'}
- Cloud platforms: ${document.cloudPlatform?.join(', ') || 'N/A'}
- Compliance frameworks: ${document.complianceFrameworks?.join(', ') || 'N/A'}
- Document type: ${document.documentType.replace(/_/g, ' ')}

Return a JSON array of technology strings. Include both explicitly mentioned and commonly associated technologies for this type of solution.
Return ONLY the JSON array, no markdown formatting, no code blocks. Example: ["Kubernetes", "Docker", "Terraform"]`;

    const text = await this.aiService.improveParagraph(prompt);

    let technologies: string[];
    try {
      const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      technologies = JSON.parse(cleaned);
      if (!Array.isArray(technologies)) {
        technologies = [];
      }
    } catch {
      this.logger.warn(`Failed to parse AI tech stack response for document ${documentId}`);
      technologies = document.technologyStack || [];
    }

    // Update the document with extracted technologies
    await this.repository.update(documentId, { technologyStack: technologies });

    await this.cacheService.invalidateByTags([CACHE_TAG, `solution-document:${documentId}`]);
    this.logger.debug(`Extracted technology stack for document ${documentId}`);

    return {
      status: 'success',
      message: 'Technology stack extracted successfully',
      data: { technologies },
    };
  }

  async analyzeDocument(documentId: string): Promise<ApiResponse<{
    document: SolutionDocument;
    seo: { seoTitle: string; seoDescription: string; seoKeywords: string[] };
    tableOfContents: Record<string, any>;
    technologies: string[];
    relatedSuggestions: string[];
    freshnessScore: number;
  }>> {
    const document = await this.repository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Solution document with ID "${documentId}" not found`);
    }

    // Run all AI analyses in parallel
    const [descriptionResult, tocResult, seoResult, techResult, relatedResult] = await Promise.all([
      this.generateAiDescription(documentId),
      this.generateTableOfContents(documentId),
      this.generateSeoDescription(documentId),
      this.extractTechnologyStack(documentId),
      this.suggestRelatedDocuments(documentId),
    ]);

    const freshnessScore = this.repository.calculateFreshnessScore(document);

    // Refetch the updated document
    const updatedDocument = await this.repository.findById(documentId);

    await this.cacheService.invalidateByTags([CACHE_TAG, `solution-document:${documentId}`]);
    this.logger.debug(`Full AI analysis completed for document ${documentId}`);

    return {
      status: 'success',
      message: 'Full AI analysis completed successfully',
      data: {
        document: updatedDocument ?? document,
        seo: seoResult.data ?? { seoTitle: '', seoDescription: '', seoKeywords: [] },
        tableOfContents: tocResult.data?.tableOfContents ?? {},
        technologies: techResult.data?.technologies ?? [],
        relatedSuggestions: relatedResult.data?.suggestions ?? [],
        freshnessScore,
      },
    };
  }
}
