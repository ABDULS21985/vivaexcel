import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { VolumeDiscount, VolumeDiscountApplicableTo } from '../entities/volume-discount.entity';
import { CreateVolumeDiscountDto } from '../dto/create-volume-discount.dto';
import { CacheService } from '../../../common/cache/cache.service';
import { ApiResponse } from '../../../common/interfaces/response.interface';

const CACHE_TAG = 'volume-discounts';

@Injectable()
export class VolumeDiscountService {
  private readonly logger = new Logger(VolumeDiscountService.name);

  constructor(
    @InjectRepository(VolumeDiscount)
    private readonly discountRepository: Repository<VolumeDiscount>,
    private readonly cacheService: CacheService,
  ) {}

  // ──────────────────────────────────────────────
  //  Get discount tiers
  // ──────────────────────────────────────────────

  async getDiscountTiers(): Promise<ApiResponse<VolumeDiscount[]>> {
    const cacheKey = this.cacheService.generateKey(CACHE_TAG, 'tiers');

    const tiers = await this.cacheService.wrap(
      cacheKey,
      () =>
        this.discountRepository.find({
          where: { isActive: true },
          order: { minQuantity: 'ASC' },
        }),
      { ttl: 600, tags: [CACHE_TAG] },
    );

    return {
      status: 'success',
      message: 'Volume discount tiers retrieved',
      data: tiers,
    };
  }

  // ──────────────────────────────────────────────
  //  Get applicable discount for quantity
  // ──────────────────────────────────────────────

  async getApplicableDiscount(
    quantity: number,
    productId?: string,
  ): Promise<VolumeDiscount | null> {
    const qb = this.discountRepository
      .createQueryBuilder('vd')
      .where('vd.is_active = :active', { active: true })
      .andWhere('vd.min_quantity <= :quantity', { quantity })
      .andWhere('(vd.max_quantity IS NULL OR vd.max_quantity >= :quantity)', { quantity })
      .orderBy('vd.discount_percentage', 'DESC');

    if (productId) {
      qb.andWhere(
        `(vd.applicable_to = :all OR (vd.applicable_to = :specificProducts AND vd.applicable_ids @> :productIds))`,
        {
          all: VolumeDiscountApplicableTo.ALL,
          specificProducts: VolumeDiscountApplicableTo.SPECIFIC_PRODUCTS,
          productIds: JSON.stringify([productId]),
        },
      );
    }

    return qb.getOne();
  }

  // ──────────────────────────────────────────────
  //  Calculate volume price
  // ──────────────────────────────────────────────

  async calculateVolumePrice(
    unitPrice: number,
    quantity: number,
    productId?: string,
  ): Promise<ApiResponse<{
    unitPrice: number;
    quantity: number;
    discountPercentage: number;
    discountedUnitPrice: number;
    totalPrice: number;
    savings: number;
  }>> {
    const discount = await this.getApplicableDiscount(quantity, productId);
    const discountPercentage = discount ? Number(discount.discountPercentage) : 0;
    const discountedUnitPrice = unitPrice * (1 - discountPercentage / 100);
    const totalPrice = discountedUnitPrice * quantity;
    const savings = (unitPrice * quantity) - totalPrice;

    return {
      status: 'success',
      message: 'Volume price calculated',
      data: {
        unitPrice,
        quantity,
        discountPercentage,
        discountedUnitPrice: Math.round(discountedUnitPrice * 100) / 100,
        totalPrice: Math.round(totalPrice * 100) / 100,
        savings: Math.round(savings * 100) / 100,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Create discount tier (admin)
  // ──────────────────────────────────────────────

  async createDiscount(
    dto: CreateVolumeDiscountDto,
  ): Promise<ApiResponse<VolumeDiscount>> {
    const discount = this.discountRepository.create({
      ...dto,
      applicableTo: dto.applicableTo || VolumeDiscountApplicableTo.ALL,
      applicableIds: dto.applicableIds || [],
      isActive: dto.isActive ?? true,
    });

    const saved = await this.discountRepository.save(discount);
    await this.cacheService.invalidateByTags([CACHE_TAG]);

    this.logger.log(
      `Volume discount created: ${dto.minQuantity}-${dto.maxQuantity || '∞'} → ${dto.discountPercentage}%`,
    );

    return {
      status: 'success',
      message: 'Volume discount created',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Update discount tier (admin)
  // ──────────────────────────────────────────────

  async updateDiscount(
    id: string,
    dto: Partial<CreateVolumeDiscountDto>,
  ): Promise<ApiResponse<VolumeDiscount>> {
    const discount = await this.discountRepository.findOne({ where: { id } });
    if (!discount) {
      throw new NotFoundException('Volume discount not found');
    }

    Object.assign(discount, dto);
    const saved = await this.discountRepository.save(discount);
    await this.cacheService.invalidateByTags([CACHE_TAG]);

    return {
      status: 'success',
      message: 'Volume discount updated',
      data: saved,
    };
  }
}
