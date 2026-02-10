import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductQAService } from './product-qa.service';
import { CreateQuestionDto, CreateAnswerDto, QAQueryDto, QASortBy } from './dto/qa.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Product Q&A')
@Controller('product-qa')
@UseGuards(RolesGuard, PermissionsGuard)
export class ProductQAController {
  constructor(private readonly productQAService: ProductQAService) {}

  // ──────────────────────────────────────────────
  //  Questions
  // ──────────────────────────────────────────────

  @Post('questions')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new question for a product' })
  @SwaggerResponse({ status: 201, description: 'Question created successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 404, description: 'Product not found' })
  async createQuestion(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.productQAService.createQuestion(userId, dto);
  }

  @Get('questions')
  @Public()
  @ApiOperation({ summary: 'Get questions for a product' })
  @SwaggerResponse({ status: 200, description: 'Questions retrieved successfully' })
  @ApiQuery({ name: 'productId', required: true, description: 'Product ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, enum: QASortBy, description: 'Sort order' })
  async getQuestions(@Query() query: QAQueryDto) {
    return this.productQAService.getQuestions(query);
  }

  @Get('questions/:id')
  @Public()
  @ApiOperation({ summary: 'Get a question with all its answers' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @SwaggerResponse({ status: 200, description: 'Question retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Question not found' })
  async getQuestion(@Param('id', ParseUUIDPipe) id: string) {
    return this.productQAService.getQuestion(id);
  }

  // ──────────────────────────────────────────────
  //  Answers
  // ──────────────────────────────────────────────

  @Post('questions/:id/answers')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Answer a question' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @SwaggerResponse({ status: 201, description: 'Answer created successfully' })
  @SwaggerResponse({ status: 404, description: 'Question not found' })
  async createAnswer(
    @Param('id', ParseUUIDPipe) questionId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAnswerDto,
  ) {
    return this.productQAService.createAnswer(questionId, userId, dto);
  }

  @Post('answers/:id/accept')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an answer (question author only)' })
  @ApiParam({ name: 'id', description: 'Answer ID' })
  @SwaggerResponse({ status: 200, description: 'Answer accepted successfully' })
  @SwaggerResponse({ status: 403, description: 'Only the question author can accept an answer' })
  @SwaggerResponse({ status: 404, description: 'Answer not found' })
  async acceptAnswer(
    @Param('id', ParseUUIDPipe) answerId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.productQAService.acceptAnswer(answerId, userId);
  }

  // ──────────────────────────────────────────────
  //  Upvotes
  // ──────────────────────────────────────────────

  @Post('questions/:id/upvote')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upvote a question' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @SwaggerResponse({ status: 200, description: 'Question upvoted successfully' })
  @SwaggerResponse({ status: 404, description: 'Question not found' })
  async upvoteQuestion(
    @Param('id', ParseUUIDPipe) questionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.productQAService.upvoteQuestion(questionId, userId);
  }

  @Post('answers/:id/upvote')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upvote an answer' })
  @ApiParam({ name: 'id', description: 'Answer ID' })
  @SwaggerResponse({ status: 200, description: 'Answer upvoted successfully' })
  @SwaggerResponse({ status: 404, description: 'Answer not found' })
  async upvoteAnswer(
    @Param('id', ParseUUIDPipe) answerId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.productQAService.upvoteAnswer(answerId, userId);
  }
}
