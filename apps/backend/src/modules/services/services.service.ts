import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ServicesRepository } from './services.repository';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceQueryDto } from './dto/service-query.dto';
import { CreateServiceCategoryDto } from './dto/create-category.dto';
import { Service } from '../../entities/service.entity';
import { ServiceCategory } from '../../entities/service-category.entity';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  async findAll(query: ServiceQueryDto): Promise<ApiResponse<PaginatedResponse<Service>>> {
    const result = await this.servicesRepository.findAllServices(query);
    return {
      status: 'success',
      message: 'Services retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async findById(id: string): Promise<ApiResponse<Service>> {
    const service = await this.servicesRepository.findServiceById(id);
    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Service retrieved successfully',
      data: service,
    };
  }

  async findBySlug(slug: string): Promise<ApiResponse<Service>> {
    const service = await this.servicesRepository.findServiceBySlug(slug);
    if (!service) {
      throw new NotFoundException(`Service with slug "${slug}" not found`);
    }

    return {
      status: 'success',
      message: 'Service retrieved successfully',
      data: service,
    };
  }

  async create(createServiceDto: CreateServiceDto, userId?: string): Promise<ApiResponse<Service>> {
    // Check if slug already exists
    const slugExists = await this.servicesRepository.slugExists(createServiceDto.slug);
    if (slugExists) {
      throw new ConflictException('Service slug already exists');
    }

    const service = await this.servicesRepository.createService({
      ...createServiceDto,
      createdBy: userId,
    });

    return {
      status: 'success',
      message: 'Service created successfully',
      data: service,
    };
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<ApiResponse<Service>> {
    const existingService = await this.servicesRepository.findServiceById(id);
    if (!existingService) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    // Check if new slug already exists (if updating slug)
    if (updateServiceDto.slug && updateServiceDto.slug !== existingService.slug) {
      const slugExists = await this.servicesRepository.slugExists(updateServiceDto.slug, id);
      if (slugExists) {
        throw new ConflictException('Service slug already exists');
      }
    }

    const updatedService = await this.servicesRepository.updateService(id, updateServiceDto);

    return {
      status: 'success',
      message: 'Service updated successfully',
      data: updatedService!,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const service = await this.servicesRepository.findServiceById(id);
    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    await this.servicesRepository.softDeleteService(id);

    return {
      status: 'success',
      message: 'Service deleted successfully',
      data: null,
    };
  }

  // Category methods
  async findAllCategories(): Promise<ApiResponse<ServiceCategory[]>> {
    const categories = await this.servicesRepository.findAllCategories();
    return {
      status: 'success',
      message: 'Categories retrieved successfully',
      data: categories,
    };
  }

  async createCategory(createCategoryDto: CreateServiceCategoryDto): Promise<ApiResponse<ServiceCategory>> {
    // Check if slug already exists
    const slugExists = await this.servicesRepository.categorySlugExists(createCategoryDto.slug);
    if (slugExists) {
      throw new ConflictException('Category slug already exists');
    }

    const category = await this.servicesRepository.createCategory(createCategoryDto);

    return {
      status: 'success',
      message: 'Category created successfully',
      data: category,
    };
  }

  async findCategoryById(id: string): Promise<ApiResponse<ServiceCategory>> {
    const category = await this.servicesRepository.findCategoryById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  async findCategoryBySlug(slug: string): Promise<ApiResponse<ServiceCategory>> {
    const category = await this.servicesRepository.findCategoryBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return {
      status: 'success',
      message: 'Category retrieved successfully',
      data: category,
    };
  }
}
