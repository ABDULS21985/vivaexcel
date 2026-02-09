import {
  Controller,
  Get,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto, SuggestionsQueryDto } from './dto/search-query.dto';
import {
  SearchResultDto,
  SearchSuggestionDto,
  PopularSearchDto,
} from './dto/search-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Search')
@Controller('search')
@UseGuards(RolesGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Full-text search across blog posts' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category slug' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag slug' })
  @ApiQuery({ name: 'author', required: false, description: 'Filter by author ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter from date (ISO 8601)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter to date (ISO 8601)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @SwaggerResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async search(
    @Query() query: SearchQueryDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.searchService.search(query, userId ?? undefined);
  }

  @Get('suggestions')
  @Public()
  @ApiOperation({ summary: 'Autocomplete suggestions for search' })
  @ApiQuery({ name: 'q', required: true, description: 'Partial search query' })
  @SwaggerResponse({
    status: 200,
    description: 'Suggestions retrieved successfully',
  })
  async suggestions(@Query() query: SuggestionsQueryDto) {
    return this.searchService.suggestions(query);
  }

  @Get('popular')
  @Public()
  @ApiOperation({ summary: 'Get popular search terms' })
  @SwaggerResponse({
    status: 200,
    description: 'Popular searches retrieved successfully',
  })
  async popular() {
    return this.searchService.popularSearches();
  }
}
