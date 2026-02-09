import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { BlogRepository } from '../blog.repository';
import { CreateTagDto } from '../dto/create-tag.dto';
import { BlogTag } from '../../../entities/blog-tag.entity';
import { ApiResponse } from '../../../common/interfaces/response.interface';

@Injectable()
export class TagsService {
  constructor(private readonly blogRepository: BlogRepository) {}

  async findAll(): Promise<ApiResponse<BlogTag[]>> {
    const tags = await this.blogRepository.findAllTags();
    return {
      status: 'success',
      message: 'Tags retrieved successfully',
      data: tags,
    };
  }

  async findById(id: string): Promise<ApiResponse<BlogTag>> {
    const tag = await this.blogRepository.findTagById(id);
    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Tag retrieved successfully',
      data: tag,
    };
  }

  async findBySlug(slug: string): Promise<ApiResponse<BlogTag>> {
    const tag = await this.blogRepository.findTagBySlug(slug);
    if (!tag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }

    return {
      status: 'success',
      message: 'Tag retrieved successfully',
      data: tag,
    };
  }

  async create(createTagDto: CreateTagDto): Promise<ApiResponse<BlogTag>> {
    // Check if slug already exists
    const slugExists = await this.blogRepository.tagSlugExists(createTagDto.slug);
    if (slugExists) {
      throw new ConflictException('Tag slug already exists');
    }

    const tag = await this.blogRepository.createTag(createTagDto);

    return {
      status: 'success',
      message: 'Tag created successfully',
      data: tag,
    };
  }
}
