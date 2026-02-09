import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SellersRepository } from '../sellers.repository';
import { CacheService } from '../../../common/cache/cache.service';
import { SellerProfile, SellerStatus } from '../../../entities/seller-profile.entity';
import { UpdateSellerProfileDto } from '../dto/update-seller-profile.dto';
import { AdminUpdateSellerDto } from '../dto/admin-update-seller.dto';
import { SellerQueryDto } from '../dto/seller-query.dto';

@Injectable()
export class SellersService {
  private readonly logger = new Logger(SellersService.name);

  constructor(
    private readonly repository: SellersRepository,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(query: SellerQueryDto) {
    return this.repository.findAllSellers(query);
  }

  async findPublicSellers(query: SellerQueryDto) {
    return this.repository.findAllSellers({ ...query, status: SellerStatus.APPROVED });
  }

  async findBySlug(slug: string) {
    const seller = await this.repository.findSellerBySlug(slug);
    if (!seller) throw new NotFoundException('Seller not found');
    return seller;
  }

  async findById(id: string) {
    const seller = await this.repository.findSellerById(id);
    if (!seller) throw new NotFoundException('Seller not found');
    return seller;
  }

  async findByUserId(userId: string) {
    return this.repository.findSellerByUserId(userId);
  }

  async getMyProfile(userId: string) {
    const seller = await this.repository.findSellerByUserId(userId);
    if (!seller) throw new NotFoundException('You do not have a seller profile');
    return seller;
  }

  async updateMyProfile(userId: string, dto: UpdateSellerProfileDto) {
    const seller = await this.repository.findSellerByUserId(userId);
    if (!seller) throw new NotFoundException('You do not have a seller profile');

    if (dto.displayName && dto.displayName !== seller.displayName) {
      const slug = this.generateSlug(dto.displayName);
      const existing = await this.repository.findSellerBySlug(slug);
      if (existing && existing.id !== seller.id) {
        throw new ConflictException('A seller with this name already exists');
      }
      (dto as any).slug = slug;
    }

    const updated = await this.repository.updateSellerProfile(seller.id, dto as Partial<SellerProfile>);
    await this.cacheService.invalidateByTag('sellers').catch(() => {});
    return updated;
  }

  async adminUpdateSeller(sellerId: string, dto: AdminUpdateSellerDto) {
    const seller = await this.repository.findSellerById(sellerId);
    if (!seller) throw new NotFoundException('Seller not found');

    const updated = await this.repository.updateSellerProfile(sellerId, dto as Partial<SellerProfile>);
    await this.cacheService.invalidateByTag('sellers').catch(() => {});
    this.logger.log(`Admin updated seller ${sellerId}: ${JSON.stringify(dto)}`);
    return updated;
  }

  async suspendSeller(sellerId: string) {
    const seller = await this.findById(sellerId);
    if (seller.status === SellerStatus.SUSPENDED) {
      throw new BadRequestException('Seller is already suspended');
    }
    return this.repository.updateSellerProfile(sellerId, { status: SellerStatus.SUSPENDED });
  }

  async reinstateSeller(sellerId: string) {
    const seller = await this.findById(sellerId);
    if (seller.status !== SellerStatus.SUSPENDED) {
      throw new BadRequestException('Seller is not suspended');
    }
    return this.repository.updateSellerProfile(sellerId, { status: SellerStatus.APPROVED });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
