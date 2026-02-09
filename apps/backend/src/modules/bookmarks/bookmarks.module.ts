import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { Bookmark } from '../../entities/bookmark.entity';
import { Post } from '../../entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, Post])],
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class BookmarksModule {}
