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
import { TeamPurchase, TeamPurchaseStatus } from '../entities/team-purchase.entity';
import { RequestPurchaseDto } from '../dto/request-purchase.dto';
import { ApprovePurchaseDto } from '../dto/approve-purchase.dto';
import { RejectPurchaseDto } from '../dto/reject-purchase.dto';
import { TeamQueryDto } from '../dto/team-query.dto';
import { BudgetService } from './budget.service';
import { CacheService } from '../../../common/cache/cache.service';
import { ApiResponse } from '../../../common/interfaces/response.interface';

const CACHE_TAG = 'teams';

@Injectable()
export class TeamPurchasesService {
  private readonly logger = new Logger(TeamPurchasesService.name);

  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly memberRepository: Repository<TeamMember>,
    @InjectRepository(TeamPurchase)
    private readonly purchaseRepository: Repository<TeamPurchase>,
    private readonly budgetService: BudgetService,
    private readonly cacheService: CacheService,
  ) {}

  // ──────────────────────────────────────────────
  //  Request purchase
  // ──────────────────────────────────────────────

  async requestPurchase(
    teamId: string,
    userId: string,
    dto: RequestPurchaseDto,
  ): Promise<ApiResponse<TeamPurchase>> {
    const team = await this.teamRepository.findOne({ where: { id: teamId, isActive: true } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    if (!member.permissions?.canPurchase) {
      throw new ForbiddenException('You do not have permission to make purchases');
    }

    // Check budgets
    const amount = dto.seatCount ? dto.seatCount * 29.99 : 29.99; // Placeholder: actual price should come from product
    await this.budgetService.checkTeamBudget(teamId, amount);
    await this.budgetService.checkMemberSpendLimit(member.id, amount);

    const status = team.purchaseApprovalRequired
      ? TeamPurchaseStatus.PENDING_APPROVAL
      : TeamPurchaseStatus.APPROVED;

    const purchase = this.purchaseRepository.create({
      teamId,
      purchasedBy: member.id,
      digitalProductId: dto.digitalProductId,
      amount,
      seatCount: dto.seatCount || 1,
      requestNote: dto.requestNote || null,
      status,
    });

    const saved = await this.purchaseRepository.save(purchase);

    if (status === TeamPurchaseStatus.APPROVED) {
      await this.budgetService.recordSpend(teamId, member.id, amount);
      this.logger.log(`Purchase auto-approved for team ${teamId}, member ${member.id}`);
    }

    await this.cacheService.invalidateByTags([
      `${CACHE_TAG}:${teamId}:purchases`,
      `${CACHE_TAG}:${teamId}:stats`,
    ]);

    return {
      status: 'success',
      message: status === TeamPurchaseStatus.APPROVED
        ? 'Purchase completed successfully'
        : 'Purchase request submitted for approval',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Approve purchase
  // ──────────────────────────────────────────────

  async approvePurchase(
    teamId: string,
    purchaseId: string,
    userId: string,
    dto: ApprovePurchaseDto,
  ): Promise<ApiResponse<TeamPurchase>> {
    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member || !member.permissions?.canApproveRequests) {
      throw new ForbiddenException('You do not have permission to approve purchases');
    }

    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId, teamId, status: TeamPurchaseStatus.PENDING_APPROVAL },
    });
    if (!purchase) {
      throw new NotFoundException('Pending purchase not found');
    }

    // Check budget before approving
    await this.budgetService.checkTeamBudget(teamId, Number(purchase.amount));

    purchase.status = TeamPurchaseStatus.APPROVED;
    purchase.approvedBy = member.id;
    purchase.approvalNote = dto.approvalNote || null;
    const saved = await this.purchaseRepository.save(purchase);

    // Record spend
    await this.budgetService.recordSpend(teamId, purchase.purchasedBy, Number(purchase.amount));

    await this.cacheService.invalidateByTags([
      `${CACHE_TAG}:${teamId}:purchases`,
      `${CACHE_TAG}:${teamId}:stats`,
    ]);

    this.logger.log(`Purchase ${purchaseId} approved by ${userId} for team ${teamId}`);

    return {
      status: 'success',
      message: 'Purchase approved successfully',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Reject purchase
  // ──────────────────────────────────────────────

  async rejectPurchase(
    teamId: string,
    purchaseId: string,
    userId: string,
    dto: RejectPurchaseDto,
  ): Promise<ApiResponse<TeamPurchase>> {
    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member || !member.permissions?.canApproveRequests) {
      throw new ForbiddenException('You do not have permission to reject purchases');
    }

    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId, teamId, status: TeamPurchaseStatus.PENDING_APPROVAL },
    });
    if (!purchase) {
      throw new NotFoundException('Pending purchase not found');
    }

    purchase.status = TeamPurchaseStatus.REJECTED;
    purchase.approvedBy = member.id;
    purchase.approvalNote = dto.approvalNote;
    const saved = await this.purchaseRepository.save(purchase);

    await this.cacheService.invalidateByTags([`${CACHE_TAG}:${teamId}:purchases`]);

    this.logger.log(`Purchase ${purchaseId} rejected by ${userId} for team ${teamId}`);

    return {
      status: 'success',
      message: 'Purchase rejected',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Get purchases
  // ──────────────────────────────────────────────

  async getPurchases(
    teamId: string,
    userId: string,
    query: TeamQueryDto,
  ): Promise<ApiResponse<TeamPurchase[]>> {
    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    const limit = query.limit || 20;
    const qb = this.purchaseRepository
      .createQueryBuilder('tp')
      .leftJoinAndSelect('tp.digitalProduct', 'dp')
      .where('tp.team_id = :teamId', { teamId })
      .orderBy('tp.created_at', 'DESC')
      .take(limit);

    if (query.cursor) {
      qb.andWhere('tp.created_at < :cursor', { cursor: new Date(query.cursor) });
    }

    const purchases = await qb.getMany();

    return {
      status: 'success',
      message: 'Purchases retrieved successfully',
      data: purchases,
      meta: {
        limit,
        nextCursor: purchases.length === limit
          ? purchases[purchases.length - 1].createdAt.toISOString()
          : undefined,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Get pending approvals
  // ──────────────────────────────────────────────

  async getPendingApprovals(
    teamId: string,
    userId: string,
  ): Promise<ApiResponse<TeamPurchase[]>> {
    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member || !member.permissions?.canApproveRequests) {
      throw new ForbiddenException('You do not have permission to view pending approvals');
    }

    const purchases = await this.purchaseRepository.find({
      where: { teamId, status: TeamPurchaseStatus.PENDING_APPROVAL },
      relations: ['digitalProduct'],
      order: { createdAt: 'ASC' },
    });

    return {
      status: 'success',
      message: 'Pending approvals retrieved successfully',
      data: purchases,
    };
  }
}
