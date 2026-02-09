import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { SmartSearchService } from '../services/smart-search.service';
import { Public } from '../../../common/decorators/public.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';

@ApiTags('Smart Search')
@Controller('search/smart')
@UseGuards(RolesGuard, PermissionsGuard)
export class SmartSearchController {
  constructor(private readonly smartSearchService: SmartSearchService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'AI-powered smart product search with natural language support',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query (supports natural language)',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Search results with AI intent extraction',
  })
  async search(
    @Query('q') q: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.smartSearchService.smartSearch(q, page, limit);
  }

  @Get('autocomplete')
  @Public()
  @ApiOperation({ summary: 'Smart autocomplete with product previews' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Partial search query',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of suggestions',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Autocomplete suggestions',
  })
  async autocomplete(
    @Query('q') q: string,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.smartSearchService.getAutocomplete(q, limit);
  }

  @Get('intent')
  @Public()
  @ApiOperation({
    summary: 'Extract search intent from natural language query',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Natural language search query',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Extracted search intent',
  })
  async extractIntent(@Query('q') q: string) {
    const intent = await this.smartSearchService.extractIntent(q);
    return {
      status: 'success',
      message: 'Intent extracted',
      data: intent,
    };
  }
}
