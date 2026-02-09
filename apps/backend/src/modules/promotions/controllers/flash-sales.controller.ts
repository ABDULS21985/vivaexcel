import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { CreateFlashSaleDto } from '../dto';

@ApiTags('Flash Sales')
@Controller('flash-sales')
@UseGuards(RolesGuard, PermissionsGuard)
export class FlashSalesController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // ──────────────────────────────────────────────
  //  Admin endpoints
  // ──────────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new flash sale' })
  async createFlashSale(@Body() dto: CreateFlashSaleDto) {
    return this.promotionsService.createFlashSale(dto);
  }

  // ──────────────────────────────────────────────
  //  Public endpoints
  // ──────────────────────────────────────────────

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get active flash sales' })
  async getActiveFlashSales() {
    return this.promotionsService.getActiveFlashSales();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a flash sale by ID' })
  @ApiParam({ name: 'id', description: 'Flash Sale ID' })
  async getFlashSale(@Param('id', ParseUUIDPipe) id: string) {
    return this.promotionsService.getFlashSale(id);
  }
}
