import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Showcase } from './entities/showcase.entity';
import { ShowcaseLike } from './entities/showcase-like.entity';
import { ShowcaseComment } from './entities/showcase-comment.entity';
import { Order, OrderStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { ShowcaseStatus } from './enums/showcase.enums';
import {
  CreateShowcaseDto,
  UpdateShowcaseDto,
  ShowcaseQueryDto,
  ShowcaseCommentDto,
  ShowcaseSortBy,
} from './dto/showcase.dto';
import { ApiResponse, PaginatedResponse } from '../../common/interfaces/response.interface';

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
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
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

    // Verify user has purchased the product
    const hasPurchased = await this.verifyPurchase(userId, dto.productId);
    if (!hasPurchased) {
      throw new BadRequestException(
        'You must purchase this product before creating a showcase',
      );
    }

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

    this.eventEmitter.emit('showcase.created', {
      userId,
      showcaseId: saved.id,
    });

    this.logger.debug(
      `Showcase ${saved.id} created by user ${userId} for product ${dto.productId}`,
    );

    return {
      status: 'success',
      message: 'Showcase submitted successfully and is pending approval',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Find all showcases (paginated)
  // ──────────────────────────────────────────────

  async findAll(
    query: ShowcaseQueryDto,
  ): Promise<ApiResponse<PaginatedResponse<Showcase>>> {
    const { page = 1, limit = 20, sortBy, status, userId, productId } = query;

    const qb = this.showcaseRepository
      .createQueryBuilder('showcase')
      .leftJoinAndSelect('showcase.user', 'user')
      .leftJoinAndSelect('showcase.product', 'product');

    // For public queries, only show approved or featured
    if (status) {
      qb.andWhere('showcase.status = :status', { status });
    } else {
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

    // Sorting
    switch (sortBy) {
      case ShowcaseSortBy.POPULAR:
        qb.orderBy('showcase.likesCount', 'DESC');
        qb.addOrderBy('showcase.viewCount', 'DESC');
        break;
      case ShowcaseSortBy.FEATURED:
        qb.orderBy(
          `CASE WHEN showcase.status = '${ShowcaseStatus.FEATURED}' THEN 0 ELSE 1 END`,
          'ASC',
        );
        qb.addOrderBy('showcase.createdAt', 'DESC');
        break;
      case ShowcaseSortBy.NEWEST:
      default:
        qb.orderBy('showcase.createdAt', 'DESC');
        break;
    }

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

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

    if (showcase.userId !== userId) {
      throw new ForbiddenException('You can only update your own showcases');
    }

    const updatedData: Partial<Showcase> = {};
    if (dto.title !== undefined) updatedData.title = dto.title;
    if (dto.description !== undefined) updatedData.description = dto.description;
    if (dto.images !== undefined) updatedData.images = dto.images;
    if (dto.projectUrl !== undefined) updatedData.projectUrl = dto.projectUrl;
    if (dto.tags !== undefined) updatedData.tags = dto.tags;

    await this.showcaseRepository.update(id, updatedData);

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

  async remove(
    id: string,
    userId: string,
  ): Promise<ApiResponse<null>> {
    const showcase = await this.showcaseRepository.findOne({
      where: { id },
    });

    if (!showcase) {
      throw new NotFoundException(`Showcase with ID "${id}" not found`);
    }

    if (showcase.userId !== userId) {
      throw new ForbiddenException('You can only delete your own showcases');
    }

    await this.showcaseRepository.softDelete(id);

    this.logger.debug(`Showcase ${id} soft-deleted by user ${userId}`);

    return {
      status: 'success',
      message: 'Showcase removed successfully',
      data: null,
    };
  }

  // ──────────────────────────────────────────────
  //  Toggle like
  // ──────────────────────────────────────────────

  async toggleLike(
    showcaseId: string,
    userId: string,
  ): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
    const showcase = await this.showcaseRepository.findOne({
      where: { id: showcaseId },
    });

    if (!showcase) {
      throw new NotFoundException(`Showcase with ID "${showcaseId}" not found`);
    }

    const existingLike = await this.showcaseLikeRepository.findOne({
      where: { showcaseId, userId },
    });

    let liked: boolean;

    if (existingLike) {
      // Remove like
      await this.showcaseLikeRepository.remove(existingLike);
      await this.showcaseRepository.decrement({ id: showcaseId }, 'likesCount', 1);
      liked = false;
    } else {
      // Add like
      const like = this.showcaseLikeRepository.create({
        showcaseId,
        userId,
      });
      await this.showcaseLikeRepository.save(like);
      await this.showcaseRepository.increment({ id: showcaseId }, 'likesCount', 1);
      liked = true;

      this.eventEmitter.emit('showcase.liked', {
        showcaseId,
        userId,
        showcaseOwnerId: showcase.userId,
      });
    }

    const updatedShowcase = await this.showcaseRepository.findOne({
      where: { id: showcaseId },
    });

    this.logger.debug(
      `Showcase ${showcaseId} ${liked ? 'liked' : 'unliked'} by user ${userId}`,
    );

    return {
      status: 'success',
      message: liked ? 'Showcase liked' : 'Showcase unliked',
      data: {
        liked,
        likesCount: updatedShowcase!.likesCount,
      },
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
      throw new NotFoundException(`Showcase with ID "${showcaseId}" not found`);
    }

    // Validate parent comment exists if parentId is provided
    if (dto.parentId) {
      const parentComment = await this.showcaseCommentRepository.findOne({
        where: { id: dto.parentId, showcaseId },
      });
      if (!parentComment) {
        throw new NotFoundException(
          `Parent comment with ID "${dto.parentId}" not found`,
        );
      }
    }

    const comment = this.showcaseCommentRepository.create({
      showcaseId,
      userId,
      content: dto.content,
      parentId: dto.parentId,
    });

    const saved = await this.showcaseCommentRepository.save(comment);

    // Increment comments count
    await this.showcaseRepository.increment({ id: showcaseId }, 'commentsCount', 1);

    this.eventEmitter.emit('showcase.commented', {
      showcaseId,
      userId,
      commentId: saved.id,
      showcaseOwnerId: showcase.userId,
    });

    // Reload with user relation
    const commentWithUser = await this.showcaseCommentRepository.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });

    this.logger.debug(
      `Comment ${saved.id} added to showcase ${showcaseId} by user ${userId}`,
    );

    return {
      status: 'success',
      message: 'Comment added successfully',
      data: commentWithUser!,
    };
  }

  // ──────────────────────────────────────────────
  //  Get comments (paginated, nested)
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
      throw new NotFoundException(`Showcase with ID "${showcaseId}" not found`);
    }

    // Get top-level comments with null parentId
    const qb = this.showcaseCommentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.children', 'children')
      .leftJoinAndSelect('children.user', 'childUser')
      .where('comment.showcaseId = :showcaseId', { showcaseId })
      .andWhere('comment.parentId IS NULL')
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [comments, count] = await qb.getManyAndCount();
    const totalPages = Math.ceil(count / limit);

    return {
      status: 'success',
      message: 'Comments retrieved successfully',
      data: {
        items: comments,
        meta: {
          page,
          limit,
          total: count,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      meta: {
        page,
        limit,
        total: count,
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

    this.eventEmitter.emit('showcase.moderated', {
      showcaseId: id,
      status,
      userId: showcase.userId,
    });

    this.logger.log(`Showcase ${id} moderated: ${status}`);

    return {
      status: 'success',
      message: `Showcase ${status} successfully`,
      data: updated!,
    };
  }

  // ──────────────────────────────────────────────
  //  Private helpers
  // ──────────────────────────────────────────────

  private async verifyPurchase(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    // Check if the user has a completed order containing this product
    const orderWithProduct = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .where('order.userId = :userId', { userId })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [OrderStatus.COMPLETED],
      })
      .andWhere('item.digitalProductId = :productId', { productId })
      .getOne();

    return !!orderWithProduct;
  }
}
