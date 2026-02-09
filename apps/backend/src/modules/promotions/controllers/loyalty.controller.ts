import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PromotionsService } from '../promotions.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { CreateLoyaltyTierDto } from '../dto';

@ApiTags('Loyalty')
@Controller('loyalty')
@UseGuards(RolesGuard, PermissionsGuard)
export class LoyaltyController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // ──────────────────────────────────────────────
  //  Public endpoints
  // ──────────────────────────────────────────────

  @Get('tiers')
  @Public()
  @ApiOperation({ summary: 'Get all loyalty tiers' })
  async getLoyaltyTiers() {
    return this.promotionsService.getLoyaltyTiers();
  }

  // ──────────────────────────────────────────────
  //  Authenticated endpoints
  // ──────────────────────────────────────────────

  @Get('tier')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user loyalty tier' })
  async getCurrentUserTier(@CurrentUser('sub') userId: string) {
    return this.promotionsService.getUserLoyaltyTier(userId);
  }

  // ──────────────────────────────────────────────
  //  Admin endpoints
  // ──────────────────────────────────────────────

  @Post('tiers')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new loyalty tier' })
  async createLoyaltyTier(@Body() dto: CreateLoyaltyTierDto) {
    return this.promotionsService.createLoyaltyTier(dto);
  }
}
