import {
  Controller,
  Get,
  Post,
  Patch,
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
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { VolumeDiscountService } from '../services/volume-discount.service';
import { CreateVolumeDiscountDto } from '../dto/create-volume-discount.dto';
import { Role } from '../../../common/constants/roles.constant';

@ApiTags('Volume Discounts')
@Controller('volume-discounts')
export class VolumeDiscountsController {
  constructor(private readonly discountService: VolumeDiscountService) {}

  @ApiOperation({ summary: 'Get volume discount tiers' })
  @ApiResponse({ status: 200, description: 'Discount tiers' })
  @Public()
  @Get()
  async getDiscountTiers() {
    return this.discountService.getDiscountTiers();
  }

  @ApiOperation({ summary: 'Calculate volume price' })
  @ApiResponse({ status: 200, description: 'Calculated price' })
  @Public()
  @Get('calculate')
  async calculateVolumePrice(
    @Query('unitPrice') unitPrice: string,
    @Query('quantity') quantity: string,
    @Query('productId') productId?: string,
  ) {
    return this.discountService.calculateVolumePrice(
      parseFloat(unitPrice),
      parseInt(quantity, 10),
      productId,
    );
  }

  @ApiOperation({ summary: 'Create volume discount tier (admin)' })
  @ApiResponse({ status: 201, description: 'Discount created' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async createDiscount(@Body() dto: CreateVolumeDiscountDto) {
    return this.discountService.createDiscount(dto);
  }

  @ApiOperation({ summary: 'Update volume discount tier (admin)' })
  @ApiResponse({ status: 200, description: 'Discount updated' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  async updateDiscount(
    @Param('id') id: string,
    @Body() dto: Partial<CreateVolumeDiscountDto>,
  ) {
    return this.discountService.updateDiscount(id, dto);
  }
}
