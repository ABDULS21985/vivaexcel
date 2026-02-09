import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/constants/roles.constant';
import { SellersService } from '../services/sellers.service';
import { SellerPayoutsService } from '../services/seller-payouts.service';
import { AdminUpdateSellerDto } from '../dto/admin-update-seller.dto';
import { SellerQueryDto } from '../dto/seller-query.dto';
import { PayoutQueryDto } from '../dto/payout-query.dto';

@ApiTags('Seller Admin')
@Controller('admin/sellers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class SellerAdminController {
  constructor(
    private readonly sellersService: SellersService,
    private readonly payoutsService: SellerPayoutsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all sellers (admin)' })
  async findAll(@Query() query: SellerQueryDto) {
    const result = await this.sellersService.findAll(query);
    return { status: 'success', message: 'Sellers retrieved', data: result.items, meta: result.meta };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get seller by ID (admin)' })
  async findById(@Param('id') id: string) {
    const seller = await this.sellersService.findById(id);
    return { status: 'success', message: 'Seller retrieved', data: seller };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update seller settings (admin)' })
  async update(@Param('id') id: string, @Body() dto: AdminUpdateSellerDto) {
    const seller = await this.sellersService.adminUpdateSeller(id, dto);
    return { status: 'success', message: 'Seller updated', data: seller };
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend a seller' })
  async suspend(@Param('id') id: string) {
    const seller = await this.sellersService.suspendSeller(id);
    return { status: 'success', message: 'Seller suspended', data: seller };
  }

  @Post(':id/reinstate')
  @ApiOperation({ summary: 'Reinstate a suspended seller' })
  async reinstate(@Param('id') id: string) {
    const seller = await this.sellersService.reinstateSeller(id);
    return { status: 'success', message: 'Seller reinstated', data: seller };
  }

  // ─── Payout Management ───────────────────────────────────────────

  @Get('payouts/all')
  @ApiOperation({ summary: 'List all payouts (admin)' })
  async findAllPayouts(@Query() query: PayoutQueryDto) {
    const result = await this.payoutsService.findAll(query);
    return { status: 'success', message: 'Payouts retrieved', data: result.items, meta: result.meta };
  }

  @Post('payouts/:id/process')
  @ApiOperation({ summary: 'Process a pending payout (admin)' })
  async processPayout(@Param('id') id: string) {
    await this.payoutsService.processPayout(id);
    return { status: 'success', message: 'Payout processed' };
  }
}
