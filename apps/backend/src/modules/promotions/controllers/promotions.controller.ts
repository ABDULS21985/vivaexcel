import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PromotionsService } from '../promotions.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { CreateBundleDiscountDto } from '../dto';

@ApiTags('Promotions')
@Controller('promotions')
@UseGuards(RolesGuard, PermissionsGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // ──────────────────────────────────────────────
  //  Authenticated endpoints
  // ──────────────────────────────────────────────

  @Get('best-deal')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the best deal for the current user cart' })
  async getBestDeal(@CurrentUser('sub') userId: string) {
    return this.promotionsService.calculateBestDiscount([], userId);
  }

  // ──────────────────────────────────────────────
  //  Public endpoints
  // ──────────────────────────────────────────────

  @Get('bundles')
  @Public()
  @ApiOperation({ summary: 'List active bundle discounts' })
  async listBundles() {
    return this.promotionsService.getBundleDiscounts();
  }

  @Get('bundles/:id')
  @Public()
  @ApiOperation({ summary: 'Get a bundle discount by ID' })
  @ApiParam({ name: 'id', description: 'Bundle Discount ID' })
  async getBundle(@Param('id', ParseUUIDPipe) id: string) {
    return this.promotionsService.getBundleDiscountById(id);
  }

  // ──────────────────────────────────────────────
  //  Admin endpoints
  // ──────────────────────────────────────────────

  @Post('bundles')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new bundle discount' })
  async createBundle(@Body() dto: CreateBundleDiscountDto) {
    return this.promotionsService.createBundleDiscount(dto);
  }
}
