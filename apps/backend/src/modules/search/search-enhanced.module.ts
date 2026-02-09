import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SmartSearchController } from './controllers/smart-search.controller';
import { SmartSearchService } from './services/smart-search.service';
import { SearchQuery } from './entities/search-query.entity';
import { Post } from '../../entities/post.entity';
import { DigitalProduct } from '../../entities/digital-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SearchQuery, Post, DigitalProduct]),
  ],
  controllers: [SearchController, SmartSearchController],
  providers: [SearchService, SmartSearchService],
  exports: [SearchService, SmartSearchService],
})
export class SearchEnhancedModule {}
