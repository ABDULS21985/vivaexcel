import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { BlogCategory } from '../../entities/blog-category.entity';
import { BlogTag } from '../../entities/blog-tag.entity';
import { Comment, CommentStatus } from '../../entities/comment.entity';
import { PostQueryDto } from './dto/post-query.dto';
import { PaginatedResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(BlogCategory)
    private readonly categoryRepository: Repository<BlogCategory>,
    @InjectRepository(BlogTag)
    private readonly tagRepository: Repository<BlogTag>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  // Post methods
  async findAllPosts(query: PostQueryDto): Promise<PaginatedResponse<Post>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      status,
      authorId,
      categoryId,
      categorySlug,
      tagId,
      tagSlug,
      isFeatured,
    } = query;

    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags');

    // Apply filters
    if (search) {
      qb.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search OR post.excerpt ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('post.status = :status', { status });
    }

    if (authorId) {
      qb.andWhere('post.authorId = :authorId', { authorId });
    }

    if (categoryId) {
      qb.andWhere('post.categoryId = :categoryId', { categoryId });
    }

    if (categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    if (tagId) {
      qb.andWhere('tags.id = :tagId', { tagId });
    }

    if (tagSlug) {
      qb.andWhere('tags.slug = :tagSlug', { tagSlug });
    }

    if (isFeatured !== undefined) {
      qb.andWhere('post.isFeatured = :isFeatured', { isFeatured });
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortOrder === 'DESC') {
        qb.andWhere(`post.${sortBy} < :cursorValue`, { cursorValue: decodedCursor.value });
      } else {
        qb.andWhere(`post.${sortBy} > :cursorValue`, { cursorValue: decodedCursor.value });
      }
    }

    // Order and limit
    qb.orderBy(`post.${sortBy}`, sortOrder);
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const nextCursor = hasNextPage && items.length > 0
      ? this.encodeCursor({ value: (items[items.length - 1] as unknown as Record<string, unknown>)[sortBy] })
      : undefined;

    return {
      items,
      meta: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor,
        previousCursor: cursor,
      },
    };
  }

  async findPostById(id: string): Promise<Post | null> {
    return this.postRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'tags'],
    });
  }

  async findPostBySlug(slug: string): Promise<Post | null> {
    return this.postRepository.findOne({
      where: { slug },
      relations: ['author', 'category', 'tags'],
    });
  }

  async createPost(data: Partial<Post>, tagIds?: string[]): Promise<Post> {
    const post = this.postRepository.create(data);

    if (tagIds && tagIds.length > 0) {
      post.tags = await this.tagRepository.findBy({ id: In(tagIds) });
    }

    return this.postRepository.save(post);
  }

  async updatePost(id: string, data: Partial<Post>, tagIds?: string[]): Promise<Post | null> {
    const post = await this.findPostById(id);
    if (!post) return null;

    Object.assign(post, data);

    if (tagIds !== undefined) {
      post.tags = tagIds.length > 0 ? await this.tagRepository.findBy({ id: In(tagIds) }) : [];
    }

    return this.postRepository.save(post);
  }

  async softDeletePost(id: string): Promise<boolean> {
    const result = await this.postRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  async incrementViews(id: string): Promise<void> {
    await this.postRepository.increment({ id }, 'views', 1);
  }

  async postSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.postRepository.createQueryBuilder('post')
      .where('post.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('post.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  // Category methods
  async findAllCategories(): Promise<BlogCategory[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async findCategoryById(id: string): Promise<BlogCategory | null> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  async findCategoryBySlug(slug: string): Promise<BlogCategory | null> {
    return this.categoryRepository.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });
  }

  async createCategory(data: Partial<BlogCategory>): Promise<BlogCategory> {
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  async categorySlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.categoryRepository.createQueryBuilder('category')
      .where('category.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('category.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  // Tag methods
  async findAllTags(): Promise<BlogTag[]> {
    return this.tagRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findTagById(id: string): Promise<BlogTag | null> {
    return this.tagRepository.findOne({ where: { id } });
  }

  async findTagBySlug(slug: string): Promise<BlogTag | null> {
    return this.tagRepository.findOne({ where: { slug } });
  }

  async createTag(data: Partial<BlogTag>): Promise<BlogTag> {
    const tag = this.tagRepository.create(data);
    return this.tagRepository.save(tag);
  }

  async tagSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.tagRepository.createQueryBuilder('tag')
      .where('tag.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('tag.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  // Comment methods
  async findCommentsByPostId(postId: string, status?: CommentStatus): Promise<Comment[]> {
    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.replies', 'replies')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.parentId IS NULL');

    if (status) {
      qb.andWhere('comment.status = :status', { status });
    }

    qb.orderBy('comment.createdAt', 'DESC');

    return qb.getMany();
  }

  async findCommentById(id: string): Promise<Comment | null> {
    return this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'post', 'parent', 'replies'],
    });
  }

  async createComment(data: Partial<Comment>): Promise<Comment> {
    const comment = this.commentRepository.create(data);
    return this.commentRepository.save(comment);
  }

  async updateComment(id: string, data: Partial<Comment>): Promise<Comment | null> {
    await this.commentRepository.update(id, data);
    return this.findCommentById(id);
  }

  async softDeleteComment(id: string): Promise<boolean> {
    const result = await this.commentRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  private encodeCursor(data: { value: any }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): { value: any } {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      return { value: null };
    }
  }
}
