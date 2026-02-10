import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import {
  CreateCouponDto,
  UpdateCouponDto,
  CouponQueryDto,
  ValidateCouponDto,
  ApplyCouponDto,
  BulkCreateCouponsDto,
} from '../dto';

@ApiTags('Coupons')
@Controller('coupons')
@UseGuards(RolesGuard, PermissionsGuard)
export class CouponsController {
  constructor(private readonly promotionsService: PromotionsService) { }

  // ──────────────────────────────────────────────
  //  Admin endpoints
  // ──────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new coupon' })
  async createCoupon(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCouponDto,
  ) {
    return this.promotionsService.createCoupon(dto, userId);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all coupons' })
  async listCoupons(@Query() query: CouponQueryDto) {
    return this.promotionsService.getCoupons(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a single coupon by ID' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  async getCoupon(@Param('id', ParseUUIDPipe) id: string) {
    return this.promotionsService.getCouponById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a coupon' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  async updateCoupon(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.promotionsService.updateCoupon(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a coupon' })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  async deleteCoupon(@Param('id', ParseUUIDPipe) id: string) {
    return this.promotionsService.deleteCoupon(id);
  }

  @Post('bulk')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk create coupons' })
  async bulkCreateCoupons(
    @CurrentUser('sub') userId: string,
    @Body() dto: BulkCreateCouponsDto,
  ) {
    return this.promotionsService.bulkCreateCoupons(dto, userId);
  }

  // ──────────────────────────────────────────────
  //  Authenticated endpoints
  // ──────────────────────────────────────────────

  @Post('validate')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a coupon code' })
  async validateCoupon(
    @CurrentUser('sub') userId: string,
    @Body() dto: ValidateCouponDto,
  ) {
    return this.promotionsService.validateCoupon(dto.code, userId, dto.cartItems);
  }

  @Post('apply')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply a coupon to an order' })
  async applyCoupon(
    @CurrentUser('sub') userId: string,
    @Body() dto: ApplyCouponDto,
  ) {
    return this.promotionsService.applyCoupon(
      dto.code,
      userId,
      dto.orderId,
      dto.discountAmount,
    );
  }
}
