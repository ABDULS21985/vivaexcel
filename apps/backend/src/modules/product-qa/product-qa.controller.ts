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
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProductQAService } from './product-qa.service';
import { CreateQuestionDto, CreateAnswerDto, QAQueryDto } from './dto/qa.dto';

@ApiTags('Product Q&A')
@Controller('product-qa')
export class ProductQAController {
  constructor(private readonly productQAService: ProductQAService) {}

  // ──────────────────────────────────────────────
  //  Questions
  // ──────────────────────────────────────────────

  @Post('questions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ask a question about a product' })
  @SwaggerResponse({ status: 201, description: 'Question created successfully' })
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
  async getQuestions(@Query() query: QAQueryDto) {
    return this.productQAService.getQuestions(query);
  }

  @Get('questions/:id')
  @Public()
  @ApiOperation({ summary: 'Get a single question with all answers' })
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an answer (question author only)' })
  @ApiParam({ name: 'id', description: 'Answer ID' })
  @SwaggerResponse({ status: 200, description: 'Answer accepted successfully' })
  @SwaggerResponse({ status: 403, description: 'Only the question author can accept' })
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle upvote on a question' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @SwaggerResponse({ status: 200, description: 'Upvote toggled successfully' })
  @SwaggerResponse({ status: 404, description: 'Question not found' })
  async upvoteQuestion(
    @Param('id', ParseUUIDPipe) questionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.productQAService.upvoteQuestion(questionId, userId);
  }

  @Post('answers/:id/upvote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle upvote on an answer' })
  @ApiParam({ name: 'id', description: 'Answer ID' })
  @SwaggerResponse({ status: 200, description: 'Upvote toggled successfully' })
  @SwaggerResponse({ status: 404, description: 'Answer not found' })
  async upvoteAnswer(
    @Param('id', ParseUUIDPipe) answerId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.productQAService.upvoteAnswer(answerId, userId);
  }
}
