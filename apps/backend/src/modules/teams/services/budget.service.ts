import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';
import { CacheService } from '../../../common/cache/cache.service';

const CACHE_TAG = 'teams';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly memberRepository: Repository<TeamMember>,
    private readonly cacheService: CacheService,
  ) {}

  // ──────────────────────────────────────────────
  //  Check team budget
  // ──────────────────────────────────────────────

  async checkTeamBudget(teamId: string, amount: number): Promise<void> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) return;

    if (team.monthlyBudget === null) return; // No budget limit

    const remaining = Number(team.monthlyBudget) - Number(team.currentMonthSpend);
    if (amount > remaining) {
      throw new BadRequestException(
        `Purchase exceeds team monthly budget. Remaining: $${remaining.toFixed(2)}, Requested: $${amount.toFixed(2)}`,
      );
    }
  }

  // ──────────────────────────────────────────────
  //  Check member spend limit
  // ──────────────────────────────────────────────

  async checkMemberSpendLimit(memberId: string, amount: number): Promise<void> {
    const member = await this.memberRepository.findOne({ where: { id: memberId } });
    if (!member) return;

    if (member.spendLimit === null) return; // No limit

    const remaining = Number(member.spendLimit) - Number(member.currentMonthSpend);
    if (amount > remaining) {
      throw new BadRequestException(
        `Purchase exceeds your monthly spend limit. Remaining: $${remaining.toFixed(2)}, Requested: $${amount.toFixed(2)}`,
      );
    }
  }

  // ──────────────────────────────────────────────
  //  Record spend
  // ──────────────────────────────────────────────

  async recordSpend(
    teamId: string,
    memberId: string,
    amount: number,
  ): Promise<void> {
    // Update team spend
    await this.teamRepository
      .createQueryBuilder()
      .update(Team)
      .set({
        currentMonthSpend: () => `current_month_spend + ${amount}`,
      })
      .where('id = :teamId', { teamId })
      .execute();

    // Update member spend
    await this.memberRepository
      .createQueryBuilder()
      .update(TeamMember)
      .set({
        currentMonthSpend: () => `current_month_spend + ${amount}`,
      })
      .where('id = :memberId', { memberId })
      .execute();

    await this.cacheService.invalidateByTags([`${CACHE_TAG}:${teamId}:stats`]);

    this.logger.log(
      `Recorded spend: $${amount.toFixed(2)} for team ${teamId}, member ${memberId}`,
    );
  }

  // ──────────────────────────────────────────────
  //  Monthly budget reset (CRON: 1st of month)
  // ──────────────────────────────────────────────

  @Cron('0 0 1 * *')
  async resetMonthlyBudgets(): Promise<void> {
    this.logger.log('Starting monthly budget reset...');

    // Reset all team spends
    await this.teamRepository
      .createQueryBuilder()
      .update(Team)
      .set({ currentMonthSpend: 0 })
      .where('is_active = :active', { active: true })
      .execute();

    // Reset all member spends
    await this.memberRepository
      .createQueryBuilder()
      .update(TeamMember)
      .set({ currentMonthSpend: 0 })
      .execute();

    // Invalidate all team stats caches
    await this.cacheService.invalidatePattern(`${CACHE_TAG}:*:stats`);

    this.logger.log('Monthly budget reset completed');
  }
}
