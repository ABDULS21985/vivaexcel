import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { TeamMember, TeamMemberRole } from '../entities/team-member.entity';
import { SharedLibraryItem } from '../entities/shared-library-item.entity';
import { AddToLibraryDto } from '../dto/add-to-library.dto';
import { TeamQueryDto } from '../dto/team-query.dto';
import { CacheService } from '../../../common/cache/cache.service';
import { ApiResponse } from '../../../common/interfaces/response.interface';

const CACHE_TAG = 'teams';

@Injectable()
export class SharedLibraryService {
  private readonly logger = new Logger(SharedLibraryService.name);

  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly memberRepository: Repository<TeamMember>,
    @InjectRepository(SharedLibraryItem)
    private readonly libraryRepository: Repository<SharedLibraryItem>,
    private readonly cacheService: CacheService,
  ) {}

  // ──────────────────────────────────────────────
  //  Add to library
  // ──────────────────────────────────────────────

  async addToLibrary(
    teamId: string,
    userId: string,
    dto: AddToLibraryDto,
  ): Promise<ApiResponse<SharedLibraryItem>> {
    const team = await this.teamRepository.findOne({ where: { id: teamId, isActive: true } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!team.sharedLibraryEnabled) {
      throw new BadRequestException('Shared library is not enabled for this team');
    }

    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (
      !member ||
      ![TeamMemberRole.OWNER, TeamMemberRole.ADMIN, TeamMemberRole.MANAGER].includes(member.role)
    ) {
      throw new ForbiddenException('Only owners, admins, and managers can add to the library');
    }

    // Check if product already in library
    const existing = await this.libraryRepository.findOne({
      where: { teamId, digitalProductId: dto.digitalProductId },
    });
    if (existing) {
      throw new BadRequestException('Product is already in the team library');
    }

    const item = this.libraryRepository.create({
      teamId,
      digitalProductId: dto.digitalProductId,
      addedBy: member.id,
      licenseId: dto.licenseId || null,
      notes: dto.notes || null,
      tags: dto.tags || [],
    });

    const saved = await this.libraryRepository.save(item);

    await this.cacheService.invalidateByTags([
      `${CACHE_TAG}:${teamId}:library`,
      `${CACHE_TAG}:${teamId}:stats`,
    ]);

    this.logger.log(`Product ${dto.digitalProductId} added to team ${teamId} library`);

    return {
      status: 'success',
      message: 'Product added to team library',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Get library
  // ──────────────────────────────────────────────

  async getLibrary(
    teamId: string,
    userId: string,
    query: TeamQueryDto,
  ): Promise<ApiResponse<SharedLibraryItem[]>> {
    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    const limit = query.limit || 20;
    const qb = this.libraryRepository
      .createQueryBuilder('sli')
      .leftJoinAndSelect('sli.digitalProduct', 'dp')
      .where('sli.team_id = :teamId', { teamId })
      .orderBy('sli.created_at', 'DESC')
      .take(limit);

    if (query.search) {
      qb.andWhere('dp.title ILIKE :search', { search: `%${query.search}%` });
    }

    if (query.cursor) {
      qb.andWhere('sli.created_at < :cursor', { cursor: new Date(query.cursor) });
    }

    const items = await qb.getMany();

    return {
      status: 'success',
      message: 'Library retrieved successfully',
      data: items,
      meta: {
        limit,
        nextCursor: items.length === limit
          ? items[items.length - 1].createdAt.toISOString()
          : undefined,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Remove from library
  // ──────────────────────────────────────────────

  async removeFromLibrary(
    teamId: string,
    itemId: string,
    userId: string,
  ): Promise<ApiResponse<null>> {
    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (
      !member ||
      ![TeamMemberRole.OWNER, TeamMemberRole.ADMIN].includes(member.role)
    ) {
      throw new ForbiddenException('Only owners and admins can remove from the library');
    }

    const item = await this.libraryRepository.findOne({ where: { id: itemId, teamId } });
    if (!item) {
      throw new NotFoundException('Library item not found');
    }

    await this.libraryRepository.remove(item);

    await this.cacheService.invalidateByTags([
      `${CACHE_TAG}:${teamId}:library`,
      `${CACHE_TAG}:${teamId}:stats`,
    ]);

    return {
      status: 'success',
      message: 'Product removed from team library',
    };
  }

  // ──────────────────────────────────────────────
  //  Download from library
  // ──────────────────────────────────────────────

  async downloadFromLibrary(
    teamId: string,
    productId: string,
    userId: string,
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    if (!member.permissions?.canDownload) {
      throw new ForbiddenException('You do not have download permissions');
    }

    const item = await this.libraryRepository.findOne({
      where: { teamId, digitalProductId: productId },
    });
    if (!item) {
      throw new NotFoundException('Product not found in team library');
    }

    // Increment access count
    item.accessCount += 1;
    await this.libraryRepository.save(item);

    // In a real implementation, generate a signed download URL
    const downloadUrl = `/api/v1/delivery/download?productId=${productId}&teamId=${teamId}`;

    this.logger.log(`Member ${userId} downloaded product ${productId} from team ${teamId} library`);

    return {
      status: 'success',
      message: 'Download URL generated',
      data: { downloadUrl },
    };
  }

  // ──────────────────────────────────────────────
  //  Check product in library
  // ──────────────────────────────────────────────

  async checkProductInLibrary(
    teamId: string,
    productId: string,
  ): Promise<ApiResponse<{ inLibrary: boolean }>> {
    const item = await this.libraryRepository.findOne({
      where: { teamId, digitalProductId: productId },
    });

    return {
      status: 'success',
      message: 'Library check completed',
      data: { inLibrary: !!item },
    };
  }
}
