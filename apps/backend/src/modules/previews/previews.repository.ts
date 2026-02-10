import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DigitalProductPreview,
  DigitalProductPreviewType,
} from '../../entities/digital-product-preview.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';

@Injectable()
export class PreviewsRepository {
  constructor(
    @InjectRepository(DigitalProductPreview)
    private readonly previewRepository: Repository<DigitalProductPreview>,
    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepository: Repository<DigitalProduct>,
  ) {}

  // ──────────────────────────────────────────────
  //  Preview methods
  // ──────────────────────────────────────────────

  async findByProductId(
    productId: string,
    type?: DigitalProductPreviewType,
  ): Promise<DigitalProductPreview[]> {
    const where: Record<string, unknown> = { productId };
    if (type) {
      where.type = type;
    }

    return this.previewRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(
    data: Partial<DigitalProductPreview>,
  ): Promise<DigitalProductPreview> {
    const preview = this.previewRepository.create(data);
    return this.previewRepository.save(preview);
  }

  async bulkCreate(
    previews: Partial<DigitalProductPreview>[],
  ): Promise<DigitalProductPreview[]> {
    const entities = this.previewRepository.create(previews);
    return this.previewRepository.save(entities);
  }

  async update(
    id: string,
    data: Partial<DigitalProductPreview>,
  ): Promise<DigitalProductPreview | null> {
    const preview = await this.previewRepository.findOne({ where: { id } });
    if (!preview) return null;

    Object.assign(preview, data);
    return this.previewRepository.save(preview);
  }

  async deleteByProductId(productId: string): Promise<number> {
    const result = await this.previewRepository.delete({ productId });
    return result.affected ?? 0;
  }

  async findProduct(productId: string): Promise<DigitalProduct | null> {
    return this.digitalProductRepository.findOne({
      where: { id: productId },
      relations: ['files', 'previews'],
    });
  }
}
