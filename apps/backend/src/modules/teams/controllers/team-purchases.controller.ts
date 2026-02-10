import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UserId } from '../../../common/decorators/current-user.decorator';
import { TeamPurchasesService } from '../services/team-purchases.service';
import { RequestPurchaseDto } from '../dto/request-purchase.dto';
import { ApprovePurchaseDto } from '../dto/approve-purchase.dto';
import { RejectPurchaseDto } from '../dto/reject-purchase.dto';
import { TeamQueryDto } from '../dto/team-query.dto';

@ApiTags('Team Purchases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams/:teamId/purchases')
export class TeamPurchasesController {
  constructor(private readonly purchasesService: TeamPurchasesService) {}

  @ApiOperation({ summary: 'Request a purchase for the team' })
  @ApiResponse({ status: 201, description: 'Purchase requested' })
  @Post('request')
  async requestPurchase(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
    @Body() dto: RequestPurchaseDto,
  ) {
    return this.purchasesService.requestPurchase(teamId, userId, dto);
  }

  @ApiOperation({ summary: 'Approve a pending purchase' })
  @ApiResponse({ status: 200, description: 'Purchase approved' })
  @Post(':purchaseId/approve')
  async approvePurchase(
    @Param('teamId') teamId: string,
    @Param('purchaseId') purchaseId: string,
    @UserId() userId: string,
    @Body() dto: ApprovePurchaseDto,
  ) {
    return this.purchasesService.approvePurchase(teamId, purchaseId, userId, dto);
  }

  @ApiOperation({ summary: 'Reject a pending purchase' })
  @ApiResponse({ status: 200, description: 'Purchase rejected' })
  @Post(':purchaseId/reject')
  async rejectPurchase(
    @Param('teamId') teamId: string,
    @Param('purchaseId') purchaseId: string,
    @UserId() userId: string,
    @Body() dto: RejectPurchaseDto,
  ) {
    return this.purchasesService.rejectPurchase(teamId, purchaseId, userId, dto);
  }

  @ApiOperation({ summary: 'Get team purchase history' })
  @ApiResponse({ status: 200, description: 'Purchase list' })
  @Get()
  async getPurchases(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
    @Query() query: TeamQueryDto,
  ) {
    return this.purchasesService.getPurchases(teamId, userId, query);
  }

  @ApiOperation({ summary: 'Get pending purchase approvals' })
  @ApiResponse({ status: 200, description: 'Pending approvals' })
  @Get('pending')
  async getPendingApprovals(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
  ) {
    return this.purchasesService.getPendingApprovals(teamId, userId);
  }
}
