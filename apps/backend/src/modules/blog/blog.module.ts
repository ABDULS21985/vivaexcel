import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './controllers/posts.controller';
import { CategoriesController } from './controllers/categories.controller';
import { TagsController } from './controllers/tags.controller';
import { CommentsController } from './controllers/comments.controller';
import { CommentModerationController } from './controllers/comment-moderation.controller';
import { RevisionsController } from './controllers/revisions.controller';
import { SeriesController } from './controllers/series.controller';
import { PostsService } from './services/posts.service';
import { CategoriesService } from './services/categories.service';
import { TagsService } from './services/tags.service';
import { CommentsService } from './services/comments.service';
import { PostSchedulerService } from './services/post-scheduler.service';
import { RevisionsService } from './services/revisions.service';
import { SeriesService } from './services/series.service';
import { BlogRepository } from './blog.repository';
import { Post } from '../../entities/post.entity';
import { BlogCategory } from '../../entities/blog-category.entity';
import { BlogTag } from '../../entities/blog-tag.entity';
import { Comment } from '../../entities/comment.entity';
import { ReadingHistory } from '../../entities/reading-history.entity';
import { NewsletterSubscriber } from '../../entities/newsletter-subscriber.entity';
import { PostRevision } from '../../entities/post-revision.entity';
import { PostSeries } from '../../entities/post-series.entity';
import { MembershipModule } from '../membership/membership.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      BlogCategory,
      BlogTag,
      Comment,
      ReadingHistory,
      NewsletterSubscriber,
      PostRevision,
      PostSeries,
    ]),
    forwardRef(() => MembershipModule),
  ],
  controllers: [
    PostsController,
    CategoriesController,
    TagsController,
    CommentsController,
    CommentModerationController,
    RevisionsController,
    SeriesController,
  ],
  providers: [
    PostsService,
    CategoriesService,
    TagsService,
    CommentsService,
    PostSchedulerService,
    RevisionsService,
    SeriesService,
    BlogRepository,
  ],
  exports: [
    PostsService,
    CategoriesService,
    TagsService,
    CommentsService,
    RevisionsService,
    SeriesService,
    BlogRepository,
  ],
})
export class BlogModule {}
