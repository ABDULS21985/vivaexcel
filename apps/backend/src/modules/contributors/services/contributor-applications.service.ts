import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContributorsRepository } from '../contributors.repository';
import { CacheService } from '../../../common/cache/cache.service';
import { ContributorApplicationStatus } from '../../../entities/contributor-application.entity';
import { User } from '../../../entities/user.entity';
import { CreateContributorApplicationDto } from '../dto/create-contributor-application.dto';
import { ReviewContributorApplicationDto, ReviewDecision } from '../dto/review-contributor-application.dto';
import { ContributorApplicationQueryDto } from '../dto/contributor-application-query.dto';

@Injectable()
export class ContributorApplicationsService {
  private readonly logger = new Logger(ContributorApplicationsService.name);

  constructor(
    private readonly repository: ContributorsRepository,
    private readonly cacheService: CacheService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(query: ContributorApplicationQueryDto) {
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

  async submitApplication(userId: string, dto: CreateContributorApplicationDto) {
    // Check for existing pending application
    const existing = await this.repository.findApplicationByUserId(userId);
    if (existing && existing.status === ContributorApplicationStatus.PENDING) {
      throw new ConflictException('You already have a pending application');
    }

    // Check if already an approved contributor
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user?.isCreator) {
      throw new ConflictException('You are already an approved contributor');
    }

    const application = await this.repository.createApplication({
      userId,
      ...dto,
    });

    this.logger.log(`Contributor application submitted by user ${userId}`);
    await this.cacheService.invalidateByTag('contributor_applications').catch(() => {});
    return application;
  }

  async reviewApplication(
    applicationId: string,
    reviewerId: string,
    dto: ReviewContributorApplicationDto,
  ) {
    const application = await this.findById(applicationId);

    if (application.status !== ContributorApplicationStatus.PENDING) {
      throw new BadRequestException('This application has already been reviewed');
    }

    const newStatus =
      dto.decision === ReviewDecision.APPROVE
        ? ContributorApplicationStatus.APPROVED
        : ContributorApplicationStatus.REJECTED;

    const updatedApp = await this.repository.updateApplication(applicationId, {
      status: newStatus,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNotes: dto.reviewNotes,
    });

    // If approved, set user as creator
    if (dto.decision === ReviewDecision.APPROVE) {
      await this.userRepo.update(application.userId, { isCreator: true });
      this.logger.log(`User ${application.userId} approved as contributor`);
    }

    await this.cacheService.invalidateByTag('contributor_applications').catch(() => {});
    return updatedApp;
  }
}
