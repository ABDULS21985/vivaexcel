import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductQuestion } from './entities/product-question.entity';
import { ProductAnswer } from './entities/product-answer.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { CreateQuestionDto, CreateAnswerDto, QAQueryDto, QASortBy } from './dto/qa.dto';
import { QAStatus } from './enums/qa.enums';
import {
  ApiResponse,
  PaginatedResponse,
  ResponseMeta,
} from '../../common/interfaces/response.interface';

@Injectable()
export class ProductQAService {
  private readonly logger = new Logger(ProductQAService.name);

  constructor(
    @InjectRepository(ProductQuestion)
    private readonly questionRepository: Repository<ProductQuestion>,
    @InjectRepository(ProductAnswer)
    private readonly answerRepository: Repository<ProductAnswer>,
    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepository: Repository<DigitalProduct>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ──────────────────────────────────────────────
  //  Create question
  // ──────────────────────────────────────────────

  async createQuestion(
    userId: string,
    dto: CreateQuestionDto,
  ): Promise<ApiResponse<ProductQuestion>> {
    // Verify the product exists
    const product = await this.digitalProductRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID "${dto.productId}" not found`,
      );
    }

    const question = this.questionRepository.create({
      userId,
      productId: dto.productId,
      content: dto.content,
      status: QAStatus.APPROVED,
      answerCount: 0,
      upvoteCount: 0,
    });

    const saved = await this.questionRepository.save(question);

    // Emit event
    this.eventEmitter.emit('question.created', {
      userId,
      questionId: saved.id,
    });

    this.logger.debug(
      `Question ${saved.id} created for product ${dto.productId} by user ${userId}`,
    );

    return {
      status: 'success',
      message: 'Question created successfully',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Get questions (paginated)
  // ──────────────────────────────────────────────

  async getQuestions(
    query: QAQueryDto,
  ): Promise<ApiResponse<PaginatedResponse<ProductQuestion>>> {
    const { productId, page = 1, limit = 20, sortBy = QASortBy.NEWEST } = query;

    const qb = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.user', 'user')
      .where('question.productId = :productId', { productId })
      .andWhere('question.status = :status', { status: QAStatus.APPROVED });

    // Apply sorting
    switch (sortBy) {
      case QASortBy.POPULAR:
        qb.orderBy('question.upvoteCount', 'DESC')
          .addOrderBy('question.createdAt', 'DESC');
        break;
      case QASortBy.UNANSWERED:
        qb.orderBy('question.answerCount', 'ASC')
          .addOrderBy('question.createdAt', 'DESC');
        break;
      case QASortBy.NEWEST:
      default:
        qb.orderBy('question.createdAt', 'DESC');
        break;
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    const meta: ResponseMeta = {
      total,
      page,
      limit,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };

    return {
      status: 'success',
      message: 'Questions retrieved successfully',
      data: { items, meta },
      meta,
    };
  }

  // ──────────────────────────────────────────────
  //  Get single question with answers
  // ──────────────────────────────────────────────

  async getQuestion(
    id: string,
  ): Promise<ApiResponse<ProductQuestion>> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['user', 'answers', 'answers.user'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Question retrieved successfully',
      data: question,
    };
  }

  // ──────────────────────────────────────────────
  //  Create answer
  // ──────────────────────────────────────────────

  async createAnswer(
    questionId: string,
    userId: string,
    dto: CreateAnswerDto,
  ): Promise<ApiResponse<ProductAnswer>> {
    // Load question with product relation to check seller
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['product'],
    });

    if (!question) {
      throw new NotFoundException(
        `Question with ID "${questionId}" not found`,
      );
    }

    // Determine if this user is the product seller
    const isSellerAnswer = question.product?.createdBy === userId;

    const answer = this.answerRepository.create({
      questionId,
      userId,
      content: dto.content,
      isSellerAnswer,
      isAccepted: false,
      upvoteCount: 0,
    });

    const saved = await this.answerRepository.save(answer);

    // Increment answer count on the question
    await this.questionRepository.increment(
      { id: questionId },
      'answerCount',
      1,
    );

    // Emit event
    this.eventEmitter.emit('answer.created', {
      userId,
      questionId,
      answerId: saved.id,
    });

    this.logger.debug(
      `Answer ${saved.id} created for question ${questionId} by user ${userId}${isSellerAnswer ? ' (seller)' : ''}`,
    );

    return {
      status: 'success',
      message: 'Answer created successfully',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Accept answer
  // ──────────────────────────────────────────────

  async acceptAnswer(
    answerId: string,
    userId: string,
  ): Promise<ApiResponse<ProductAnswer>> {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
      relations: ['question'],
    });

    if (!answer) {
      throw new NotFoundException(`Answer with ID "${answerId}" not found`);
    }

    // Only the question author can accept an answer
    if (answer.question.userId !== userId) {
      throw new ForbiddenException(
        'Only the question author can accept an answer',
      );
    }

    answer.isAccepted = true;
    const saved = await this.answerRepository.save(answer);

    // Emit event
    this.eventEmitter.emit('answer.accepted', {
      userId,
      answerId: saved.id,
    });

    this.logger.debug(
      `Answer ${answerId} accepted by user ${userId}`,
    );

    return {
      status: 'success',
      message: 'Answer accepted successfully',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Upvote question
  // ──────────────────────────────────────────────

  async upvoteQuestion(
    questionId: string,
    userId: string,
  ): Promise<ApiResponse<{ upvoteCount: number }>> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(
        `Question with ID "${questionId}" not found`,
      );
    }

    await this.questionRepository.increment(
      { id: questionId },
      'upvoteCount',
      1,
    );

    const updatedCount = question.upvoteCount + 1;

    this.logger.debug(
      `Question ${questionId} upvoted by user ${userId}, new count: ${updatedCount}`,
    );

    return {
      status: 'success',
      message: 'Question upvoted successfully',
      data: { upvoteCount: updatedCount },
    };
  }

  // ──────────────────────────────────────────────
  //  Upvote answer
  // ──────────────────────────────────────────────

  async upvoteAnswer(
    answerId: string,
    userId: string,
  ): Promise<ApiResponse<{ upvoteCount: number }>> {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
    });

    if (!answer) {
      throw new NotFoundException(`Answer with ID "${answerId}" not found`);
    }

    await this.answerRepository.increment(
      { id: answerId },
      'upvoteCount',
      1,
    );

    const updatedCount = answer.upvoteCount + 1;

    this.logger.debug(
      `Answer ${answerId} upvoted by user ${userId}, new count: ${updatedCount}`,
    );

    return {
      status: 'success',
      message: 'Answer upvoted successfully',
      data: { upvoteCount: updatedCount },
    };
  }
}
