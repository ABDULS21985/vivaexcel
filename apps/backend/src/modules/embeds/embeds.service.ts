import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product, ProductStatus } from '../../entities/product.entity';
import { ProductCategory } from '../../entities/product-category.entity';
import { EmbedConfig } from './interfaces/embed-config.interface';
import { EmbedWidgetType, EmbedTheme } from './enums/embed.enums';

/** CDN URL for the embed script */
const EMBED_SCRIPT_URL = 'https://cdn.ktblog.com/embed.js';

/** Base URL for embed previews */
const EMBED_PREVIEW_BASE_URL = 'https://cdn.ktblog.com/embed/preview';

/** Default accent color */
const DEFAULT_ACCENT_COLOR = '#1E4DB7';

/** Default theme */
const DEFAULT_THEME = EmbedTheme.LIGHT;

/** Default product count for grids */
const DEFAULT_GRID_COUNT = 4;

@Injectable()
export class EmbedsService {
  private readonly logger = new Logger(EmbedsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  // ---------------------------------------------------------------------------
  // Embed Code Generation
  // ---------------------------------------------------------------------------

  /**
   * Generate an HTML embed code snippet based on the provided configuration.
   * Returns the HTML string and a preview URL.
   */
  generateEmbedCode(config: EmbedConfig): { html: string; preview: string } {
    const html = this.buildEmbedHtml(config);
    const preview = this.generatePreviewUrl(config);

    this.logger.debug(
      `Generated embed code for type="${config.type}", product="${config.productSlug || config.productId || 'N/A'}"`,
    );

    return { html, preview };
  }

  /**
   * Generate a preview URL for the embed configuration.
   */
  generatePreviewUrl(config: EmbedConfig): string {
    const params = new URLSearchParams();
    params.set('type', config.type);
    params.set('key', config.apiKey);

    if (config.productId) {
      params.set('productId', config.productId);
    }
    if (config.productSlug) {
      params.set('product', config.productSlug);
    }
    if (config.categorySlug) {
      params.set('category', config.categorySlug);
    }
    if (config.count) {
      params.set('count', String(config.count));
    }
    if (config.theme) {
      params.set('theme', config.theme);
    }
    if (config.accentColor) {
      params.set('accent', config.accentColor);
    }
    if (config.borderRadius !== undefined) {
      params.set('radius', String(config.borderRadius));
    }
    if (config.fontFamily) {
      params.set('font', config.fontFamily);
    }
    if (config.locale) {
      params.set('locale', config.locale);
    }

    return `${EMBED_PREVIEW_BASE_URL}?${params.toString()}`;
  }

  // ---------------------------------------------------------------------------
  // Product Data for Embeds
  // ---------------------------------------------------------------------------

  /**
   * Get minimal product data for embed rendering.
   * Accepts either a UUID or a slug.
   */
  async getProductDataForEmbed(
    slugOrId: string,
  ): Promise<Record<string, unknown>> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        slugOrId,
      );

    let product: Product | null;

    if (isUuid) {
      product = await this.productRepository.findOne({
        where: { id: slugOrId, status: ProductStatus.ACTIVE },
        relations: ['category'],
      });
    } else {
      product = await this.productRepository.findOne({
        where: { slug: slugOrId, status: ProductStatus.ACTIVE },
        relations: ['category'],
      });
    }

    if (!product) {
      throw new NotFoundException(
        `Product "${slugOrId}" not found or not active`,
      );
    }

    return this.mapProductToEmbedPayload(product);
  }

  /**
   * Get a list of products for a grid embed.
   * Optionally filtered by category slug.
   */
  async getProductsForGrid(
    categorySlug?: string,
    count?: number,
  ): Promise<Record<string, unknown>[]> {
    const take = count ?? DEFAULT_GRID_COUNT;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .orderBy('product.is_featured', 'DESC')
      .addOrderBy('product.created_at', 'DESC')
      .take(take);

    if (categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    const products = await qb.getMany();

    return products.map((p) => this.mapProductToEmbedPayload(p));
  }

  // ---------------------------------------------------------------------------
  // Private: HTML Generation
  // ---------------------------------------------------------------------------

  /**
   * Build the complete HTML embed snippet with script tag and widget div.
   */
  private buildEmbedHtml(config: EmbedConfig): string {
    const dataAttributes = this.buildDataAttributes(config);
    const divAttributes = dataAttributes
      .map(([key, value]) => `  ${key}="${this.escapeHtml(value)}"`)
      .join('\n');

    const html = [
      `<!-- KTBlog Embed Widget -->`,
      `<script src="${EMBED_SCRIPT_URL}" defer></script>`,
      `<div`,
      divAttributes,
      `></div>`,
    ].join('\n');

    return html;
  }

  /**
   * Build data-attribute key-value pairs based on widget type and config.
   */
  private buildDataAttributes(
    config: EmbedConfig,
  ): [string, string][] {
    const attrs: [string, string][] = [];

    // Widget type
    attrs.push(['data-ktblog-widget', config.type]);

    // API key
    attrs.push(['data-ktblog-key', config.apiKey]);

    // Product identifier (for single-product widgets)
    if (
      config.type === EmbedWidgetType.PRODUCT_CARD ||
      config.type === EmbedWidgetType.BUY_BUTTON
    ) {
      if (config.productSlug) {
        attrs.push(['data-ktblog-product', config.productSlug]);
      } else if (config.productId) {
        attrs.push(['data-ktblog-product-id', config.productId]);
      }
    }

    // Grid-specific attributes
    if (config.type === EmbedWidgetType.PRODUCT_GRID) {
      if (config.categorySlug) {
        attrs.push(['data-ktblog-category', config.categorySlug]);
      }
      if (config.count) {
        attrs.push(['data-ktblog-count', String(config.count)]);
      }
    }

    // Theme and styling
    const theme = config.theme ?? DEFAULT_THEME;
    attrs.push(['data-ktblog-theme', theme]);

    if (config.accentColor) {
      attrs.push(['data-ktblog-accent', config.accentColor]);
    }

    if (config.borderRadius !== undefined) {
      attrs.push(['data-ktblog-radius', String(config.borderRadius)]);
    }

    if (config.fontFamily) {
      attrs.push(['data-ktblog-font', config.fontFamily]);
    }

    if (config.locale) {
      attrs.push(['data-ktblog-locale', config.locale]);
    }

    return attrs;
  }

  // ---------------------------------------------------------------------------
  // Private: Data Mapping
  // ---------------------------------------------------------------------------

  /**
   * Map a Product entity to a minimal embed payload suitable for
   * client-side rendering.
   */
  private mapProductToEmbedPayload(
    product: Product,
  ): Record<string, unknown> {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? null,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      featuredImage: product.featuredImage ?? null,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,
      isFeatured: product.isFeatured,
    };
  }

  // ---------------------------------------------------------------------------
  // Private: Utilities
  // ---------------------------------------------------------------------------

  /**
   * Escape HTML special characters to prevent XSS in generated embed code.
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
