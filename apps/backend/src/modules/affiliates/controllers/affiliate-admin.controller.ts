import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/constants/roles.constant';
import { AffiliateService } from '../services/affiliate.service';
import { AffiliatePayoutService } from '../services/affiliate-payout.service';
import { AffiliatesRepository } from '../affiliates.repository';
import { AffiliateQueryDto } from '../dto/affiliate-query.dto';
import { CommissionQueryDto } from '../dto/commission-query.dto';
import { PayoutQueryDto } from '../dto/payout-query.dto';
import {
  AdminUpdateAffiliateDto,
  ReviewAffiliateApplicationDto,
  ReviewCommissionDto,
  BulkApproveCommissionsDto,
} from '../dto/admin-update-affiliate.dto';
import { CommissionStatus } from '../../../entities/affiliate-commission.entity';

@ApiTags('Affiliates Admin')
@ApiBearerAuth()
@Controller('admin/affiliates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AffiliateAdminController {
  constructor(
    private readonly affiliateService: AffiliateService,
    private readonly payoutService: AffiliatePayoutService,
    private readonly repository: AffiliatesRepository,
  ) {}

  // ─── Affiliate Management ─────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all affiliates' })
  async listAffiliates(@Query() query: AffiliateQueryDto) {
    const data = await this.repository.findAllAffiliates(query);
    return { status: 'success', message: 'Affiliates retrieved', ...data };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregate affiliate stats' })
  async getStats() {
    const data = await this.repository.getAdminStats();
    return { status: 'success', message: 'Stats retrieved', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get affiliate detail' })
  async getAffiliate(@Param('id') id: string) {
    const data = await this.repository.findAffiliateById(id);
    if (!data) {
      return { status: 'error', message: 'Affiliate not found' };
    }
    return { status: 'success', message: 'Affiliate retrieved', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update affiliate (status, tier, rate)' })
  async updateAffiliate(
    @Param('id') id: string,
    @Body() dto: AdminUpdateAffiliateDto,
  ) {
    const data = await this.repository.updateAffiliateProfile(id, dto as any);
    return { status: 'success', message: 'Affiliate updated', data };
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Approve or reject affiliate application' })
  async reviewApplication(
    @Param('id') id: string,
    @Body() dto: ReviewAffiliateApplicationDto,
  ) {
    const data = await this.affiliateService.reviewApplication(id, dto.decision, dto.reviewNotes);
    return { status: 'success', message: `Application ${dto.decision}`, data };
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend an affiliate' })
  async suspendAffiliate(@Param('id') id: string) {
    await this.affiliateService.suspendAffiliate(id);
    return { status: 'success', message: 'Affiliate suspended' };
  }

  // ─── Commission Management ────────────────────────────────────────

  @Get('commissions')
  @ApiOperation({ summary: 'List all commissions' })
  async listCommissions(@Query() query: CommissionQueryDto) {
    const data = await this.repository.findCommissions(query);
    return { status: 'success', message: 'Commissions retrieved', ...data };
  }

  @Patch('commissions/:id/review')
  @ApiOperation({ summary: 'Approve or reverse a commission' })
  async reviewCommission(
    @Param('id') id: string,
    @Body() dto: ReviewCommissionDto,
  ) {
    const status = dto.decision === 'approved' ? CommissionStatus.APPROVED : CommissionStatus.REVERSED;
    const data = await this.repository.updateCommission(id, {
      status,
      approvedAt: dto.decision === 'approved' ? new Date() : undefined,
      flagReason: dto.reason,
    });
    return { status: 'success', message: `Commission ${dto.decision}`, data };
  }

  @Post('commissions/bulk-approve')
  @ApiOperation({ summary: 'Bulk approve commissions' })
  async bulkApprove(@Body() dto: BulkApproveCommissionsDto) {
    await this.repository.bulkUpdateCommissionStatus(dto.commissionIds, CommissionStatus.APPROVED, {
      approvedAt: new Date(),
    });
    return { status: 'success', message: `${dto.commissionIds.length} commissions approved` };
  }

  @Get('fraud')
  @ApiOperation({ summary: 'List flagged commissions' })
  async getFlagged(@Query() query: CommissionQueryDto) {
    const data = await this.repository.findCommissions({ ...query, flagged: true });
    return { status: 'success', message: 'Flagged commissions retrieved', ...data };
  }

  // ─── Payout Management ────────────────────────────────────────────

  @Get('payouts')
  @ApiOperation({ summary: 'List all payouts' })
  async listPayouts(@Query() query: PayoutQueryDto) {
    const data = await this.payoutService.getAllPayouts(query);
    return { status: 'success', message: 'Payouts retrieved', ...data };
  }

  @Post('payouts/:id/process')
  @ApiOperation({ summary: 'Process a pending payout' })
  async processPayout(@Param('id') id: string) {
    const data = await this.payoutService.processPayout(id);
    return { status: 'success', message: 'Payout processed', data };
  }
}
