import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { BlogRepository } from '../blog.repository';
import { CreateBlogCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { BlogCategory } from '../../../entities/blog-category.entity';
import { ApiResponse } from '../../../common/interfaces/response.interface';

@Injectable()
export class CategoriesService {
  constructor(private readonly blogRepository: BlogRepository) {}

  async findAll(): Promise<ApiResponse<BlogCategory[]>> {
    const categories = await this.blogRepository.findAllCategories();
    return {
      status: 'success',
      message: 'Categories retrieved successfully',
      data: categories,
    };
  }

  async findById(id: string): Promise<ApiResponse<BlogCategory>> {
    const category = await this.blogRepository.findCategoryById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  async findBySlug(slug: string): Promise<ApiResponse<BlogCategory>> {
    const category = await this.blogRepository.findCategoryBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return {
      status: 'success',
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  async create(createCategoryDto: CreateBlogCategoryDto): Promise<ApiResponse<BlogCategory>> {
    // Check if slug already exists
    const slugExists = await this.blogRepository.categorySlugExists(createCategoryDto.slug);
    if (slugExists) {
      throw new ConflictException('Category slug already exists');
    }

    const category = await this.blogRepository.createCategory(createCategoryDto);

    return {
      status: 'success',
      message: 'Category created successfully',
      data: category,
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<ApiResponse<BlogCategory>> {
    const existing = await this.blogRepository.findCategoryById(id);
    if (!existing) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    if (updateCategoryDto.slug) {
      const slugExists = await this.blogRepository.categorySlugExists(updateCategoryDto.slug, id);
      if (slugExists) {
        throw new ConflictException('Category slug already exists');
      }
    }

    const category = await this.blogRepository.updateCategory(id, updateCategoryDto);

    return {
      status: 'success',
      message: 'Category updated successfully',
      data: category!,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const existing = await this.blogRepository.findCategoryById(id);
    if (!existing) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    await this.blogRepository.softDeleteCategory(id);

    return {
      status: 'success',
      message: 'Category deleted successfully',
      data: null,
    };
  }
}
