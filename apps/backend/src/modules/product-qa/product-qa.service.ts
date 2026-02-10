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
import { QuestionUpvote } from './entities/question-upvote.entity';
import { AnswerUpvote } from './entities/answer-upvote.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';
import { SellerProfile } from '../../entities/seller-profile.entity';
import { CreateQuestionDto, CreateAnswerDto, QAQueryDto } from './dto/qa.dto';
import { QAStatus, QASortBy } from './enums/qa.enums';
import {
  ApiResponse,
  PaginatedResponse,
} from '../../common/interfaces/response.interface';

@Injectable()
export class ProductQAService {
  private readonly logger = new Logger(ProductQAService.name);

  constructor(
    @InjectRepository(ProductQuestion)
    private readonly questionRepository: Repository<ProductQuestion>,

    @InjectRepository(ProductAnswer)
    private readonly answerRepository: Repository<ProductAnswer>,

    @InjectRepository(QuestionUpvote)
    private readonly questionUpvoteRepository: Repository<QuestionUpvote>,

    @InjectRepository(AnswerUpvote)
    private readonly answerUpvoteRepository: Repository<AnswerUpvote>,

    @InjectRepository(DigitalProduct)
    private readonly digitalProductRepository: Repository<DigitalProduct>,

    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepository: Repository<SellerProfile>,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ──────────────────────────────────────────────
  //  Create question
  // ──────────────────────────────────────────────

  async createQuestion(
    userId: string,
    dto: CreateQuestionDto,
  ): Promise<ApiResponse<ProductQuestion>> {
    const product = await this.digitalProductRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID "${dto.productId}" not found`,
      );
    }

    const question = this.questionRepository.create({
      productId: dto.productId,
      userId,
      content: dto.content,
      status: QAStatus.APPROVED,
    });

    const saved = await this.questionRepository.save(question);

    this.eventEmitter.emit('question.created', {
      userId,
      questionId: saved.id,
      productId: dto.productId,
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
    const { productId, page, limit, sortBy } = query;
    const skip = (page - 1) * limit;

    const qb = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.user', 'user')
      .where('question.productId = :productId', { productId })
      .andWhere('question.status = :status', { status: QAStatus.APPROVED });

    // Apply sorting
    switch (sortBy) {
      case QASortBy.POPULAR:
        qb.orderBy('question.upvoteCount', 'DESC');
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

    const [questions, total] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // For each question, load the top answer
    const questionsWithTopAnswer = await Promise.all(
      questions.map(async (question) => {
        const topAnswer = await this.answerRepository
          .createQueryBuilder('answer')
          .leftJoinAndSelect('answer.user', 'user')
          .where('answer.questionId = :questionId', {
            questionId: question.id,
          })
          .orderBy('answer.isAccepted', 'DESC')
          .addOrderBy('answer.isSellerAnswer', 'DESC')
          .addOrderBy('answer.upvoteCount', 'DESC')
          .limit(1)
          .getOne();

        return {
          ...question,
          topAnswer: topAnswer || null,
        };
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      status: 'success',
      message: 'Questions retrieved successfully',
      data: {
        items: questionsWithTopAnswer as any,
        meta: {
          total,
          page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      meta: {
        total,
        page,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Get single question with all answers
  // ──────────────────────────────────────────────

  async getQuestion(
    id: string,
  ): Promise<ApiResponse<ProductQuestion>> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }

    // Load answers sorted: accepted first, then seller answers, then by upvotes, then chronologically
    const answers = await this.answerRepository
      .createQueryBuilder('answer')
      .leftJoinAndSelect('answer.user', 'user')
      .where('answer.questionId = :questionId', { questionId: id })
      .orderBy('answer.isAccepted', 'DESC')
      .addOrderBy('answer.isSellerAnswer', 'DESC')
      .addOrderBy('answer.upvoteCount', 'DESC')
      .addOrderBy('answer.createdAt', 'ASC')
      .getMany();

    question.answers = answers;

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
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(
        `Question with ID "${questionId}" not found`,
      );
    }

    // Determine if the answering user is the product seller
    let isSellerAnswer = false;

    const product = await this.digitalProductRepository.findOne({
      where: { id: question.productId },
    });

    if (product) {
      // Check if user is the product creator
      if (product.createdBy === userId) {
        isSellerAnswer = true;
      } else {
        // Also check via SellerProfile
        const sellerProfile = await this.sellerProfileRepository.findOne({
          where: { userId },
        });
        if (sellerProfile) {
          // Check if this seller created the product
          const productCreatorProfile =
            await this.sellerProfileRepository.findOne({
              where: { userId: product.createdBy },
            });
          if (
            productCreatorProfile &&
            productCreatorProfile.userId === userId
          ) {
            isSellerAnswer = true;
          }
        }
      }
    }

    const answer = this.answerRepository.create({
      questionId,
      userId,
      content: dto.content,
      isSellerAnswer,
    });

    const saved = await this.answerRepository.save(answer);

    // Increment answer count on the question
    await this.questionRepository.increment(
      { id: questionId },
      'answerCount',
      1,
    );

    this.eventEmitter.emit('answer.created', {
      userId,
      questionId,
      answerId: saved.id,
      productId: question.productId,
    });

    this.logger.debug(
      `Answer ${saved.id} created for question ${questionId} by user ${userId} (seller: ${isSellerAnswer})`,
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

    // Only the question author (OP) can accept an answer
    if (answer.question.userId !== userId) {
      throw new ForbiddenException(
        'Only the question author can accept an answer',
      );
    }

    // Unset any previously accepted answer on the same question
    await this.answerRepository.update(
      { questionId: answer.questionId, isAccepted: true },
      { isAccepted: false },
    );

    // Set this answer as accepted
    answer.isAccepted = true;
    const saved = await this.answerRepository.save(answer);

    this.eventEmitter.emit('answer.accepted', {
      userId: answer.userId,
      questionId: answer.questionId,
      answerId,
    });

    this.logger.debug(
      `Answer ${answerId} accepted for question ${answer.questionId}`,
    );

    return {
      status: 'success',
      message: 'Answer accepted successfully',
      data: saved,
    };
  }

  // ──────────────────────────────────────────────
  //  Upvote question (toggle)
  // ──────────────────────────────────────────────

  async upvoteQuestion(
    questionId: string,
    userId: string,
  ): Promise<ApiResponse<{ upvoted: boolean; upvoteCount: number }>> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(
        `Question with ID "${questionId}" not found`,
      );
    }

    const existingUpvote = await this.questionUpvoteRepository.findOne({
      where: { questionId, userId },
    });

    let upvoted: boolean;

    if (existingUpvote) {
      // Remove upvote
      await this.questionUpvoteRepository.remove(existingUpvote);
      await this.questionRepository.decrement(
        { id: questionId },
        'upvoteCount',
        1,
      );
      upvoted = false;
    } else {
      // Add upvote
      const upvote = this.questionUpvoteRepository.create({
        questionId,
        userId,
      });
      await this.questionUpvoteRepository.save(upvote);
      await this.questionRepository.increment(
        { id: questionId },
        'upvoteCount',
        1,
      );
      upvoted = true;
    }

    // Fetch updated count
    const updated = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    return {
      status: 'success',
      message: upvoted
        ? 'Question upvoted successfully'
        : 'Question upvote removed successfully',
      data: {
        upvoted,
        upvoteCount: updated?.upvoteCount ?? 0,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Upvote answer (toggle)
  // ──────────────────────────────────────────────

  async upvoteAnswer(
    answerId: string,
    userId: string,
  ): Promise<ApiResponse<{ upvoted: boolean; upvoteCount: number }>> {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
    });

    if (!answer) {
      throw new NotFoundException(`Answer with ID "${answerId}" not found`);
    }

    const existingUpvote = await this.answerUpvoteRepository.findOne({
      where: { answerId, userId },
    });

    let upvoted: boolean;

    if (existingUpvote) {
      // Remove upvote
      await this.answerUpvoteRepository.remove(existingUpvote);
      await this.answerRepository.decrement(
        { id: answerId },
        'upvoteCount',
        1,
      );
      upvoted = false;
    } else {
      // Add upvote
      const upvote = this.answerUpvoteRepository.create({
        answerId,
        userId,
      });
      await this.answerUpvoteRepository.save(upvote);
      await this.answerRepository.increment(
        { id: answerId },
        'upvoteCount',
        1,
      );
      upvoted = true;
    }

    // Fetch updated count
    const updated = await this.answerRepository.findOne({
      where: { id: answerId },
    });

    return {
      status: 'success',
      message: upvoted
        ? 'Answer upvoted successfully'
        : 'Answer upvote removed successfully',
      data: {
        upvoted,
        upvoteCount: updated?.upvoteCount ?? 0,
      },
    };
  }
}
