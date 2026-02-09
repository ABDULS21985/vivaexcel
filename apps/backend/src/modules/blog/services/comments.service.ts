import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BlogRepository } from '../blog.repository';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Comment, CommentStatus } from '../../../entities/comment.entity';
import { ApiResponse } from '../../../common/interfaces/response.interface';

@Injectable()
export class CommentsService {
  constructor(private readonly blogRepository: BlogRepository) {}

  async findByPostId(
    postId: string,
    showPending = false,
  ): Promise<ApiResponse<Comment[]>> {
    const post = await this.blogRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    const status = showPending ? undefined : CommentStatus.APPROVED;
    const comments = await this.blogRepository.findCommentsByPostId(postId, status);

    return {
      status: 'success',
      message: 'Comments retrieved successfully',
      data: comments,
    };
  }

  async findById(id: string): Promise<ApiResponse<Comment>> {
    const comment = await this.blogRepository.findCommentById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Comment retrieved successfully',
      data: comment,
    };
  }

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
    authorId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ApiResponse<Comment>> {
    // Verify post exists and allows comments
    const post = await this.blogRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    if (!post.allowComments) {
      throw new BadRequestException('Comments are not allowed on this post');
    }

    // Validate guest comment requirements
    if (!authorId && (!createCommentDto.authorName || !createCommentDto.authorEmail)) {
      throw new BadRequestException('Author name and email are required for guest comments');
    }

    // Validate parent comment if provided
    if (createCommentDto.parentId) {
      const parentComment = await this.blogRepository.findCommentById(createCommentDto.parentId);
      if (!parentComment) {
        throw new NotFoundException(`Parent comment with ID "${createCommentDto.parentId}" not found`);
      }
      if (parentComment.postId !== postId) {
        throw new BadRequestException('Parent comment does not belong to this post');
      }
    }

    const comment = await this.blogRepository.createComment({
      ...createCommentDto,
      postId,
      authorId,
      ipAddress,
      userAgent,
      status: authorId ? CommentStatus.APPROVED : CommentStatus.PENDING,
    });

    return {
      status: 'success',
      message: 'Comment created successfully',
      data: comment,
    };
  }

  async updateStatus(id: string, status: CommentStatus): Promise<ApiResponse<Comment>> {
    const comment = await this.blogRepository.findCommentById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }

    const updatedComment = await this.blogRepository.updateComment(id, { status });

    return {
      status: 'success',
      message: 'Comment status updated successfully',
      data: updatedComment!,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const comment = await this.blogRepository.findCommentById(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }

    await this.blogRepository.softDeleteComment(id);

    return {
      status: 'success',
      message: 'Comment deleted successfully',
      data: null,
    };
  }

  async approve(id: string): Promise<ApiResponse<Comment>> {
    return this.updateStatus(id, CommentStatus.APPROVED);
  }

  async reject(id: string): Promise<ApiResponse<Comment>> {
    return this.updateStatus(id, CommentStatus.REJECTED);
  }

  async markAsSpam(id: string): Promise<ApiResponse<Comment>> {
    return this.updateStatus(id, CommentStatus.SPAM);
  }
}
