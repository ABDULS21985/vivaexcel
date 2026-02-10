import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SellersRepository } from '../sellers.repository';
import { CacheService } from '../../../common/cache/cache.service';
import { SellerApplicationStatus } from '../../../entities/seller-application.entity';
import { SellerStatus } from '../../../entities/seller-profile.entity';
import { CreateSellerApplicationDto } from '../dto/create-seller-application.dto';
import { ReviewSellerApplicationDto, ReviewDecision } from '../dto/review-seller-application.dto';
import { ApplicationQueryDto } from '../dto/application-query.dto';

@Injectable()
export class SellerApplicationsService {
  private readonly logger = new Logger(SellerApplicationsService.name);

  constructor(
    private readonly repository: SellersRepository,
    private readonly cacheService: CacheService,
  ) { }

  async findAll(query: ApplicationQueryDto) {
    return this.repository.findAllApplications(query);
  }

  async findById(id: string) {
    const application = await this.repository.findApplicationById(id);
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async getMyApplication(userId: string) {
    return this.repository.findApplicationByUserId(userId);
  }

  async submitApplication(userId: string, dto: CreateSellerApplicationDto) {
    // Check for existing pending application
    const existing = await this.repository.findApplicationByUserId(userId);
    if (existing && existing.status === SellerApplicationStatus.PENDING) {
      throw new ConflictException('You already have a pending application');
    }

    // Check if already a seller
    const existingSeller = await this.repository.findSellerByUserId(userId);
    if (existingSeller && existingSeller.status === SellerStatus.APPROVED) {
      throw new ConflictException('You are already an approved seller');
    }

    const application = await this.repository.createApplication({
      userId,
      ...dto,
    });

    this.logger.log(`Seller application submitted by user ${userId}`);
    await this.cacheService.invalidateByTag('seller_applications').catch(() => { });
    return application;
  }

  async reviewApplication(
    applicationId: string,
    reviewerId: string,
    dto: ReviewSellerApplicationDto,
  ) {
    const application = await this.findById(applicationId);

    if (application.status !== SellerApplicationStatus.PENDING) {
      throw new BadRequestException('This application has already been reviewed');
    }

    const newStatus =
      dto.decision === ReviewDecision.APPROVE
        ? SellerApplicationStatus.APPROVED
        : SellerApplicationStatus.REJECTED;

    const updatedApp = await this.repository.updateApplication(applicationId, {
      status: newStatus,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNotes: dto.reviewNotes,
    });

    // If approved, create seller profile
    if (dto.decision === ReviewDecision.APPROVE) {
      const slug = this.generateSlug(application.displayName);
      await this.repository.createSellerProfile({
        userId: application.userId,
        displayName: application.displayName,
        slug,
        bio: application.bio,
        website: application.website,
        socialLinks: application.socialLinks,
        specialties: application.specialties,
        applicationNote: application.applicationNote,
        status: SellerStatus.APPROVED,
      });
      this.logger.log(`Seller profile created for user ${application.userId} after approval`);
    }

    await this.cacheService.invalidateByTag('seller_applications').catch(() => { });
    await this.cacheService.invalidateByTag('sellers').catch(() => { });

    return updatedApp;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
