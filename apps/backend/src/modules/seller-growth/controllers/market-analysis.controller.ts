import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUserPayload } from '../../../common/decorators/current-user.decorator';
import { MarketBenchmark } from '../../../entities/market-benchmark.entity';
import { SellerProfile } from '../../../entities/seller-profile.entity';
import { DigitalProductType } from '../../../entities/digital-product.entity';
import { BenchmarkQueryDto, ForecastQueryDto, MarketOpportunity, SalesForecast } from '../dto/seller-growth.dto';
import { MarketOpportunityService } from '../services/market-opportunity.service';
import { SalesForecastingService } from '../services/sales-forecasting.service';
import { ApiResponse } from '../../../common/interfaces/response.interface';

@ApiTags('Seller Growth - Market Analysis')
@Controller('seller-growth/market')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MarketAnalysisController {
  constructor(
    @InjectRepository(MarketBenchmark)
    private readonly benchmarkRepo: Repository<MarketBenchmark>,
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepo: Repository<SellerProfile>,
    private readonly marketOpportunityService: MarketOpportunityService,
    private readonly salesForecastingService: SalesForecastingService,
  ) {}

  @Get('benchmarks')
  @ApiOperation({ summary: 'List market benchmarks' })
  async listBenchmarks(
    @Query() query: BenchmarkQueryDto,
  ): Promise<ApiResponse<MarketBenchmark[]>> {
    const where: Record<string, any> = {};
    if (query.productType) where.productType = query.productType;
    if (query.categoryId) where.categoryId = query.categoryId;

    const benchmarks = await this.benchmarkRepo.find({
      where,
      order: { calculatedAt: 'DESC' },
    });

    return {
      status: 'success',
      message: 'Benchmarks retrieved successfully',
      data: benchmarks,
    };
  }

  @Get('benchmarks/:productType/:categoryId?')
  @ApiOperation({ summary: 'Get specific benchmark' })
  async getBenchmark(
    @Param('productType') productType: DigitalProductType,
    @Param('categoryId') categoryId?: string,
  ): Promise<ApiResponse<MarketBenchmark>> {
    const where: Record<string, any> = { productType };
    if (categoryId) where.categoryId = categoryId;

    const benchmark = await this.benchmarkRepo.findOne({ where });
    if (!benchmark) throw new NotFoundException('Benchmark not found');

    return {
      status: 'success',
      message: 'Benchmark retrieved successfully',
      data: benchmark,
    };
  }

  @Get('opportunities')
  @ApiOperation({ summary: 'Get market opportunities for current seller' })
  async getOpportunities(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<ApiResponse<MarketOpportunity[]>> {
    const seller = await this.sellerProfileRepo.findOne({ where: { userId: user.sub } });
    if (!seller) throw new NotFoundException('Seller profile not found');

    const opportunities = await this.marketOpportunityService.findOpportunities(seller.id);

    return {
      status: 'success',
      message: 'Opportunities retrieved successfully',
      data: opportunities,
    };
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Get sales forecast' })
  async getForecast(
    @CurrentUser() user: JwtUserPayload,
    @Query() query: ForecastQueryDto,
  ): Promise<ApiResponse<SalesForecast>> {
    const seller = await this.sellerProfileRepo.findOne({ where: { userId: user.sub } });
    if (!seller) throw new NotFoundException('Seller profile not found');

    const days = query.days && [30, 60, 90].includes(query.days) ? query.days : 30;
    const forecast = await this.salesForecastingService.forecast(seller.id, days as 30 | 60 | 90);

    return {
      status: 'success',
      message: 'Forecast generated successfully',
      data: forecast,
    };
  }
}
