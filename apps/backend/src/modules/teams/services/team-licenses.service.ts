import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { TeamMember } from '../entities/team-member.entity';
import { TeamLicense, TeamLicenseStatus, SeatActivation } from '../entities/team-license.entity';
import { CacheService } from '../../../common/cache/cache.service';
import { ApiResponse } from '../../../common/interfaces/response.interface';

const CACHE_TAG = 'teams';

@Injectable()
export class TeamLicensesService {
  private readonly logger = new Logger(TeamLicensesService.name);

  constructor(
    @InjectRepository(TeamMember)
    private readonly memberRepository: Repository<TeamMember>,
    @InjectRepository(TeamLicense)
    private readonly licenseRepository: Repository<TeamLicense>,
    private readonly cacheService: CacheService,
  ) {}

  // ──────────────────────────────────────────────
  //  Generate team license
  // ──────────────────────────────────────────────

  async generateTeamLicense(
    teamId: string,
    digitalProductId: string,
    seatCount: number,
  ): Promise<TeamLicense> {
    const licenseKey = `TEAM-${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`;

    const license = this.licenseRepository.create({
      teamId,
      digitalProductId,
      licenseType: 'TEAM',
      seatCount,
      usedSeats: 0,
      licenseKey,
      activations: [],
      status: TeamLicenseStatus.ACTIVE,
    });

    const saved = await this.licenseRepository.save(license);

    await this.cacheService.invalidateByTags([`${CACHE_TAG}:${teamId}:licenses`]);

    this.logger.log(
      `Team license generated: ${licenseKey} for team ${teamId}, product ${digitalProductId}, ${seatCount} seats`,
    );

    return saved;
  }

  // ──────────────────────────────────────────────
  //  Activate seat
  // ──────────────────────────────────────────────

  async activateSeat(
    teamId: string,
    licenseId: string,
    userId: string,
  ): Promise<ApiResponse<TeamLicense>> {
    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    const license = await this.licenseRepository.findOne({
      where: { id: licenseId, teamId, status: TeamLicenseStatus.ACTIVE },
    });
    if (!license) {
      throw new NotFoundException('Active team license not found');
    }

    // Check if already activated
    const alreadyActivated = license.activations.some((a) => a.memberId === member.id);
    if (alreadyActivated) {
      throw new BadRequestException('You already have an active seat for this license');
    }

    if (license.usedSeats >= license.seatCount) {
      throw new BadRequestException(
        `No available seats. ${license.seatCount}/${license.seatCount} seats in use.`,
      );
    }

    const activation: SeatActivation = {
      memberId: member.id,
      activatedAt: new Date().toISOString(),
    };

    license.activations = [...license.activations, activation];
    license.usedSeats += 1;
    const saved = await this.licenseRepository.save(license);

    await this.cacheService.invalidateByTags([`${CACHE_TAG}:${teamId}:licenses`]);

    this.logger.log(`Seat activated: license ${licenseId}, member ${member.id}`);

    return {
      status: 'success',
      message: 'Seat activated successfully',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Deactivate seat
  // ──────────────────────────────────────────────

  async deactivateSeat(
    teamId: string,
    licenseId: string,
    userId: string,
  ): Promise<ApiResponse<TeamLicense>> {
    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    const license = await this.licenseRepository.findOne({
      where: { id: licenseId, teamId, status: TeamLicenseStatus.ACTIVE },
    });
    if (!license) {
      throw new NotFoundException('Active team license not found');
    }

    const activationIndex = license.activations.findIndex((a) => a.memberId === member.id);
    if (activationIndex === -1) {
      throw new BadRequestException('You do not have an active seat for this license');
    }

    license.activations = license.activations.filter((a) => a.memberId !== member.id);
    license.usedSeats = Math.max(0, license.usedSeats - 1);
    const saved = await this.licenseRepository.save(license);

    await this.cacheService.invalidateByTags([`${CACHE_TAG}:${teamId}:licenses`]);

    this.logger.log(`Seat deactivated: license ${licenseId}, member ${member.id}`);

    return {
      status: 'success',
      message: 'Seat deactivated successfully',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Get team licenses
  // ──────────────────────────────────────────────

  async getTeamLicenses(
    teamId: string,
    userId: string,
  ): Promise<ApiResponse<TeamLicense[]>> {
    const member = await this.memberRepository.findOne({ where: { teamId, userId } });
    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    const cacheKey = this.cacheService.generateKey(CACHE_TAG, teamId, 'licenses');

    const licenses = await this.cacheService.wrap(
      cacheKey,
      () =>
        this.licenseRepository.find({
          where: { teamId },
          relations: ['digitalProduct'],
          order: { createdAt: 'DESC' },
        }),
      { ttl: 300, tags: [`${CACHE_TAG}:${teamId}:licenses`] },
    );

    return {
      status: 'success',
      message: 'Team licenses retrieved successfully',
      data: licenses,
    };
  }
}
