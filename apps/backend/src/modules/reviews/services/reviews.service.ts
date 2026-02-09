import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import Anthropic from '@anthropic-ai/sdk';
import { ReviewsRepository, ReviewQueryOptions } from '../reviews.repository';
import { CacheService } from '../../../common/cache/cache.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { SellerResponseDto } from '../dto/seller-response.dto';
import { CreateReviewVoteDto } from '../dto/create-review-vote.dto';
import { CreateReviewReportDto } from '../dto/create-review-report.dto';
import { ModerateReviewDto } from '../dto/moderate-review.dto';
import { Review } from '../../../entities/review.entity';
import { DigitalProduct } from '../../../entities/digital-product.entity';
import { ApiResponse, PaginatedResponse } from '../../../common/interfaces/response.interface';
import {
  ReviewStatus,
  VoteType,
  ReportStatus,
} from '../enums/review.enums';

// Cache constants
const CACHE_TTL_LIST = 300; // 5 minutes
const CACHE_TTL_STATS = 600; // 10 minutes
const CACHE_TTL_LEADERBOARD = 900; // 15 minutes
const CACHE_TAG = 'reviews';

// AI moderation result interface
interface AiModerationResult {
  shouldApprove: boolean;
  qualityScore: number;
  flags: string[];
  reason: string;
}

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  private readonly anthropic = new Anthropic();

  constructor(
    private readonly repository: ReviewsRepository,
    private readonly cacheService: CacheService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepository: Repository<DigitalProduct>,
  ) {}

  // ──────────────────────────────────────────────
  //  Create review
  // ──────────────────────────────────────────────

  async createReview(
    userId: string,
    dto: CreateReviewDto,
  ): Promise<ApiResponse<Review>> {
    // Check if user already reviewed this product
    const existingReview = await this.repository.findByUserAndProduct(
      userId,
      dto.digitalProductId,
    );
    if (existingReview) {
      throw new ConflictException('You have already reviewed this product');
    }

    // Verify the product exists
    const product = await this.digitalProductRepository.findOne({
      where: { id: dto.digitalProductId },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID "${dto.digitalProductId}" not found`,
      );
    }

    // Check if user has purchased this product (verified purchase)
    const isVerifiedPurchase = await this.repository.hasUserPurchasedProduct(
      userId,
      dto.digitalProductId,
    );

    // Create the review with PENDING_MODERATION status
    const review = await this.repository.create({
      userId,
      digitalProductId: dto.digitalProductId,
      orderId: dto.orderId,
      rating: dto.rating,
      title: dto.title,
      body: dto.body,
      pros: dto.pros || [],
      cons: dto.cons || [],
      images: dto.images || [],
      metadata: dto.metadata,
      isVerifiedPurchase,
      status: ReviewStatus.PENDING_MODERATION,
      helpfulCount: 0,
      notHelpfulCount: 0,
    });

    // Run AI moderation asynchronously
    this.runAiModerationAndUpdate(review).catch((error) => {
      this.logger.error(
        `AI moderation failed for review ${review.id}: ${error.message}`,
      );
    });

    // Emit event for aggregation
    this.eventEmitter.emit('review.created', {
      productId: dto.digitalProductId,
      reviewId: review.id,
    });

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `reviews:product:${dto.digitalProductId}`,
    ]);
    this.logger.debug(`Review ${review.id} created for product ${dto.digitalProductId}`);

    return {
      status: 'success',
      message: 'Review submitted successfully and is pending moderation',
      data: review,
    };
  }

  // ──────────────────────────────────────────────
  //  Update review
  // ──────────────────────────────────────────────

  async updateReview(
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ): Promise<ApiResponse<Review>> {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review with ID "${reviewId}" not found`);
    }

    // Only the author can update their review
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updated = await this.repository.update(reviewId, {
      ...(dto.rating !== undefined && { rating: dto.rating }),
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.body !== undefined && { body: dto.body }),
      ...(dto.pros !== undefined && { pros: dto.pros }),
      ...(dto.cons !== undefined && { cons: dto.cons }),
      ...(dto.images !== undefined && { images: dto.images }),
      editedAt: new Date(),
      status: ReviewStatus.PENDING_MODERATION, // Re-set to pending for re-moderation
    });

    // Re-run AI moderation
    if (updated) {
      this.runAiModerationAndUpdate(updated).catch((error) => {
        this.logger.error(
          `AI re-moderation failed for review ${reviewId}: ${error.message}`,
        );
      });
    }

    // Emit event for re-aggregation
    this.eventEmitter.emit('review.updated', {
      productId: review.digitalProductId,
      reviewId,
    });

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `reviews:product:${review.digitalProductId}`,
      `review:${reviewId}`,
    ]);
    this.logger.debug(`Review ${reviewId} updated by user ${userId}`);

    return {
      status: 'success',
      message: 'Review updated successfully and is pending re-moderation',
      data: updated!,
    };
  }

  // ──────────────────────────────────────────────
  //  Seller response
  // ──────────────────────────────────────────────

  async addSellerResponse(
    userId: string,
    reviewId: string,
    dto: SellerResponseDto,
  ): Promise<ApiResponse<Review>> {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review with ID "${reviewId}" not found`);
    }

    // Verify user owns the product
    const product = await this.digitalProductRepository.findOne({
      where: { id: review.digitalProductId },
    });
    if (!product) {
      throw new NotFoundException('Associated product not found');
    }

    if (product.createdBy !== userId) {
      throw new ForbiddenException(
        'Only the product owner can respond to reviews',
      );
    }

    const updated = await this.repository.update(reviewId, {
      sellerResponse: dto.response,
      sellerRespondedAt: new Date(),
    });

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `reviews:product:${review.digitalProductId}`,
      `review:${reviewId}`,
    ]);
    this.logger.debug(`Seller response added to review ${reviewId}`);

    return {
      status: 'success',
      message: 'Seller response added successfully',
      data: updated!,
    };
  }

  // ──────────────────────────────────────────────
  //  Voting
  // ──────────────────────────────────────────────

  async voteOnReview(
    userId: string,
    reviewId: string,
    dto: CreateReviewVoteDto,
  ): Promise<ApiResponse<Review>> {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review with ID "${reviewId}" not found`);
    }

    // Prevent voting on own review
    if (review.userId === userId) {
      throw new ForbiddenException('You cannot vote on your own review');
    }

    const existingVote = await this.repository.findVote(reviewId, userId);

    let helpfulDelta = 0;
    let notHelpfulDelta = 0;

    if (existingVote) {
      if (existingVote.voteType === dto.voteType) {
        // Same vote — toggle off (remove vote)
        await this.repository.deleteVote(existingVote.id);
        if (dto.voteType === VoteType.HELPFUL) {
          helpfulDelta = -1;
        } else {
          notHelpfulDelta = -1;
        }
      } else {
        // Opposite vote — flip it
        await this.repository.updateVote(existingVote.id, { voteType: dto.voteType });
        if (dto.voteType === VoteType.HELPFUL) {
          helpfulDelta = 1;
          notHelpfulDelta = -1;
        } else {
          helpfulDelta = -1;
          notHelpfulDelta = 1;
        }
      }
    } else {
      // New vote
      await this.repository.createVote({
        reviewId,
        userId,
        voteType: dto.voteType,
      });
      if (dto.voteType === VoteType.HELPFUL) {
        helpfulDelta = 1;
      } else {
        notHelpfulDelta = 1;
      }
    }

    // Update review counts
    const updatedReview = await this.repository.update(reviewId, {
      helpfulCount: Math.max(0, (review.helpfulCount || 0) + helpfulDelta),
      notHelpfulCount: Math.max(0, (review.notHelpfulCount || 0) + notHelpfulDelta),
    });

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `reviews:product:${review.digitalProductId}`,
      `review:${reviewId}`,
    ]);

    return {
      status: 'success',
      message: 'Vote recorded successfully',
      data: updatedReview!,
    };
  }

  // ──────────────────────────────────────────────
  //  Reporting
  // ──────────────────────────────────────────────

  async reportReview(
    userId: string,
    reviewId: string,
    dto: CreateReviewReportDto,
  ): Promise<ApiResponse<null>> {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review with ID "${reviewId}" not found`);
    }

    // Create report
    await this.repository.createReport({
      reviewId,
      reportedBy: userId,
      reason: dto.reason,
      details: dto.details,
      status: ReportStatus.PENDING,
    });

    // Auto-flag review if report count >= 3
    const reportCount = await this.repository.countPendingReports(reviewId);
    if (reportCount >= 3 && review.status !== ReviewStatus.FLAGGED) {
      await this.repository.update(reviewId, { status: ReviewStatus.FLAGGED });
      this.logger.warn(
        `Review ${reviewId} auto-flagged after ${reportCount} reports`,
      );
    }

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `review:${reviewId}`,
    ]);

    return {
      status: 'success',
      message: 'Review reported successfully',
      data: null,
    };
  }

  // ──────────────────────────────────────────────
  //  Public queries (cached)
  // ──────────────────────────────────────────────

  async getProductReviews(
    productId: string,
    query: ReviewQueryOptions,
  ): Promise<ApiResponse<PaginatedResponse<Review>>> {
    const cacheKey = this.cacheService.generateKey(
      'reviews',
      'product',
      productId,
      query,
    );

    const result = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.findProductReviews(productId, query),
      { ttl: CACHE_TTL_LIST, tags: [CACHE_TAG, `reviews:product:${productId}`] },
    );

    return {
      status: 'success',
      message: 'Product reviews retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async getReviewStats(
    productId: string,
  ): Promise<ApiResponse<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    verifiedPurchasePercent: number;
  }>> {
    const cacheKey = this.cacheService.generateKey(
      'reviews',
      'stats',
      productId,
    );

    const stats = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.getReviewStats(productId),
      { ttl: CACHE_TTL_STATS, tags: [CACHE_TAG, `reviews:product:${productId}`] },
    );

    return {
      status: 'success',
      message: 'Review statistics retrieved successfully',
      data: stats,
    };
  }

  async getTopReviewers(
    limit: number = 10,
  ): Promise<ApiResponse<{ userId: string; reviewCount: number; helpfulCount: number; averageRating: number }[]>> {
    const cacheKey = this.cacheService.generateKey(
      'reviews',
      'top-reviewers',
      limit,
    );

    const reviewers = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.getTopReviewers(limit),
      { ttl: CACHE_TTL_LEADERBOARD, tags: [CACHE_TAG, 'reviews:leaderboard'] },
    );

    return {
      status: 'success',
      message: 'Top reviewers retrieved successfully',
      data: reviewers,
    };
  }

  // ──────────────────────────────────────────────
  //  Admin moderation
  // ──────────────────────────────────────────────

  async moderateReview(
    reviewId: string,
    dto: ModerateReviewDto,
  ): Promise<ApiResponse<Review>> {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review with ID "${reviewId}" not found`);
    }

    // Store moderation info in metadata since entity doesn't have dedicated columns
    const moderationMetadata = {
      ...(review.metadata || {}),
      moderationDecision: dto.status,
      moderationReason: dto.reason,
      moderatedAt: new Date().toISOString(),
    };

    const updated = await this.repository.update(reviewId, {
      status: dto.status,
      metadata: moderationMetadata,
    });

    // If approved, trigger rating recalculation
    if (dto.status === ReviewStatus.APPROVED) {
      this.eventEmitter.emit('review.approved', {
        productId: review.digitalProductId,
        reviewId,
      });
    }

    // Invalidate cache
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `reviews:product:${review.digitalProductId}`,
      `review:${reviewId}`,
    ]);
    this.logger.log(
      `Review ${reviewId} moderated: ${dto.status}${dto.reason ? ` — ${dto.reason}` : ''}`,
    );

    return {
      status: 'success',
      message: `Review ${dto.status} successfully`,
      data: updated!,
    };
  }

  async getModerationQueue(
    cursor?: string,
    limit: number = 20,
  ): Promise<ApiResponse<PaginatedResponse<Review>>> {
    const result = await this.repository.findPendingModeration(cursor, limit);

    return {
      status: 'success',
      message: 'Moderation queue retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async getFlaggedReviews(
    cursor?: string,
    limit: number = 20,
  ): Promise<ApiResponse<PaginatedResponse<Review>>> {
    const result = await this.repository.findFlaggedReviews(cursor, limit);

    return {
      status: 'success',
      message: 'Flagged reviews retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  // ──────────────────────────────────────────────
  //  Social proof
  // ──────────────────────────────────────────────

  async getRecentPurchaseCount(
    productId: string,
    hours: number = 24,
  ): Promise<ApiResponse<{ count: number; hours: number }>> {
    const cacheKey = this.cacheService.generateKey(
      'reviews',
      'recent-purchases',
      productId,
      hours,
    );

    const count = await this.cacheService.wrap(
      cacheKey,
      () => this.repository.countRecentPurchases(productId, hours),
      { ttl: 60, tags: [CACHE_TAG] }, // short TTL for social proof freshness
    );

    return {
      status: 'success',
      message: 'Recent purchase count retrieved successfully',
      data: { count, hours },
    };
  }

  // ──────────────────────────────────────────────
  //  AI moderation
  // ──────────────────────────────────────────────

  async aiModerateReview(review: Review): Promise<AiModerationResult> {
    const prompt = `You are a content moderation AI for a digital product marketplace. Analyze the following product review and determine if it should be approved or rejected.

Review Title: ${review.title}
Review Body: ${review.body}
Rating: ${review.rating}/5
Verified Purchase: ${review.isVerifiedPurchase ? 'Yes' : 'No'}
Pros: ${review.pros?.join(', ') || 'None listed'}
Cons: ${review.cons?.join(', ') || 'None listed'}

Evaluate the review based on these criteria:
1. Is the content appropriate (no hate speech, harassment, or explicit content)?
2. Is it a genuine review (not spam, not a fake review, not just gibberish)?
3. Does the review provide some value to other potential buyers?
4. Is there any personally identifiable information that should not be public?
5. Does the review contain any promotional links or competing product advertisements?

Respond with ONLY a valid JSON object (no markdown, no code blocks):
{
  "shouldApprove": true/false,
  "qualityScore": 0-100,
  "flags": ["list of any issues found"],
  "reason": "brief explanation of the decision"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text response from AI');
      }

      const cleaned = textBlock.text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const result: AiModerationResult = JSON.parse(cleaned);

      this.logger.debug(
        `AI moderation for review ${review.id}: approved=${result.shouldApprove}, score=${result.qualityScore}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `AI moderation error for review ${review.id}: ${(error as Error).message}`,
      );

      // Default to pending manual review on AI failure
      return {
        shouldApprove: false,
        qualityScore: 50,
        flags: ['ai_moderation_failed'],
        reason: 'AI moderation failed, review requires manual moderation',
      };
    }
  }

  // ──────────────────────────────────────────────
  //  Event handlers
  // ──────────────────────────────────────────────

  @OnEvent('review.created')
  async handleReviewCreated(payload: { productId: string; reviewId: string }) {
    this.logger.debug(
      `Handling review.created event for product ${payload.productId}`,
    );
    await this.recalculateProductRating(payload.productId);
  }

  @OnEvent('review.updated')
  async handleReviewUpdated(payload: { productId: string; reviewId: string }) {
    this.logger.debug(
      `Handling review.updated event for product ${payload.productId}`,
    );
    await this.recalculateProductRating(payload.productId);
  }

  @OnEvent('review.approved')
  async handleReviewApproved(payload: { productId: string; reviewId: string }) {
    this.logger.debug(
      `Handling review.approved event for product ${payload.productId}`,
    );
    await this.recalculateProductRating(payload.productId);
  }

  // ──────────────────────────────────────────────
  //  Rating recalculation
  // ──────────────────────────────────────────────

  async recalculateProductRating(productId: string): Promise<void> {
    const stats = await this.repository.getReviewStats(productId);

    await this.digitalProductRepository.update(productId, {
      averageRating: parseFloat(stats.averageRating.toFixed(2)),
      totalReviews: stats.totalReviews,
    });

    // Invalidate related caches
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `reviews:product:${productId}`,
    ]);

    this.logger.debug(
      `Recalculated product ${productId} rating: avg=${stats.averageRating.toFixed(2)}, total=${stats.totalReviews}`,
    );
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  private async runAiModerationAndUpdate(review: Review): Promise<void> {
    const result = await this.aiModerateReview(review);

    // Store AI moderation info in metadata
    const moderationMetadata = {
      ...(review.metadata || {}),
      aiModeration: {
        shouldApprove: result.shouldApprove,
        qualityScore: result.qualityScore,
        flags: result.flags,
        reason: result.reason,
        moderatedAt: new Date().toISOString(),
      },
    };

    if (result.shouldApprove && result.qualityScore >= 30) {
      await this.repository.update(review.id, {
        status: ReviewStatus.APPROVED,
        metadata: moderationMetadata,
      });

      // Trigger rating recalculation after auto-approval
      this.eventEmitter.emit('review.approved', {
        productId: review.digitalProductId,
        reviewId: review.id,
      });
    } else {
      // Keep as pending for manual review or flag if AI flagged issues
      const newStatus =
        result.flags.length > 0 && !result.shouldApprove
          ? ReviewStatus.FLAGGED
          : ReviewStatus.PENDING_MODERATION;

      await this.repository.update(review.id, {
        status: newStatus,
        metadata: moderationMetadata,
      });
    }

    // Invalidate cache after moderation update
    await this.cacheService.invalidateByTags([
      CACHE_TAG,
      `reviews:product:${review.digitalProductId}`,
      `review:${review.id}`,
    ]);
  }
}
