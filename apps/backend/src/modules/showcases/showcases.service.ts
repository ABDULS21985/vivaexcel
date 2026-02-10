import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Showcase } from './entities/showcase.entity';
import { ShowcaseLike } from './entities/showcase-like.entity';
import { ShowcaseComment } from './entities/showcase-comment.entity';
import { Order } from '../../entities/order.entity';
import { OrderStatus } from '../../entities/order.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { ShowcaseStatus } from './enums/showcase.enums';
import {
  CreateShowcaseDto,
  UpdateShowcaseDto,
  ShowcaseQueryDto,
  ShowcaseCommentDto,
  ShowcaseSortBy,
} from './dto/showcase.dto';
import {
  ApiResponse,
  PaginatedResponse,
} from '../../common/interfaces/response.interface';

@Injectable()
export class ShowcasesService {
  private readonly logger = new Logger(ShowcasesService.name);

  constructor(
    @InjectRepository(Showcase)
    private readonly showcaseRepository: Repository<Showcase>,
    @InjectRepository(ShowcaseLike)
    private readonly showcaseLikeRepository: Repository<ShowcaseLike>,
    @InjectRepository(ShowcaseComment)
    private readonly showcaseCommentRepository: Repository<ShowcaseComment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepository: Repository<DigitalProduct>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ──────────────────────────────────────────────
  //  Create showcase
  // ──────────────────────────────────────────────

  async create(
    userId: string,
    dto: CreateShowcaseDto,
  ): Promise<ApiResponse<Showcase>> {
    // Verify the product exists
    const product = await this.digitalProductRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID "${dto.productId}" not found`,
      );
    }

    // Verify user owns the product (has a completed order containing this product)
    const userOrder = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .where('order.userId = :userId', { userId })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('item.digitalProductId = :productId', {
        productId: dto.productId,
      })
      .getOne();

    if (!userOrder) {
      throw new ForbiddenException(
        'You must have purchased this product to create a showcase',
      );
    }

    // Create showcase with PENDING status
    const showcase = this.showcaseRepository.create({
      userId,
      productId: dto.productId,
      title: dto.title,
      description: dto.description,
      images: dto.images || [],
      projectUrl: dto.projectUrl,
      tags: dto.tags || [],
      status: ShowcaseStatus.PENDING,
      likesCount: 0,
      commentsCount: 0,
      viewCount: 0,
    });

    const saved = await this.showcaseRepository.save(showcase);

    // Emit event
    this.eventEmitter.emit('showcase.created', {
      userId,
      showcaseId: saved.id,
    });

    this.logger.debug(
      `Showcase ${saved.id} created by user ${userId} for product ${dto.productId}`,
    );

    return {
      status: 'success',
      message: 'Showcase submitted successfully and is pending review',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Find all showcases
  // ──────────────────────────────────────────────

  async findAll(
    query: ShowcaseQueryDto,
  ): Promise<ApiResponse<PaginatedResponse<Showcase>>> {
    const { page = 1, limit = 20, sortBy, status, userId, productId } = query;
    const skip = (page - 1) * limit;

    const qb = this.showcaseRepository
      .createQueryBuilder('showcase')
      .leftJoinAndSelect('showcase.user', 'user')
      .leftJoinAndSelect('showcase.product', 'product');

    // Apply filters
    if (status) {
      qb.andWhere('showcase.status = :status', { status });
    } else {
      // For public queries, default to APPROVED and FEATURED statuses only
      qb.andWhere('showcase.status IN (:...statuses)', {
        statuses: [ShowcaseStatus.APPROVED, ShowcaseStatus.FEATURED],
      });
    }

    if (userId) {
      qb.andWhere('showcase.userId = :userId', { userId });
    }

    if (productId) {
      qb.andWhere('showcase.productId = :productId', { productId });
    }

    // Apply sorting
    switch (sortBy) {
      case ShowcaseSortBy.POPULAR:
        qb.orderBy('showcase.likesCount', 'DESC');
        break;
      case ShowcaseSortBy.FEATURED:
        qb.orderBy(
          `CASE WHEN showcase.status = '${ShowcaseStatus.FEATURED}' THEN 0 ELSE 1 END`,
          'ASC',
        ).addOrderBy('showcase.createdAt', 'DESC');
        break;
      case ShowcaseSortBy.NEWEST:
      default:
        qb.orderBy('showcase.createdAt', 'DESC');
        break;
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      status: 'success',
      message: 'Showcases retrieved successfully',
      data: {
        items,
        meta: {
          page,
          limit,
          total,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      meta: {
        page,
        limit,
        total,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Find one showcase
  // ──────────────────────────────────────────────

  async findOne(id: string): Promise<ApiResponse<Showcase>> {
    const showcase = await this.showcaseRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!showcase) {
      throw new NotFoundException(`Showcase with ID "${id}" not found`);
    }

    // Increment view count
    await this.showcaseRepository.increment({ id }, 'viewCount', 1);
    showcase.viewCount += 1;

    return {
      status: 'success',
      message: 'Showcase retrieved successfully',
      data: showcase,
    };
  }

  // ──────────────────────────────────────────────
  //  Update showcase
  // ──────────────────────────────────────────────

  async update(
    id: string,
    userId: string,
    dto: UpdateShowcaseDto,
  ): Promise<ApiResponse<Showcase>> {
    const showcase = await this.showcaseRepository.findOne({
      where: { id },
    });

    if (!showcase) {
      throw new NotFoundException(`Showcase with ID "${id}" not found`);
    }

    // Verify ownership
    if (showcase.userId !== userId) {
      throw new ForbiddenException('You can only update your own showcases');
    }

    // Update fields
    const updateData: Partial<Showcase> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.images !== undefined) updateData.images = dto.images;
    if (dto.projectUrl !== undefined) updateData.projectUrl = dto.projectUrl;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.productId !== undefined) updateData.productId = dto.productId;

    await this.showcaseRepository.update(id, updateData);

    const updated = await this.showcaseRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    this.logger.debug(`Showcase ${id} updated by user ${userId}`);

    return {
      status: 'success',
      message: 'Showcase updated successfully',
      data: updated!,
    };
  }

  // ──────────────────────────────────────────────
  //  Remove showcase (soft delete)
  // ──────────────────────────────────────────────

  async remove(id: string, userId: string): Promise<ApiResponse<null>> {
    const showcase = await this.showcaseRepository.findOne({
      where: { id },
    });

    if (!showcase) {
      throw new NotFoundException(`Showcase with ID "${id}" not found`);
    }

    // Verify ownership
    if (showcase.userId !== userId) {
      throw new ForbiddenException('You can only delete your own showcases');
    }

    await this.showcaseRepository.softDelete(id);

    this.logger.debug(`Showcase ${id} soft-deleted by user ${userId}`);

    return {
      status: 'success',
      message: 'Showcase deleted successfully',
      data: null,
    };
  }

  // ──────────────────────────────────────────────
  //  Toggle like
  // ──────────────────────────────────────────────

  async toggleLike(
    showcaseId: string,
    userId: string,
  ): Promise<ApiResponse<{ liked: boolean }>> {
    const showcase = await this.showcaseRepository.findOne({
      where: { id: showcaseId },
    });

    if (!showcase) {
      throw new NotFoundException(
        `Showcase with ID "${showcaseId}" not found`,
      );
    }

    // Check if like exists
    const existingLike = await this.showcaseLikeRepository.findOne({
      where: { showcaseId, userId },
    });

    let liked: boolean;

    if (existingLike) {
      // Remove like
      await this.showcaseLikeRepository.remove(existingLike);
      await this.showcaseRepository.decrement(
        { id: showcaseId },
        'likesCount',
        1,
      );
      liked = false;
    } else {
      // Add like
      const like = this.showcaseLikeRepository.create({
        showcaseId,
        userId,
      });
      await this.showcaseLikeRepository.save(like);
      await this.showcaseRepository.increment(
        { id: showcaseId },
        'likesCount',
        1,
      );
      liked = true;
    }

    // Emit event
    this.eventEmitter.emit('showcase.liked', {
      showcaseId,
      userId,
      liked,
    });

    this.logger.debug(
      `User ${userId} ${liked ? 'liked' : 'unliked'} showcase ${showcaseId}`,
    );

    return {
      status: 'success',
      message: liked
        ? 'Showcase liked successfully'
        : 'Showcase unliked successfully',
      data: { liked },
    };
  }

  // ──────────────────────────────────────────────
  //  Add comment
  // ──────────────────────────────────────────────

  async addComment(
    showcaseId: string,
    userId: string,
    dto: ShowcaseCommentDto,
  ): Promise<ApiResponse<ShowcaseComment>> {
    const showcase = await this.showcaseRepository.findOne({
      where: { id: showcaseId },
    });

    if (!showcase) {
      throw new NotFoundException(
        `Showcase with ID "${showcaseId}" not found`,
      );
    }

    // If parentId is provided, verify the parent comment exists and belongs to the same showcase
    if (dto.parentId) {
      const parentComment = await this.showcaseCommentRepository.findOne({
        where: { id: dto.parentId, showcaseId },
      });
      if (!parentComment) {
        throw new BadRequestException(
          `Parent comment with ID "${dto.parentId}" not found in this showcase`,
        );
      }
    }

    const comment = this.showcaseCommentRepository.create({
      showcaseId,
      userId,
      content: dto.content,
      parentId: dto.parentId || undefined,
    });

    const saved = await this.showcaseCommentRepository.save(comment);

    // Increment comments count on showcase
    await this.showcaseRepository.increment(
      { id: showcaseId },
      'commentsCount',
      1,
    );

    // Emit event
    this.eventEmitter.emit('showcase.commented', {
      showcaseId,
      userId,
      commentId: saved.id,
    });

    this.logger.debug(
      `User ${userId} commented on showcase ${showcaseId}`,
    );

    return {
      status: 'success',
      message: 'Comment added successfully',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Get comments
  // ──────────────────────────────────────────────

  async getComments(
    showcaseId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse<PaginatedResponse<ShowcaseComment>>> {
    const showcase = await this.showcaseRepository.findOne({
      where: { id: showcaseId },
    });

    if (!showcase) {
      throw new NotFoundException(
        `Showcase with ID "${showcaseId}" not found`,
      );
    }

    const skip = (page - 1) * limit;

    // Get top-level comments (parentId IS NULL) with nested children
    const [items, totalCount] = await this.showcaseCommentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.children', 'children')
      .leftJoinAndSelect('children.user', 'childUser')
      .where('comment.showcaseId = :showcaseId', { showcaseId })
      .andWhere('comment.parentId IS NULL')
      .orderBy('comment.createdAt', 'DESC')
      .addOrderBy('children.createdAt', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalCount / limit);

    return {
      status: 'success',
      message: 'Comments retrieved successfully',
      data: {
        items,
        meta: {
          page,
          limit,
          total: totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      meta: {
        page,
        limit,
        total: totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Moderate showcase (admin)
  // ──────────────────────────────────────────────

  async moderate(
    id: string,
    status: ShowcaseStatus,
  ): Promise<ApiResponse<Showcase>> {
    const showcase = await this.showcaseRepository.findOne({
      where: { id },
    });

    if (!showcase) {
      throw new NotFoundException(`Showcase with ID "${id}" not found`);
    }

    await this.showcaseRepository.update(id, { status });

    const updated = await this.showcaseRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    // Emit event
    this.eventEmitter.emit('showcase.moderated', {
      showcaseId: id,
      previousStatus: showcase.status,
      newStatus: status,
    });

    this.logger.log(
      `Showcase ${id} moderated: ${showcase.status} -> ${status}`,
    );

    return {
      status: 'success',
      message: `Showcase ${status} successfully`,
      data: updated!,
    };
  }
}
