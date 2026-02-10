import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { VideoChannel } from './entities/video-channel.entity';
import { VideoCategory } from './entities/video-category.entity';
import { VideoBookmark } from './entities/video-bookmark.entity';
import { VideoLike } from './entities/video-like.entity';
import { VideoComment } from './entities/video-comment.entity';
import { VideoView } from './entities/video-view.entity';
import { VideosController } from './controllers/videos.controller';
import { VideosService } from './services/videos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Video,
      VideoChannel,
      VideoCategory,
      VideoBookmark,
      VideoLike,
      VideoComment,
      VideoView,
    ]),
  ],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
