import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { Video } from '../entities/video.entity';
import { VideoChannel } from '../entities/video-channel.entity';
import { VideoCategory } from '../entities/video-category.entity';
import { VideoBookmark } from '../entities/video-bookmark.entity';
import { VideoLike } from '../entities/video-like.entity';
import { VideoComment } from '../entities/video-comment.entity';
import { VideoView } from '../entities/video-view.entity';
import { VideoStatus } from '../enums/video.enums';
import { VideoQueryDto } from '../dto/video-query.dto';
import { CreateVideoDto } from '../dto/create-video.dto';
import { UpdateVideoDto } from '../dto/update-video.dto';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CreateVideoCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class VideosService implements OnModuleInit {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    @InjectRepository(Video) private readonly videoRepo: Repository<Video>,
    @InjectRepository(VideoChannel) private readonly channelRepo: Repository<VideoChannel>,
    @InjectRepository(VideoCategory) private readonly categoryRepo: Repository<VideoCategory>,
    @InjectRepository(VideoBookmark) private readonly bookmarkRepo: Repository<VideoBookmark>,
    @InjectRepository(VideoLike) private readonly likeRepo: Repository<VideoLike>,
    @InjectRepository(VideoComment) private readonly commentRepo: Repository<VideoComment>,
    @InjectRepository(VideoView) private readonly viewRepo: Repository<VideoView>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultData();
  }

  // ---------------------------------------------------------------------------
  // Helper
  // ---------------------------------------------------------------------------

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async generateUniqueSlug(text: string): Promise<string> {
    const base = this.slugify(text);
    let slug = `${base}-${Date.now().toString(36)}`;
    let attempt = 0;
    while (attempt < 5) {
      const exists = await this.videoRepo.findOne({ where: { slug }, withDeleted: true });
      if (!exists) return slug;
      slug = `${base}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      attempt++;
    }
    return slug;
  }

  // ---------------------------------------------------------------------------
  // Videos — CRUD & Queries
  // ---------------------------------------------------------------------------

  async findAll(
    query: VideoQueryDto,
  ): Promise<{ videos: Video[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const qb = this.videoRepo
      .createQueryBuilder('video')
      .leftJoinAndSelect('video.channel', 'channel')
      .leftJoinAndSelect('video.category', 'category')
      .where('video.status = :status', { status: VideoStatus.PUBLISHED })
      .andWhere('video.isShort = :isShort', { isShort: false });

    if (query.categorySlug && query.categorySlug !== 'all') {
      qb.andWhere('category.slug = :catSlug', { catSlug: query.categorySlug });
    }

    if (query.search) {
      qb.andWhere(
        '(video.title ILIKE :search OR video.description ILIKE :search OR CAST(video.tags AS TEXT) ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Sorting
    switch (query.sortBy) {
      case 'popular':
        qb.orderBy('video.viewCount', 'DESC');
        break;
      case 'trending':
        qb.orderBy('video.likeCount', 'DESC');
        break;
      default: // 'latest'
        qb.orderBy('video.publishedAt', 'DESC');
        break;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 24;
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [videos, total] = await qb.getManyAndCount();
    return { videos, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findShorts(): Promise<{ shorts: Video[]; total: number }> {
    const [shorts, total] = await this.videoRepo.findAndCount({
      where: { isShort: true, status: VideoStatus.PUBLISHED },
      relations: ['channel'],
      order: { publishedAt: 'DESC' },
      take: 20,
    });
    return { shorts, total };
  }

  async findBySlug(slug: string): Promise<Video> {
    const video = await this.videoRepo.findOne({
      where: { slug },
      relations: ['channel', 'category'],
    });
    if (!video) throw new NotFoundException(`Video with slug "${slug}" not found`);
    return video;
  }

  async findTrending(limit = 5): Promise<Video[]> {
    return this.videoRepo.find({
      where: { status: VideoStatus.PUBLISHED, isShort: false },
      relations: ['channel', 'category'],
      order: { viewCount: 'DESC' },
      take: limit,
    });
  }

  async create(dto: CreateVideoDto): Promise<Video> {
    const slug = await this.generateUniqueSlug(dto.title);
    const video = this.videoRepo.create({
      ...dto,
      slug,
      status: VideoStatus.PUBLISHED,
      publishedAt: new Date(),
    });
    return this.videoRepo.save(video);
  }

  async update(id: string, dto: UpdateVideoDto): Promise<Video> {
    const video = await this.videoRepo.findOne({ where: { id } });
    if (!video) throw new NotFoundException(`Video with ID "${id}" not found`);
    if (dto.title && dto.title !== video.title) {
      (video as any).slug = await this.generateUniqueSlug(dto.title);
    }
    Object.assign(video, dto);
    return this.videoRepo.save(video);
  }

  async remove(id: string): Promise<void> {
    const result = await this.videoRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException(`Video with ID "${id}" not found`);
  }

  async publish(id: string): Promise<Video> {
    const video = await this.videoRepo.findOne({ where: { id } });
    if (!video) throw new NotFoundException(`Video with ID "${id}" not found`);
    video.status = VideoStatus.PUBLISHED;
    video.publishedAt = new Date();
    return this.videoRepo.save(video);
  }

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------

  async findAllCategories(): Promise<VideoCategory[]> {
    const categories = await this.categoryRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });

    const allCategory = {
      id: 'all',
      name: 'All',
      slug: 'all',
      icon: 'Compass',
      color: '#1E4DB7',
      sortOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as VideoCategory;

    return [allCategory, ...categories];
  }

  async createCategory(dto: CreateCategoryDto): Promise<VideoCategory> {
    const category = this.categoryRepo.create({
      ...dto,
      slug: this.slugify(dto.name),
    });
    return this.categoryRepo.save(category);
  }

  // ---------------------------------------------------------------------------
  // Channels
  // ---------------------------------------------------------------------------

  async findAllChannels(): Promise<VideoChannel[]> {
    return this.channelRepo.find({ order: { name: 'ASC' } });
  }

  async findChannelBySlug(slug: string): Promise<VideoChannel> {
    const channel = await this.channelRepo.findOne({ where: { slug } });
    if (!channel) throw new NotFoundException(`Channel with slug "${slug}" not found`);
    return channel;
  }

  async createChannel(dto: CreateChannelDto): Promise<VideoChannel> {
    const channel = this.channelRepo.create({
      ...dto,
      slug: this.slugify(dto.name),
    });
    return this.channelRepo.save(channel);
  }

  // ---------------------------------------------------------------------------
  // Bookmarks
  // ---------------------------------------------------------------------------

  async toggleBookmark(userId: string, videoId: string): Promise<{ bookmarked: boolean }> {
    const existing = await this.bookmarkRepo.findOne({ where: { userId, videoId } });
    if (existing) {
      await this.bookmarkRepo.remove(existing);
      return { bookmarked: false };
    }
    const bookmark = this.bookmarkRepo.create({ userId, videoId });
    await this.bookmarkRepo.save(bookmark);
    return { bookmarked: true };
  }

  async getUserBookmarks(userId: string): Promise<Video[]> {
    const bookmarks = await this.bookmarkRepo.find({
      where: { userId },
      relations: ['video', 'video.channel', 'video.category'],
      order: { createdAt: 'DESC' },
    });
    return bookmarks.map((b) => b.video);
  }

  async isBookmarked(userId: string, videoId: string): Promise<boolean> {
    const count = await this.bookmarkRepo.count({ where: { userId, videoId } });
    return count > 0;
  }

  // ---------------------------------------------------------------------------
  // Likes
  // ---------------------------------------------------------------------------

  async toggleLike(userId: string, videoId: string): Promise<{ liked: boolean; likeCount: number }> {
    const existing = await this.likeRepo.findOne({ where: { userId, videoId } });
    if (existing) {
      await this.likeRepo.remove(existing);
      await this.videoRepo
        .createQueryBuilder()
        .update(Video)
        .set({ likeCount: () => 'GREATEST("like_count" - 1, 0)' })
        .where('id = :id', { id: videoId })
        .execute();
      const video = await this.videoRepo.findOne({ where: { id: videoId } });
      return { liked: false, likeCount: video?.likeCount ?? 0 };
    }
    const like = this.likeRepo.create({ userId, videoId });
    await this.likeRepo.save(like);
    await this.videoRepo
      .createQueryBuilder()
      .update(Video)
      .set({ likeCount: () => '"like_count" + 1' })
      .where('id = :id', { id: videoId })
      .execute();
    const video = await this.videoRepo.findOne({ where: { id: videoId } });
    return { liked: true, likeCount: video?.likeCount ?? 0 };
  }

  // ---------------------------------------------------------------------------
  // Comments
  // ---------------------------------------------------------------------------

  async getComments(videoId: string): Promise<VideoComment[]> {
    return this.commentRepo.find({
      where: { videoId, parentId: IsNull() },
      relations: ['user', 'children', 'children.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async addComment(userId: string, videoId: string, dto: CreateVideoCommentDto): Promise<VideoComment> {
    const comment = this.commentRepo.create({
      userId,
      videoId,
      content: dto.content,
      parentId: dto.parentId,
    });
    const saved = await this.commentRepo.save(comment);
    await this.videoRepo
      .createQueryBuilder()
      .update(Video)
      .set({ commentCount: () => '"comment_count" + 1' })
      .where('id = :id', { id: videoId })
      .execute();
    return saved;
  }

  async deleteComment(userId: string, commentId: string, isAdmin = false): Promise<void> {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (!isAdmin && comment.userId !== userId) throw new ForbiddenException('You can only delete your own comments');
    await this.commentRepo.softDelete(commentId);
    await this.videoRepo
      .createQueryBuilder()
      .update(Video)
      .set({ commentCount: () => 'GREATEST("comment_count" - 1, 0)' })
      .where('id = :id', { id: comment.videoId })
      .execute();
  }

  // ---------------------------------------------------------------------------
  // Views
  // ---------------------------------------------------------------------------

  async recordView(videoId: string, userId?: string, ipHash?: string, userAgent?: string): Promise<void> {
    if (ipHash) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentView = await this.viewRepo
        .createQueryBuilder('view')
        .where('view.videoId = :videoId', { videoId })
        .andWhere('view.ipHash = :ipHash', { ipHash })
        .andWhere('view.createdAt > :since', { since: thirtyMinutesAgo })
        .getOne();
      if (recentView) return;
    }

    const view = this.viewRepo.create({ videoId, userId, ipHash: ipHash || 'unknown', userAgent });
    await this.viewRepo.save(view);
    await this.videoRepo
      .createQueryBuilder()
      .update(Video)
      .set({ viewCount: () => '"view_count" + 1' })
      .where('id = :id', { id: videoId })
      .execute();
  }

  // ---------------------------------------------------------------------------
  // Seed Default Data
  // ---------------------------------------------------------------------------

  private async seedDefaultData(): Promise<void> {
    // --- Categories ---
    const categoryCount = await this.categoryRepo.count();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: 'Excel Tips', slug: 'excel-tips', icon: 'Table', color: '#217346', sortOrder: 1, isActive: true },
        { name: 'AI & Automation', slug: 'ai-automation', icon: 'Brain', color: '#7C3AED', sortOrder: 2, isActive: true },
        { name: 'Data Analytics', slug: 'data-analytics', icon: 'BarChart3', color: '#F59E0B', sortOrder: 3, isActive: true },
        { name: 'Google Sheets', slug: 'google-sheets', icon: 'FileSpreadsheet', color: '#0F9D58', sortOrder: 4, isActive: true },
        { name: 'Presentations', slug: 'presentations', icon: 'Presentation', color: '#E86A1D', sortOrder: 5, isActive: true },
        { name: 'Cybersecurity', slug: 'cybersecurity', icon: 'Shield', color: '#DC2626', sortOrder: 6, isActive: true },
        { name: 'Blockchain', slug: 'blockchain', icon: 'Link', color: '#059669', sortOrder: 7, isActive: true },
        { name: 'Tutorials', slug: 'tutorials', icon: 'GraduationCap', color: '#0891B2', sortOrder: 8, isActive: true },
        { name: 'Podcasts', slug: 'podcasts', icon: 'Mic', color: '#9333EA', sortOrder: 9, isActive: true },
        { name: 'Live', slug: 'live', icon: 'Radio', color: '#EF4444', sortOrder: 10, isActive: true },
      ];
      await this.categoryRepo.save(this.categoryRepo.create(defaultCategories));
      this.logger.log('Seeded default video categories');
    }

    // --- Channels ---
    const channelCount = await this.channelRepo.count();
    if (channelCount === 0) {
      const defaultChannels = [
        { name: 'VivaExcel Official', slug: 'vivaexcel-official', avatar: 'https://picsum.photos/seed/ch1/80/80', subscriberCount: 245000, isVerified: true },
        { name: 'Data Mastery Hub', slug: 'data-mastery-hub', avatar: 'https://picsum.photos/seed/ch2/80/80', subscriberCount: 189000, isVerified: true },
        { name: 'AI Frontiers', slug: 'ai-frontiers', avatar: 'https://picsum.photos/seed/ch3/80/80', subscriberCount: 312000, isVerified: true },
        { name: 'Spreadsheet Ninja', slug: 'spreadsheet-ninja', avatar: 'https://picsum.photos/seed/ch4/80/80', subscriberCount: 98000, isVerified: false },
        { name: 'CyberSafe Today', slug: 'cybersafe-today', avatar: 'https://picsum.photos/seed/ch5/80/80', subscriberCount: 156000, isVerified: true },
        { name: 'BlockChain Decoded', slug: 'blockchain-decoded', avatar: 'https://picsum.photos/seed/ch6/80/80', subscriberCount: 73000, isVerified: false },
      ];
      await this.channelRepo.save(this.channelRepo.create(defaultChannels));
      this.logger.log('Seeded default video channels');
    }

    // --- Videos & Shorts ---
    const videoCount = await this.videoRepo.count();
    if (videoCount === 0) {
      const channels = await this.channelRepo.find();
      const categories = await this.categoryRepo.find();
      const chMap = new Map(channels.map((c) => [c.slug, c.id]));
      const catMap = new Map(categories.map((c) => [c.slug, c.id]));

      const defaultVideos = [
        {
          title: 'Master VLOOKUP in 10 Minutes — The Only Excel Tutorial You Need',
          slug: 'master-vlookup-10-minutes',
          description: 'Learn VLOOKUP from scratch with real-world examples. By the end of this video, you\'ll be able to use VLOOKUP confidently in any spreadsheet.',
          thumbnailUrl: 'https://picsum.photos/seed/v1/640/360',
          videoUrl: '#',
          duration: 612,
          viewCount: 1250000,
          likeCount: 48000,
          commentCount: 3200,
          publishedAt: new Date('2025-12-15T10:00:00Z'),
          channelId: chMap.get('vivaexcel-official')!,
          categoryId: catMap.get('excel-tips')!,
          tags: ['excel', 'vlookup', 'tutorial', 'beginner'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'ChatGPT + Excel: Automate Your Entire Workflow with AI',
          slug: 'chatgpt-excel-automate-workflow',
          description: 'Discover how to combine ChatGPT with Excel to automate repetitive tasks, generate formulas, and analyze data faster than ever.',
          thumbnailUrl: 'https://picsum.photos/seed/v2/640/360',
          videoUrl: '#',
          duration: 1845,
          viewCount: 892000,
          likeCount: 35000,
          commentCount: 2100,
          publishedAt: new Date('2026-01-08T14:00:00Z'),
          channelId: chMap.get('ai-frontiers')!,
          categoryId: catMap.get('ai-automation')!,
          tags: ['chatgpt', 'excel', 'ai', 'automation'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Building Interactive Dashboards in Google Sheets — Complete Guide',
          slug: 'interactive-dashboards-google-sheets',
          description: 'Step-by-step guide to building professional dashboards in Google Sheets with charts, slicers, and dynamic ranges.',
          thumbnailUrl: 'https://picsum.photos/seed/v3/640/360',
          videoUrl: '#',
          duration: 2430,
          viewCount: 567000,
          likeCount: 22000,
          commentCount: 1800,
          publishedAt: new Date('2026-01-22T09:00:00Z'),
          channelId: chMap.get('spreadsheet-ninja')!,
          categoryId: catMap.get('google-sheets')!,
          tags: ['google-sheets', 'dashboard', 'data-visualization'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Data Analytics Career Roadmap 2026 — From Zero to Data Analyst',
          slug: 'data-analytics-career-roadmap-2026',
          description: 'Complete roadmap to becoming a data analyst in 2026. Skills, tools, certifications, and salary expectations covered.',
          thumbnailUrl: 'https://picsum.photos/seed/v4/640/360',
          videoUrl: '#',
          duration: 3600,
          viewCount: 2100000,
          likeCount: 89000,
          commentCount: 5400,
          publishedAt: new Date('2026-01-05T16:00:00Z'),
          channelId: chMap.get('data-mastery-hub')!,
          categoryId: catMap.get('data-analytics')!,
          tags: ['career', 'data-analytics', 'roadmap', '2026'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'PowerPoint Design Tips That Will Transform Your Presentations',
          slug: 'powerpoint-design-tips-transform',
          description: 'Professional design tips and tricks to make your PowerPoint presentations stand out. Templates, color theory, and layout principles.',
          thumbnailUrl: 'https://picsum.photos/seed/v5/640/360',
          videoUrl: '#',
          duration: 1520,
          viewCount: 345000,
          likeCount: 15000,
          commentCount: 920,
          publishedAt: new Date('2026-02-01T11:00:00Z'),
          channelId: chMap.get('vivaexcel-official')!,
          categoryId: catMap.get('presentations')!,
          tags: ['powerpoint', 'design', 'presentations'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Top 10 Cybersecurity Threats in 2026 You Need to Know',
          slug: 'top-10-cybersecurity-threats-2026',
          description: 'Stay protected by understanding the most dangerous cybersecurity threats facing individuals and businesses this year.',
          thumbnailUrl: 'https://picsum.photos/seed/v6/640/360',
          videoUrl: '#',
          duration: 1980,
          viewCount: 789000,
          likeCount: 31000,
          commentCount: 2800,
          publishedAt: new Date('2026-01-18T13:00:00Z'),
          channelId: chMap.get('cybersafe-today')!,
          categoryId: catMap.get('cybersecurity')!,
          tags: ['cybersecurity', 'threats', '2026', 'security'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Blockchain Explained: From Bitcoin to Smart Contracts',
          slug: 'blockchain-explained-bitcoin-smart-contracts',
          description: 'A comprehensive introduction to blockchain technology, cryptocurrencies, and smart contracts explained simply.',
          thumbnailUrl: 'https://picsum.photos/seed/v7/640/360',
          videoUrl: '#',
          duration: 2700,
          viewCount: 432000,
          likeCount: 18000,
          commentCount: 1500,
          publishedAt: new Date('2025-11-20T10:00:00Z'),
          channelId: chMap.get('blockchain-decoded')!,
          categoryId: catMap.get('blockchain')!,
          tags: ['blockchain', 'bitcoin', 'smart-contracts', 'crypto'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Excel Pivot Tables Masterclass — Advanced Techniques',
          slug: 'excel-pivot-tables-masterclass',
          description: 'Go beyond the basics with advanced pivot table techniques including calculated fields, grouping, and slicers.',
          thumbnailUrl: 'https://picsum.photos/seed/v8/640/360',
          videoUrl: '#',
          duration: 2850,
          viewCount: 678000,
          likeCount: 27000,
          commentCount: 1900,
          publishedAt: new Date('2026-01-30T08:00:00Z'),
          channelId: chMap.get('vivaexcel-official')!,
          categoryId: catMap.get('excel-tips')!,
          tags: ['excel', 'pivot-tables', 'advanced', 'masterclass'],
          isPremium: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Python for Data Analysis — Pandas Crash Course',
          slug: 'python-pandas-crash-course',
          description: 'Learn Python Pandas from scratch. Data cleaning, transformation, and visualization all in one crash course.',
          thumbnailUrl: 'https://picsum.photos/seed/v9/640/360',
          videoUrl: '#',
          duration: 4200,
          viewCount: 1560000,
          likeCount: 62000,
          commentCount: 4100,
          publishedAt: new Date('2025-10-12T15:00:00Z'),
          channelId: chMap.get('data-mastery-hub')!,
          categoryId: catMap.get('data-analytics')!,
          tags: ['python', 'pandas', 'data-analysis', 'crash-course'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'AI-Powered Presentations: Create Stunning Slides in Seconds',
          slug: 'ai-powered-presentations',
          description: 'Use AI tools to generate professional presentations automatically. Compare the top AI presentation generators.',
          thumbnailUrl: 'https://picsum.photos/seed/v10/640/360',
          videoUrl: '#',
          duration: 1350,
          viewCount: 423000,
          likeCount: 19000,
          commentCount: 1100,
          publishedAt: new Date('2026-02-05T12:00:00Z'),
          channelId: chMap.get('ai-frontiers')!,
          categoryId: catMap.get('ai-automation')!,
          tags: ['ai', 'presentations', 'automation', 'tools'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Google Sheets vs Excel: Which Should You Use in 2026?',
          slug: 'google-sheets-vs-excel-2026',
          description: 'An honest comparison of Google Sheets and Microsoft Excel. Features, pricing, collaboration, and use cases.',
          thumbnailUrl: 'https://picsum.photos/seed/v11/640/360',
          videoUrl: '#',
          duration: 1680,
          viewCount: 935000,
          likeCount: 41000,
          commentCount: 3600,
          publishedAt: new Date('2026-01-12T10:00:00Z'),
          channelId: chMap.get('spreadsheet-ninja')!,
          categoryId: catMap.get('google-sheets')!,
          tags: ['google-sheets', 'excel', 'comparison', '2026'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Protecting Your Business from Ransomware — A Practical Guide',
          slug: 'protecting-business-ransomware',
          description: 'Learn practical steps to protect your business from ransomware attacks. Backup strategies, employee training, and incident response.',
          thumbnailUrl: 'https://picsum.photos/seed/v12/640/360',
          videoUrl: '#',
          duration: 2100,
          viewCount: 267000,
          likeCount: 12000,
          commentCount: 890,
          publishedAt: new Date('2026-01-25T14:00:00Z'),
          channelId: chMap.get('cybersafe-today')!,
          categoryId: catMap.get('cybersecurity')!,
          tags: ['ransomware', 'cybersecurity', 'business', 'protection'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'DeFi Explained: How Decentralized Finance is Changing Banking',
          slug: 'defi-explained-decentralized-finance',
          description: 'Understand DeFi protocols, yield farming, liquidity pools, and how decentralized finance is disrupting traditional banking.',
          thumbnailUrl: 'https://picsum.photos/seed/v13/640/360',
          videoUrl: '#',
          duration: 2340,
          viewCount: 198000,
          likeCount: 8500,
          commentCount: 720,
          publishedAt: new Date('2025-12-08T11:00:00Z'),
          channelId: chMap.get('blockchain-decoded')!,
          categoryId: catMap.get('blockchain')!,
          tags: ['defi', 'blockchain', 'finance', 'banking'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Excel Macros for Beginners — Automate Everything',
          slug: 'excel-macros-beginners',
          description: 'Your first steps into Excel VBA macros. Record, edit, and write your own macros to automate repetitive tasks.',
          thumbnailUrl: 'https://picsum.photos/seed/v14/640/360',
          videoUrl: '#',
          duration: 1920,
          viewCount: 845000,
          likeCount: 34000,
          commentCount: 2700,
          publishedAt: new Date('2025-09-20T09:00:00Z'),
          channelId: chMap.get('vivaexcel-official')!,
          categoryId: catMap.get('excel-tips')!,
          tags: ['excel', 'macros', 'vba', 'automation', 'beginner'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Building Your First Machine Learning Model — No Code Required',
          slug: 'first-machine-learning-model',
          description: 'Build a machine learning model without writing a single line of code. Using drag-and-drop tools for classification and prediction.',
          thumbnailUrl: 'https://picsum.photos/seed/v15/640/360',
          videoUrl: '#',
          duration: 2560,
          viewCount: 1120000,
          likeCount: 45000,
          commentCount: 3200,
          publishedAt: new Date('2026-02-02T16:00:00Z'),
          channelId: chMap.get('ai-frontiers')!,
          categoryId: catMap.get('ai-automation')!,
          tags: ['machine-learning', 'no-code', 'ai', 'tutorial'],
          isPremium: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'SQL for Data Analysts — Everything You Need to Know',
          slug: 'sql-data-analysts-complete',
          description: 'Complete SQL tutorial for data analysts. From SELECT statements to complex joins, subqueries, and window functions.',
          thumbnailUrl: 'https://picsum.photos/seed/v16/640/360',
          videoUrl: '#',
          duration: 5400,
          viewCount: 2340000,
          likeCount: 95000,
          commentCount: 6200,
          publishedAt: new Date('2025-08-15T10:00:00Z'),
          channelId: chMap.get('data-mastery-hub')!,
          categoryId: catMap.get('tutorials')!,
          tags: ['sql', 'data-analysis', 'tutorial', 'complete-guide'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'The Future of Work: AI Agents and Automation in 2026',
          slug: 'future-of-work-ai-agents-2026',
          description: 'How AI agents are transforming the workplace. What jobs will be affected and how to prepare for the future.',
          thumbnailUrl: 'https://picsum.photos/seed/v17/640/360',
          videoUrl: '#',
          duration: 3150,
          viewCount: 567000,
          likeCount: 23000,
          commentCount: 1800,
          publishedAt: new Date('2026-02-08T13:00:00Z'),
          channelId: chMap.get('ai-frontiers')!,
          categoryId: catMap.get('podcasts')!,
          tags: ['ai', 'future-of-work', 'automation', 'podcast'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'LIVE: Excel Q&A Session — Ask Me Anything',
          slug: 'live-excel-qa-session',
          description: 'Live Q&A session where I answer your Excel questions in real-time. Bring your toughest spreadsheet challenges!',
          thumbnailUrl: 'https://picsum.photos/seed/v18/640/360',
          videoUrl: '#',
          duration: 0,
          viewCount: 12500,
          likeCount: 890,
          commentCount: 450,
          publishedAt: new Date('2026-02-10T18:00:00Z'),
          channelId: chMap.get('vivaexcel-official')!,
          categoryId: catMap.get('live')!,
          tags: ['excel', 'live', 'qa', 'help'],
          isLive: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Advanced Google Sheets Formulas — ARRAYFORMULA, QUERY & More',
          slug: 'advanced-google-sheets-formulas',
          description: 'Master advanced Google Sheets formulas that will level up your spreadsheet game. ARRAYFORMULA, QUERY, IMPORTRANGE, and more.',
          thumbnailUrl: 'https://picsum.photos/seed/v19/640/360',
          videoUrl: '#',
          duration: 2280,
          viewCount: 312000,
          likeCount: 14000,
          commentCount: 980,
          publishedAt: new Date('2026-01-15T11:00:00Z'),
          channelId: chMap.get('spreadsheet-ninja')!,
          categoryId: catMap.get('google-sheets')!,
          tags: ['google-sheets', 'formulas', 'advanced', 'arrayformula'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Zero Trust Security: The New Standard for Enterprise Protection',
          slug: 'zero-trust-security-enterprise',
          description: 'Understanding Zero Trust architecture and why it\'s becoming the gold standard for enterprise cybersecurity.',
          thumbnailUrl: 'https://picsum.photos/seed/v20/640/360',
          videoUrl: '#',
          duration: 1740,
          viewCount: 178000,
          likeCount: 7800,
          commentCount: 560,
          publishedAt: new Date('2026-02-03T15:00:00Z'),
          channelId: chMap.get('cybersafe-today')!,
          categoryId: catMap.get('cybersecurity')!,
          tags: ['zero-trust', 'cybersecurity', 'enterprise', 'security'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'NFTs in 2026: Are They Still Relevant?',
          slug: 'nfts-2026-still-relevant',
          description: 'An honest look at the state of NFTs in 2026. What\'s changed, what\'s working, and what\'s next for digital ownership.',
          thumbnailUrl: 'https://picsum.photos/seed/v21/640/360',
          videoUrl: '#',
          duration: 1560,
          viewCount: 234000,
          likeCount: 9200,
          commentCount: 1100,
          publishedAt: new Date('2026-01-28T10:00:00Z'),
          channelId: chMap.get('blockchain-decoded')!,
          categoryId: catMap.get('blockchain')!,
          tags: ['nfts', 'blockchain', '2026', 'digital-ownership'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Power BI vs Tableau: The Ultimate Data Visualization Showdown',
          slug: 'power-bi-vs-tableau-showdown',
          description: 'A detailed comparison of Power BI and Tableau for data visualization. Features, pricing, ease of use, and real examples.',
          thumbnailUrl: 'https://picsum.photos/seed/v22/640/360',
          videoUrl: '#',
          duration: 2880,
          viewCount: 756000,
          likeCount: 30000,
          commentCount: 2400,
          publishedAt: new Date('2025-11-05T09:00:00Z'),
          channelId: chMap.get('data-mastery-hub')!,
          categoryId: catMap.get('data-analytics')!,
          tags: ['power-bi', 'tableau', 'comparison', 'data-visualization'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'How to Create Professional Pitch Decks That Win Investors',
          slug: 'professional-pitch-decks-investors',
          description: 'Learn the secrets of creating pitch decks that actually get funded. Structure, design, storytelling, and common mistakes.',
          thumbnailUrl: 'https://picsum.photos/seed/v23/640/360',
          videoUrl: '#',
          duration: 2100,
          viewCount: 489000,
          likeCount: 21000,
          commentCount: 1500,
          publishedAt: new Date('2025-12-20T14:00:00Z'),
          channelId: chMap.get('vivaexcel-official')!,
          categoryId: catMap.get('presentations')!,
          tags: ['pitch-deck', 'presentations', 'investors', 'startup'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Prompt Engineering Masterclass: Get Better Results from AI',
          slug: 'prompt-engineering-masterclass',
          description: 'Master the art of prompt engineering to get dramatically better results from ChatGPT, Claude, and other AI tools.',
          thumbnailUrl: 'https://picsum.photos/seed/v24/640/360',
          videoUrl: '#',
          duration: 3300,
          viewCount: 1890000,
          likeCount: 76000,
          commentCount: 4800,
          publishedAt: new Date('2026-01-20T12:00:00Z'),
          channelId: chMap.get('ai-frontiers')!,
          categoryId: catMap.get('ai-automation')!,
          tags: ['prompt-engineering', 'ai', 'chatgpt', 'claude', 'masterclass'],
          isPremium: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'The Complete Excel Keyboard Shortcuts Cheat Sheet',
          slug: 'excel-keyboard-shortcuts-cheatsheet',
          description: 'Every Excel keyboard shortcut you\'ll ever need, organized by category. Boost your productivity 10x.',
          thumbnailUrl: 'https://picsum.photos/seed/v25/640/360',
          videoUrl: '#',
          duration: 960,
          viewCount: 1450000,
          likeCount: 58000,
          commentCount: 3800,
          publishedAt: new Date('2025-07-10T10:00:00Z'),
          channelId: chMap.get('vivaexcel-official')!,
          categoryId: catMap.get('excel-tips')!,
          tags: ['excel', 'shortcuts', 'productivity', 'cheatsheet'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Data Storytelling: How to Present Data That Drives Decisions',
          slug: 'data-storytelling-present-data',
          description: 'Transform raw data into compelling stories that influence decisions. Visualization techniques, narrative structure, and real examples.',
          thumbnailUrl: 'https://picsum.photos/seed/v26/640/360',
          videoUrl: '#',
          duration: 2460,
          viewCount: 387000,
          likeCount: 16000,
          commentCount: 1200,
          publishedAt: new Date('2026-02-06T11:00:00Z'),
          channelId: chMap.get('data-mastery-hub')!,
          categoryId: catMap.get('data-analytics')!,
          tags: ['data-storytelling', 'visualization', 'presentations'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Web3 Development: Building Your First dApp with Solidity',
          slug: 'web3-development-first-dapp',
          description: 'A hands-on tutorial to build your first decentralized application using Solidity, Hardhat, and React.',
          thumbnailUrl: 'https://picsum.photos/seed/v27/640/360',
          videoUrl: '#',
          duration: 4800,
          viewCount: 145000,
          likeCount: 6200,
          commentCount: 480,
          publishedAt: new Date('2025-12-01T10:00:00Z'),
          channelId: chMap.get('blockchain-decoded')!,
          categoryId: catMap.get('tutorials')!,
          tags: ['web3', 'solidity', 'dapp', 'blockchain', 'tutorial'],
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Tech Industry Roundup: AI, Layoffs, and the Future — Podcast Ep. 47',
          slug: 'tech-industry-roundup-podcast-47',
          description: 'Weekly podcast discussing the biggest tech stories: AI developments, industry layoffs, startup funding, and market trends.',
          thumbnailUrl: 'https://picsum.photos/seed/v28/640/360',
          videoUrl: '#',
          duration: 3900,
          viewCount: 89000,
          likeCount: 4100,
          commentCount: 320,
          publishedAt: new Date('2026-02-07T08:00:00Z'),
          channelId: chMap.get('ai-frontiers')!,
          categoryId: catMap.get('podcasts')!,
          tags: ['podcast', 'tech', 'ai', 'industry', 'news'],
          status: VideoStatus.PUBLISHED,
        },
      ];

      // Shorts
      const defaultShorts = [
        {
          title: 'Excel Trick: Instant Duplicate Removal',
          slug: 'excel-trick-duplicate-removal',
          description: 'Quick Excel trick for removing duplicates.',
          thumbnailUrl: 'https://picsum.photos/seed/s1/270/480',
          videoUrl: '#',
          duration: 28,
          viewCount: 2300000,
          likeCount: 120000,
          publishedAt: new Date('2026-02-09T10:00:00Z'),
          channelId: chMap.get('vivaexcel-official')!,
          categoryId: catMap.get('excel-tips')!,
          tags: ['excel', 'shorts', 'tips'],
          isShort: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'This AI Tool Writes Your Emails',
          slug: 'ai-tool-writes-emails',
          description: 'AI email writing tool demo.',
          thumbnailUrl: 'https://picsum.photos/seed/s2/270/480',
          videoUrl: '#',
          duration: 35,
          viewCount: 4500000,
          likeCount: 210000,
          publishedAt: new Date('2026-02-08T14:00:00Z'),
          channelId: chMap.get('ai-frontiers')!,
          categoryId: catMap.get('ai-automation')!,
          tags: ['ai', 'email', 'shorts'],
          isShort: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Stop Using VLOOKUP — Use XLOOKUP Instead',
          slug: 'stop-vlookup-use-xlookup',
          description: 'XLOOKUP is better than VLOOKUP.',
          thumbnailUrl: 'https://picsum.photos/seed/s3/270/480',
          videoUrl: '#',
          duration: 42,
          viewCount: 1800000,
          likeCount: 95000,
          publishedAt: new Date('2026-02-07T09:00:00Z'),
          channelId: chMap.get('vivaexcel-official')!,
          categoryId: catMap.get('excel-tips')!,
          tags: ['excel', 'xlookup', 'shorts'],
          isShort: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'One Google Sheets Formula That Does It All',
          slug: 'one-google-sheets-formula',
          description: 'The most powerful Google Sheets formula.',
          thumbnailUrl: 'https://picsum.photos/seed/s4/270/480',
          videoUrl: '#',
          duration: 45,
          viewCount: 890000,
          likeCount: 42000,
          publishedAt: new Date('2026-02-06T11:00:00Z'),
          channelId: chMap.get('spreadsheet-ninja')!,
          categoryId: catMap.get('google-sheets')!,
          tags: ['google-sheets', 'formula', 'shorts'],
          isShort: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Never Get Hacked Again — 3 Simple Steps',
          slug: 'never-get-hacked-3-steps',
          description: '3 simple steps to stay safe online.',
          thumbnailUrl: 'https://picsum.photos/seed/s5/270/480',
          videoUrl: '#',
          duration: 38,
          viewCount: 3200000,
          likeCount: 150000,
          publishedAt: new Date('2026-02-05T13:00:00Z'),
          channelId: chMap.get('cybersafe-today')!,
          categoryId: catMap.get('cybersecurity')!,
          tags: ['cybersecurity', 'tips', 'shorts'],
          isShort: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'What is Bitcoin Halving? Explained in 30 Seconds',
          slug: 'bitcoin-halving-30-seconds',
          description: 'Bitcoin halving explained quickly.',
          thumbnailUrl: 'https://picsum.photos/seed/s6/270/480',
          videoUrl: '#',
          duration: 30,
          viewCount: 1500000,
          likeCount: 68000,
          publishedAt: new Date('2026-02-04T10:00:00Z'),
          channelId: chMap.get('blockchain-decoded')!,
          categoryId: catMap.get('blockchain')!,
          tags: ['bitcoin', 'halving', 'shorts'],
          isShort: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Make Your Slides Look Professional — Quick Tip',
          slug: 'slides-look-professional-quick-tip',
          description: 'Professional presentation tip.',
          thumbnailUrl: 'https://picsum.photos/seed/s7/270/480',
          videoUrl: '#',
          duration: 25,
          viewCount: 670000,
          likeCount: 31000,
          publishedAt: new Date('2026-02-03T15:00:00Z'),
          channelId: chMap.get('vivaexcel-official')!,
          categoryId: catMap.get('presentations')!,
          tags: ['presentations', 'tips', 'shorts'],
          isShort: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Data Visualization Trick You Didn\'t Know',
          slug: 'data-viz-trick-unknown',
          description: 'Hidden data visualization trick.',
          thumbnailUrl: 'https://picsum.photos/seed/s8/270/480',
          videoUrl: '#',
          duration: 40,
          viewCount: 520000,
          likeCount: 24000,
          publishedAt: new Date('2026-02-02T12:00:00Z'),
          channelId: chMap.get('data-mastery-hub')!,
          categoryId: catMap.get('data-analytics')!,
          tags: ['data-viz', 'tricks', 'shorts'],
          isShort: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'ChatGPT Prompt That Saves Hours of Work',
          slug: 'chatgpt-prompt-saves-hours',
          description: 'Productivity prompt for ChatGPT.',
          thumbnailUrl: 'https://picsum.photos/seed/s9/270/480',
          videoUrl: '#',
          duration: 33,
          viewCount: 5100000,
          likeCount: 240000,
          publishedAt: new Date('2026-02-01T08:00:00Z'),
          channelId: chMap.get('ai-frontiers')!,
          categoryId: catMap.get('ai-automation')!,
          tags: ['chatgpt', 'prompt', 'shorts'],
          isShort: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Excel Conditional Formatting in 20 Seconds',
          slug: 'excel-conditional-formatting-20s',
          description: 'Quick conditional formatting tutorial.',
          thumbnailUrl: 'https://picsum.photos/seed/s10/270/480',
          videoUrl: '#',
          duration: 20,
          viewCount: 1100000,
          likeCount: 52000,
          publishedAt: new Date('2026-01-30T10:00:00Z'),
          channelId: chMap.get('vivaexcel-official')!,
          categoryId: catMap.get('excel-tips')!,
          tags: ['excel', 'formatting', 'shorts'],
          isShort: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'Phishing Attack Detection — One Simple Check',
          slug: 'phishing-detection-simple-check',
          description: 'Detect phishing with one check.',
          thumbnailUrl: 'https://picsum.photos/seed/s11/270/480',
          videoUrl: '#',
          duration: 27,
          viewCount: 2800000,
          likeCount: 130000,
          publishedAt: new Date('2026-01-28T14:00:00Z'),
          channelId: chMap.get('cybersafe-today')!,
          categoryId: catMap.get('cybersecurity')!,
          tags: ['phishing', 'security', 'shorts'],
          isShort: true,
          status: VideoStatus.PUBLISHED,
        },
        {
          title: 'This Pandas Trick Will Blow Your Mind',
          slug: 'pandas-trick-blow-mind',
          description: 'Amazing Python Pandas trick.',
          thumbnailUrl: 'https://picsum.photos/seed/s12/270/480',
          videoUrl: '#',
          duration: 36,
          viewCount: 780000,
          likeCount: 36000,
          publishedAt: new Date('2026-01-26T11:00:00Z'),
          channelId: chMap.get('data-mastery-hub')!,
          categoryId: catMap.get('data-analytics')!,
          tags: ['pandas', 'python', 'shorts'],
          isShort: true,
          status: VideoStatus.PUBLISHED,
        },
      ];

      await this.videoRepo.save(this.videoRepo.create([...defaultVideos, ...defaultShorts]));
      this.logger.log('Seeded default videos and shorts');
    }
  }
}
