import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  GenerateTitlesDto,
  GenerateMetaDescriptionDto,
  GenerateExcerptDto,
  GenerateOutlineDto,
  AnalyzeContentDto,
  ImproveParagraphDto,
  GenerateAltTextDto,
} from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../../common/interfaces/response.interface';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('titles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate title suggestions for blog content' })
  @SwaggerResponse({
    status: 200,
    description: 'Title suggestions generated successfully',
  })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  @SwaggerResponse({ status: 503, description: 'AI service unavailable' })
  async generateTitles(
    @Body() dto: GenerateTitlesDto,
  ): Promise<ApiResponse<{ titles: string[] }>> {
    const titles = await this.aiService.generateTitleSuggestions(dto.content);

    return {
      status: 'success',
      message: 'Title suggestions generated successfully',
      data: { titles },
    };
  }

  @Post('meta-description')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate SEO meta description' })
  @SwaggerResponse({
    status: 200,
    description: 'Meta description generated successfully',
  })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  @SwaggerResponse({ status: 503, description: 'AI service unavailable' })
  async generateMetaDescription(
    @Body() dto: GenerateMetaDescriptionDto,
  ): Promise<ApiResponse<{ text: string }>> {
    const text = await this.aiService.generateMetaDescription(
      dto.title,
      dto.content,
    );

    return {
      status: 'success',
      message: 'Meta description generated successfully',
      data: { text },
    };
  }

  @Post('excerpt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate blog post excerpt' })
  @SwaggerResponse({
    status: 200,
    description: 'Excerpt generated successfully',
  })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  @SwaggerResponse({ status: 503, description: 'AI service unavailable' })
  async generateExcerpt(
    @Body() dto: GenerateExcerptDto,
  ): Promise<ApiResponse<{ text: string }>> {
    const text = await this.aiService.generateExcerpt(
      dto.content,
      dto.maxLength,
    );

    return {
      status: 'success',
      message: 'Excerpt generated successfully',
      data: { text },
    };
  }

  @Post('outline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate article outline for a topic' })
  @SwaggerResponse({
    status: 200,
    description: 'Outline generated successfully',
  })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  @SwaggerResponse({ status: 503, description: 'AI service unavailable' })
  async generateOutline(
    @Body() dto: GenerateOutlineDto,
  ): Promise<ApiResponse<{ text: string }>> {
    const text = await this.aiService.generateOutline(
      dto.topic,
      dto.keywords,
    );

    return {
      status: 'success',
      message: 'Outline generated successfully',
      data: { text },
    };
  }

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze blog content for readability and SEO' })
  @SwaggerResponse({
    status: 200,
    description: 'Content analyzed successfully',
  })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  @SwaggerResponse({ status: 503, description: 'AI service unavailable' })
  async analyzeContent(
    @Body() dto: AnalyzeContentDto,
  ): Promise<ApiResponse<{ analysis: import('./dto/ai.dto').ContentAnalysis }>> {
    const analysis = await this.aiService.analyzeContent(dto.content);

    return {
      status: 'success',
      message: 'Content analyzed successfully',
      data: { analysis },
    };
  }

  @Post('improve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Improve a paragraph of text' })
  @SwaggerResponse({
    status: 200,
    description: 'Text improved successfully',
  })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  @SwaggerResponse({ status: 503, description: 'AI service unavailable' })
  async improveParagraph(
    @Body() dto: ImproveParagraphDto,
  ): Promise<ApiResponse<{ text: string }>> {
    const text = await this.aiService.improveParagraph(dto.text, dto.tone);

    return {
      status: 'success',
      message: 'Text improved successfully',
      data: { text },
    };
  }

  @Post('alt-text')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate accessible alt text for an image' })
  @SwaggerResponse({
    status: 200,
    description: 'Alt text generated successfully',
  })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  @SwaggerResponse({ status: 503, description: 'AI service unavailable' })
  async generateAltText(
    @Body() dto: GenerateAltTextDto,
  ): Promise<ApiResponse<{ text: string }>> {
    const text = await this.aiService.generateAltText(dto.imageDescription);

    return {
      status: 'success',
      message: 'Alt text generated successfully',
      data: { text },
    };
  }
}
