import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadingHistory } from '../../entities/reading-history.entity';
import { Post } from '../../entities/post.entity';

@Injectable()
export class ReadingHistoryService {
  private readonly logger = new Logger(ReadingHistoryService.name);

  constructor(
    @InjectRepository(ReadingHistory)
    private readonly historyRepository: Repository<ReadingHistory>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAllForUser(
    userId: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    const [items, total] = await this.historyRepository.findAndCount({
      where: { userId },
      relations: ['post', 'post.author', 'post.category'],
      order: { readAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    const history = items
      .filter((item) => item.post != null)
      .map((item) => ({
        id: item.id,
        postId: item.postId,
        userId: item.userId,
        progress: item.readPercentage,
        readAt: item.readAt instanceof Date ? item.readAt.toISOString() : item.readAt,
        post: {
          id: item.post.id,
          title: item.post.title,
          slug: item.post.slug,
          excerpt: item.post.excerpt ?? null,
          featuredImage: item.post.featuredImage ?? null,
          readingTime: item.post.readingTime ?? null,
          category: item.post.category
            ? {
                id: item.post.category.id,
                name: item.post.category.name,
                slug: item.post.category.slug,
              }
            : null,
        },
      }));

    return {
      status: 'success' as const,
      message: 'Reading history retrieved successfully',
      data: {
        history,
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  async getStats(userId: string) {
    const totalArticlesRead = await this.historyRepository
      .createQueryBuilder('rh')
      .select('COUNT(DISTINCT rh.postId)', 'count')
      .where('rh.userId = :userId', { userId })
      .getRawOne();

    const totalReadingTime = await this.historyRepository
      .createQueryBuilder('rh')
      .leftJoin('rh.post', 'post')
      .select('COALESCE(SUM(post.readingTime), 0)', 'total')
      .where('rh.userId = :userId', { userId })
      .getRawOne();

    // Articles read this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeek = await this.historyRepository
      .createQueryBuilder('rh')
      .select('COUNT(DISTINCT rh.postId)', 'count')
      .where('rh.userId = :userId', { userId })
      .andWhere('rh.readAt >= :startOfWeek', { startOfWeek })
      .getRawOne();

    const streakDays = await this.calculateStreak(userId);

    return {
      status: 'success' as const,
      message: 'Reading stats retrieved successfully',
      data: {
        totalArticlesRead: parseInt(totalArticlesRead?.count ?? '0', 10),
        totalReadingTime: parseInt(totalReadingTime?.total ?? '0', 10),
        streakDays,
        thisWeek: parseInt(thisWeek?.count ?? '0', 10),
      },
    };
  }

  async trackRead(userId: string, postId: string, progress: number = 100) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    let entry = await this.historyRepository.findOne({
      where: { userId, postId },
    });

    if (entry) {
      if (progress > entry.readPercentage) {
        entry.readPercentage = Math.min(progress, 100);
      }
      entry.readAt = new Date();
      entry = await this.historyRepository.save(entry);
    } else {
      entry = this.historyRepository.create({
        userId,
        postId,
        readPercentage: Math.min(progress, 100),
        readAt: new Date(),
      });
      entry = await this.historyRepository.save(entry);
    }

    const result = await this.historyRepository.findOne({
      where: { id: entry.id },
      relations: ['post', 'post.category'],
    });

    this.logger.debug(`User ${userId} tracked read for post ${postId} at ${progress}%`);

    return {
      status: 'success' as const,
      message: 'Reading progress tracked successfully',
      data: {
        entry: result
          ? {
              id: result.id,
              postId: result.postId,
              userId: result.userId!,
              progress: result.readPercentage,
              readAt: result.readAt instanceof Date ? result.readAt.toISOString() : result.readAt,
              post: {
                id: result.post.id,
                title: result.post.title,
                slug: result.post.slug,
                excerpt: result.post.excerpt ?? null,
                featuredImage: result.post.featuredImage ?? null,
                readingTime: result.post.readingTime ?? null,
                category: result.post.category
                  ? {
                      id: result.post.category.id,
                      name: result.post.category.name,
                      slug: result.post.category.slug,
                    }
                  : null,
              },
            }
          : null,
      },
    };
  }

  async removeEntry(userId: string, entryId: string) {
    const entry = await this.historyRepository.findOne({
      where: { id: entryId, userId },
    });

    if (!entry) {
      throw new NotFoundException('Reading history entry not found');
    }

    await this.historyRepository.remove(entry);

    return {
      status: 'success' as const,
      message: 'Reading history entry removed',
      data: null,
    };
  }

  async clearAll(userId: string) {
    await this.historyRepository.delete({ userId });

    this.logger.debug(`User ${userId} cleared all reading history`);

    return {
      status: 'success' as const,
      message: 'Reading history cleared',
      data: null,
    };
  }

  private async calculateStreak(userId: string): Promise<number> {
    const result = await this.historyRepository
      .createQueryBuilder('rh')
      .select('DATE(rh.readAt)', 'readDate')
      .where('rh.userId = :userId', { userId })
      .groupBy('DATE(rh.readAt)')
      .orderBy('DATE(rh.readAt)', 'DESC')
      .getRawMany();

    if (result.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const firstDate = new Date(result[0].readDate);
    firstDate.setHours(0, 0, 0, 0);

    // Streak must start from today or yesterday
    if (
      firstDate.getTime() !== today.getTime() &&
      firstDate.getTime() !== yesterday.getTime()
    ) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < result.length; i++) {
      const currentDate = new Date(result[i].readDate);
      const prevDate = new Date(result[i - 1].readDate);
      currentDate.setHours(0, 0, 0, 0);
      prevDate.setHours(0, 0, 0, 0);

      const diffDays =
        (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
