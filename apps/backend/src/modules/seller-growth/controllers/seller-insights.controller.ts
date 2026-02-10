import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtUserPayload } from '../../../common/decorators/current-user.decorator';
import { SellerInsight, InsightType, InsightPriority, InsightStatus } from '../../../entities/seller-insight.entity';
import { SellerProfile } from '../../../entities/seller-profile.entity';
import { DigitalProduct, DigitalProductStatus } from '../../../entities/digital-product.entity';
import { UpdateInsightStatusDto, InsightQueryDto } from '../dto/seller-growth.dto';
import { PricingOptimizerService } from '../services/pricing-optimizer.service';
import { ListingScorerService } from '../services/listing-scorer.service';
import { MarketOpportunityService } from '../services/market-opportunity.service';
import { ApiResponse } from '../../../common/interfaces/response.interface';

@ApiTags('Seller Growth - Insights')
@Controller('seller-growth/insights')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SellerInsightsController {
  constructor(
    @InjectRepository(SellerInsight)
    private readonly insightRepo: Repository<SellerInsight>,
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepo: Repository<SellerProfile>,
    @InjectRepository(DigitalProduct)
    private readonly productRepo: Repository<DigitalProduct>,
    private readonly pricingOptimizerService: PricingOptimizerService,
    private readonly listingScorerService: ListingScorerService,
    private readonly marketOpportunityService: MarketOpportunityService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List insights for current seller' })
  async listInsights(
    @CurrentUser() user: JwtUserPayload,
    @Query() query: InsightQueryDto,
  ): Promise<ApiResponse<SellerInsight[]>> {
    const seller = await this.sellerProfileRepo.findOne({ where: { userId: user.sub } });
    if (!seller) throw new NotFoundException('Seller profile not found');

    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.insightRepo
      .createQueryBuilder('i')
      .where('i.seller_id = :sellerId', { sellerId: seller.id })
      .orderBy('i.generated_at', 'DESC');

    if (query.status) {
      qb.andWhere('i.status = :status', { status: query.status });
    }
    if (query.insightType) {
      qb.andWhere('i.insight_type = :type', { type: query.insightType });
    }

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      status: 'success',
      message: 'Insights retrieved successfully',
      data: items,
      meta: {
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update insight status' })
  async updateStatus(
    @CurrentUser() user: JwtUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInsightStatusDto,
  ): Promise<ApiResponse<SellerInsight>> {
    const seller = await this.sellerProfileRepo.findOne({ where: { userId: user.sub } });
    if (!seller) throw new NotFoundException('Seller profile not found');

    const insight = await this.insightRepo.findOne({ where: { id } });
    if (!insight) throw new NotFoundException('Insight not found');
    if (insight.sellerId !== seller.id) throw new ForbiddenException('Insight does not belong to this seller');

    insight.status = dto.status;
    const updated = await this.insightRepo.save(insight);

    return {
      status: 'success',
      message: 'Insight status updated successfully',
      data: updated,
    };
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @ApiOperation({ summary: 'Generate AI insights for current seller' })
  async generateInsights(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<ApiResponse<SellerInsight[]>> {
    const seller = await this.sellerProfileRepo.findOne({ where: { userId: user.sub } });
    if (!seller) throw new NotFoundException('Seller profile not found');

    const generatedInsights: SellerInsight[] = [];

    // 1. Pricing insights
    const products = await this.productRepo.find({
      where: { createdBy: user.sub, status: DigitalProductStatus.PUBLISHED },
      take: 5,
    });

    for (const product of products) {
      try {
        const analysis = await this.pricingOptimizerService.analyzePricing(seller.id, product.id);
        if (analysis.competitivePosition !== 'competitive') {
          const insight = this.insightRepo.create({
            sellerId: seller.id,
            insightType: InsightType.PRICING,
            title: `Pricing opportunity for "${product.title}"`,
            description: analysis.reasoning,
            actionItems: [
              {
                label: `Update price to $${analysis.suggestedPrice}`,
                action: 'navigate',
                url: `/seller-dashboard/pricing-tool`,
              },
            ],
            priority: analysis.competitivePosition === 'underpriced' ? InsightPriority.HIGH : InsightPriority.MEDIUM,
            status: InsightStatus.PENDING,
            metadata: { productId: product.id, analysis },
            generatedAt: new Date(),
          });
          generatedInsights.push(await this.insightRepo.save(insight));
        }
      } catch {
        // Skip failed analysis
      }
    }

    // 2. Listing quality insights
    for (const product of products.slice(0, 3)) {
      try {
        const score = await this.listingScorerService.scoreProduct(product.id);
        if (score.overallScore < 60) {
          const insight = this.insightRepo.create({
            sellerId: seller.id,
            insightType: InsightType.LISTING_QUALITY,
            title: `Improve listing for "${product.title}" (Score: ${score.overallScore}/100)`,
            description: `Your listing has room for improvement. ${score.suggestions[0]?.suggestion || 'Review your product listing quality.'}`,
            actionItems: score.suggestions.slice(0, 3).map((s) => ({
              label: s.suggestion,
              action: 'navigate',
              url: `/seller-dashboard/listing-health`,
            })),
            priority: score.overallScore < 40 ? InsightPriority.HIGH : InsightPriority.MEDIUM,
            status: InsightStatus.PENDING,
            metadata: { productId: product.id, score },
            generatedAt: new Date(),
          });
          generatedInsights.push(await this.insightRepo.save(insight));
        }
      } catch {
        // Skip failed scoring
      }
    }

    // 3. Market opportunity insights
    try {
      const opportunities = await this.marketOpportunityService.findOpportunities(seller.id);
      const topOpportunities = opportunities.filter((o) => o.potential === 'HIGH').slice(0, 3);
      for (const opp of topOpportunities) {
        const insight = this.insightRepo.create({
          sellerId: seller.id,
          insightType: InsightType.OPPORTUNITY,
          title: `Market gap: "${opp.term}"`,
          description: opp.reasoning,
          actionItems: [
            {
              label: 'View opportunity details',
              action: 'navigate',
              url: '/seller-dashboard/market',
            },
          ],
          priority: InsightPriority.MEDIUM,
          status: InsightStatus.PENDING,
          metadata: { opportunity: opp },
          generatedAt: new Date(),
        });
        generatedInsights.push(await this.insightRepo.save(insight));
      }
    } catch {
      // Skip failed opportunity search
    }

    return {
      status: 'success',
      message: `Generated ${generatedInsights.length} insights`,
      data: generatedInsights,
    };
  }
}
