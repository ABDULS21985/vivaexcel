import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ServiceTowerRepository } from './repositories/service-tower.repository';
import { CatalogServiceRepository } from './repositories/catalog-service.repository';
import { EngagementModelRepository } from './repositories/engagement-model.repository';
import { IndustryPracticeRepository } from './repositories/industry-practice.repository';
import { ServiceTower } from './entities/service-tower.entity';
import { CatalogService } from './entities/catalog-service.entity';
import { EngagementModel } from './entities/engagement-model.entity';
import { IndustryPractice } from './entities/industry-practice.entity';
import { ServiceTowerQueryDto } from './dto/service-tower-query.dto';
import { CreateServiceTowerDto } from './dto/create-service-tower.dto';
import { UpdateServiceTowerDto } from './dto/update-service-tower.dto';
import { CatalogServiceQueryDto } from './dto/catalog-service-query.dto';
import { CreateCatalogServiceDto } from './dto/create-catalog-service.dto';
import { UpdateCatalogServiceDto } from './dto/update-catalog-service.dto';
import { EngagementModelQueryDto } from './dto/engagement-model-query.dto';
import { CreateEngagementModelDto } from './dto/create-engagement-model.dto';
import { UpdateEngagementModelDto } from './dto/update-engagement-model.dto';
import { IndustryPracticeQueryDto } from './dto/industry-practice-query.dto';
import { CreateIndustryPracticeDto } from './dto/create-industry-practice.dto';
import { UpdateIndustryPracticeDto } from './dto/update-industry-practice.dto';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class ServiceCatalogService {
  constructor(
    private readonly serviceTowerRepository: ServiceTowerRepository,
    private readonly catalogServiceRepository: CatalogServiceRepository,
    private readonly engagementModelRepository: EngagementModelRepository,
    private readonly industryPracticeRepository: IndustryPracticeRepository,
  ) {}

  // =====================
  // Service Tower Methods
  // =====================

  async findAllTowers(query: ServiceTowerQueryDto): Promise<ApiResponse<PaginatedResponse<ServiceTower>>> {
    const result = await this.serviceTowerRepository.findAll(query);
    return {
      status: 'success',
      message: 'Service towers retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async findTowerById(id: string): Promise<ApiResponse<ServiceTower>> {
    const tower = await this.serviceTowerRepository.findById(id);
    if (!tower) {
      throw new NotFoundException(`Service tower with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Service tower retrieved successfully',
      data: tower,
    };
  }

  async findTowerBySlug(slug: string): Promise<ApiResponse<ServiceTower>> {
    const tower = await this.serviceTowerRepository.findBySlug(slug);
    if (!tower) {
      throw new NotFoundException(`Service tower with slug "${slug}" not found`);
    }

    return {
      status: 'success',
      message: 'Service tower retrieved successfully',
      data: tower,
    };
  }

  async findTowerByCode(code: string): Promise<ApiResponse<ServiceTower>> {
    const tower = await this.serviceTowerRepository.findByCode(code);
    if (!tower) {
      throw new NotFoundException(`Service tower with code "${code}" not found`);
    }

    return {
      status: 'success',
      message: 'Service tower retrieved successfully',
      data: tower,
    };
  }

  async createTower(createDto: CreateServiceTowerDto, userId?: string): Promise<ApiResponse<ServiceTower>> {
    // Check if slug already exists
    const slugExists = await this.serviceTowerRepository.slugExists(createDto.slug);
    if (slugExists) {
      throw new ConflictException('Service tower slug already exists');
    }

    // Check if code already exists
    const codeExists = await this.serviceTowerRepository.codeExists(createDto.code);
    if (codeExists) {
      throw new ConflictException('Service tower code already exists');
    }

    const tower = await this.serviceTowerRepository.create({
      ...createDto,
      createdBy: userId,
    } as Partial<ServiceTower>);

    return {
      status: 'success',
      message: 'Service tower created successfully',
      data: tower,
    };
  }

  async updateTower(id: string, updateDto: UpdateServiceTowerDto): Promise<ApiResponse<ServiceTower>> {
    const existingTower = await this.serviceTowerRepository.findById(id);
    if (!existingTower) {
      throw new NotFoundException(`Service tower with ID "${id}" not found`);
    }

    // Check if new slug already exists (if updating slug)
    if (updateDto.slug && updateDto.slug !== existingTower.slug) {
      const slugExists = await this.serviceTowerRepository.slugExists(updateDto.slug, id);
      if (slugExists) {
        throw new ConflictException('Service tower slug already exists');
      }
    }

    // Check if new code already exists (if updating code)
    if (updateDto.code && updateDto.code !== existingTower.code) {
      const codeExists = await this.serviceTowerRepository.codeExists(updateDto.code, id);
      if (codeExists) {
        throw new ConflictException('Service tower code already exists');
      }
    }

    const updatedTower = await this.serviceTowerRepository.update(id, updateDto);

    return {
      status: 'success',
      message: 'Service tower updated successfully',
      data: updatedTower!,
    };
  }

  async removeTower(id: string): Promise<ApiResponse<null>> {
    const tower = await this.serviceTowerRepository.findById(id);
    if (!tower) {
      throw new NotFoundException(`Service tower with ID "${id}" not found`);
    }

    await this.serviceTowerRepository.softDelete(id);

    return {
      status: 'success',
      message: 'Service tower deleted successfully',
      data: null,
    };
  }

  // ========================
  // Catalog Service Methods
  // ========================

  async findAllServices(query: CatalogServiceQueryDto): Promise<ApiResponse<PaginatedResponse<CatalogService>>> {
    const result = await this.catalogServiceRepository.findAll(query);
    return {
      status: 'success',
      message: 'Catalog services retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async findServiceById(id: string): Promise<ApiResponse<CatalogService>> {
    const service = await this.catalogServiceRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Catalog service with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Catalog service retrieved successfully',
      data: service,
    };
  }

  async findServiceBySlug(slug: string): Promise<ApiResponse<CatalogService>> {
    const service = await this.catalogServiceRepository.findBySlug(slug);
    if (!service) {
      throw new NotFoundException(`Catalog service with slug "${slug}" not found`);
    }

    return {
      status: 'success',
      message: 'Catalog service retrieved successfully',
      data: service,
    };
  }

  async findServicesByTowerId(towerId: string): Promise<ApiResponse<CatalogService[]>> {
    // Verify tower exists
    const tower = await this.serviceTowerRepository.findById(towerId);
    if (!tower) {
      throw new NotFoundException(`Service tower with ID "${towerId}" not found`);
    }

    const services = await this.catalogServiceRepository.findByTowerId(towerId);

    return {
      status: 'success',
      message: 'Catalog services retrieved successfully',
      data: services,
    };
  }

  async createService(createDto: CreateCatalogServiceDto, userId?: string): Promise<ApiResponse<CatalogService>> {
    // Check if slug already exists
    if (createDto.slug) {
      const slugExists = await this.catalogServiceRepository.slugExists(createDto.slug);
      if (slugExists) {
        throw new ConflictException('Catalog service slug already exists');
      }
    }

    // Verify tower exists
    if (createDto.towerId) {
      const tower = await this.serviceTowerRepository.findById(createDto.towerId);
      if (!tower) {
        throw new NotFoundException(`Service tower with ID "${createDto.towerId}" not found`);
      }
    }

    const service = await this.catalogServiceRepository.create({
      ...createDto,
      createdBy: userId,
    } as Partial<CatalogService>);

    return {
      status: 'success',
      message: 'Catalog service created successfully',
      data: service,
    };
  }

  async updateService(id: string, updateDto: UpdateCatalogServiceDto): Promise<ApiResponse<CatalogService>> {
    const existingService = await this.catalogServiceRepository.findById(id);
    if (!existingService) {
      throw new NotFoundException(`Catalog service with ID "${id}" not found`);
    }

    // Check if new slug already exists (if updating slug)
    if (updateDto.slug && updateDto.slug !== existingService.slug) {
      const slugExists = await this.catalogServiceRepository.slugExists(updateDto.slug, id);
      if (slugExists) {
        throw new ConflictException('Catalog service slug already exists');
      }
    }

    // Verify tower exists if updating towerId
    if (updateDto.towerId && updateDto.towerId !== existingService.towerId) {
      const tower = await this.serviceTowerRepository.findById(updateDto.towerId);
      if (!tower) {
        throw new NotFoundException(`Service tower with ID "${updateDto.towerId}" not found`);
      }
    }

    const updatedService = await this.catalogServiceRepository.update(id, updateDto);

    return {
      status: 'success',
      message: 'Catalog service updated successfully',
      data: updatedService!,
    };
  }

  async removeService(id: string): Promise<ApiResponse<null>> {
    const service = await this.catalogServiceRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Catalog service with ID "${id}" not found`);
    }

    await this.catalogServiceRepository.softDelete(id);

    return {
      status: 'success',
      message: 'Catalog service deleted successfully',
      data: null,
    };
  }

  // ==========================
  // Engagement Model Methods
  // ==========================

  async findAllEngagementModels(query?: EngagementModelQueryDto): Promise<ApiResponse<PaginatedResponse<EngagementModel> | EngagementModel[]>> {
    if (query && Object.keys(query).length > 0) {
      const result = await this.engagementModelRepository.findAll(query);
      return {
        status: 'success',
        message: 'Engagement models retrieved successfully',
        data: result,
        meta: result.meta,
      };
    }

    // If no query params, return active engagement models as simple array
    const models = await this.engagementModelRepository.findAllActive();
    return {
      status: 'success',
      message: 'Engagement models retrieved successfully',
      data: models,
    };
  }

  async findEngagementModelById(id: string): Promise<ApiResponse<EngagementModel>> {
    const model = await this.engagementModelRepository.findById(id);
    if (!model) {
      throw new NotFoundException(`Engagement model with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Engagement model retrieved successfully',
      data: model,
    };
  }

  async findEngagementModelBySlug(slug: string): Promise<ApiResponse<EngagementModel>> {
    const model = await this.engagementModelRepository.findBySlug(slug);
    if (!model) {
      throw new NotFoundException(`Engagement model with slug "${slug}" not found`);
    }

    return {
      status: 'success',
      message: 'Engagement model retrieved successfully',
      data: model,
    };
  }

  async findEngagementModelByCode(code: string): Promise<ApiResponse<EngagementModel>> {
    const model = await this.engagementModelRepository.findByCode(code);
    if (!model) {
      throw new NotFoundException(`Engagement model with code "${code}" not found`);
    }

    return {
      status: 'success',
      message: 'Engagement model retrieved successfully',
      data: model,
    };
  }

  async createEngagementModel(createDto: CreateEngagementModelDto, userId?: string): Promise<ApiResponse<EngagementModel>> {
    // Check if slug already exists
    if (createDto.slug) {
      const slugExists = await this.engagementModelRepository.slugExists(createDto.slug);
      if (slugExists) {
        throw new ConflictException('Engagement model slug already exists');
      }
    }

    // Check if code already exists
    if (createDto.code) {
      const codeExists = await this.engagementModelRepository.codeExists(createDto.code);
      if (codeExists) {
        throw new ConflictException('Engagement model code already exists');
      }
    }

    const model = await this.engagementModelRepository.create({
      ...createDto,
      createdBy: userId,
    } as Partial<EngagementModel>);

    return {
      status: 'success',
      message: 'Engagement model created successfully',
      data: model,
    };
  }

  async updateEngagementModel(id: string, updateDto: UpdateEngagementModelDto): Promise<ApiResponse<EngagementModel>> {
    const existingModel = await this.engagementModelRepository.findById(id);
    if (!existingModel) {
      throw new NotFoundException(`Engagement model with ID "${id}" not found`);
    }

    // Check if new slug already exists (if updating slug)
    if (updateDto.slug && updateDto.slug !== existingModel.slug) {
      const slugExists = await this.engagementModelRepository.slugExists(updateDto.slug, id);
      if (slugExists) {
        throw new ConflictException('Engagement model slug already exists');
      }
    }

    // Check if new code already exists (if updating code)
    if (updateDto.code && updateDto.code !== existingModel.code) {
      const codeExists = await this.engagementModelRepository.codeExists(updateDto.code, id);
      if (codeExists) {
        throw new ConflictException('Engagement model code already exists');
      }
    }

    const updatedModel = await this.engagementModelRepository.update(id, updateDto);

    return {
      status: 'success',
      message: 'Engagement model updated successfully',
      data: updatedModel!,
    };
  }

  async removeEngagementModel(id: string): Promise<ApiResponse<null>> {
    const model = await this.engagementModelRepository.findById(id);
    if (!model) {
      throw new NotFoundException(`Engagement model with ID "${id}" not found`);
    }

    await this.engagementModelRepository.softDelete(id);

    return {
      status: 'success',
      message: 'Engagement model deleted successfully',
      data: null,
    };
  }

  // ===========================
  // Industry Practice Methods
  // ===========================

  async findAllIndustryPractices(query?: IndustryPracticeQueryDto): Promise<ApiResponse<PaginatedResponse<IndustryPractice> | IndustryPractice[]>> {
    if (query && Object.keys(query).length > 0) {
      const result = await this.industryPracticeRepository.findAll(query);
      return {
        status: 'success',
        message: 'Industry practices retrieved successfully',
        data: result,
        meta: result.meta,
      };
    }

    // If no query params, return active industry practices as simple array
    const practices = await this.industryPracticeRepository.findAllActive();
    return {
      status: 'success',
      message: 'Industry practices retrieved successfully',
      data: practices,
    };
  }

  async findIndustryPracticeById(id: string): Promise<ApiResponse<IndustryPractice>> {
    const practice = await this.industryPracticeRepository.findById(id);
    if (!practice) {
      throw new NotFoundException(`Industry practice with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Industry practice retrieved successfully',
      data: practice,
    };
  }

  async findIndustryPracticeBySlug(slug: string): Promise<ApiResponse<IndustryPractice>> {
    const practice = await this.industryPracticeRepository.findBySlug(slug);
    if (!practice) {
      throw new NotFoundException(`Industry practice with slug "${slug}" not found`);
    }

    return {
      status: 'success',
      message: 'Industry practice retrieved successfully',
      data: practice,
    };
  }

  async findIndustryPracticeByCode(code: string): Promise<ApiResponse<IndustryPractice>> {
    const practice = await this.industryPracticeRepository.findByCode(code);
    if (!practice) {
      throw new NotFoundException(`Industry practice with code "${code}" not found`);
    }

    return {
      status: 'success',
      message: 'Industry practice retrieved successfully',
      data: practice,
    };
  }

  async createIndustryPractice(createDto: CreateIndustryPracticeDto, userId?: string): Promise<ApiResponse<IndustryPractice>> {
    // Check if slug already exists
    if (createDto.slug) {
      const slugExists = await this.industryPracticeRepository.slugExists(createDto.slug);
      if (slugExists) {
        throw new ConflictException('Industry practice slug already exists');
      }
    }

    // Check if code already exists
    if (createDto.code) {
      const codeExists = await this.industryPracticeRepository.codeExists(createDto.code);
      if (codeExists) {
        throw new ConflictException('Industry practice code already exists');
      }
    }

    const practice = await this.industryPracticeRepository.create({
      ...createDto,
      createdBy: userId,
    } as Partial<IndustryPractice>);

    return {
      status: 'success',
      message: 'Industry practice created successfully',
      data: practice,
    };
  }

  async updateIndustryPractice(id: string, updateDto: UpdateIndustryPracticeDto): Promise<ApiResponse<IndustryPractice>> {
    const existingPractice = await this.industryPracticeRepository.findById(id);
    if (!existingPractice) {
      throw new NotFoundException(`Industry practice with ID "${id}" not found`);
    }

    // Check if new slug already exists (if updating slug)
    if (updateDto.slug && updateDto.slug !== existingPractice.slug) {
      const slugExists = await this.industryPracticeRepository.slugExists(updateDto.slug, id);
      if (slugExists) {
        throw new ConflictException('Industry practice slug already exists');
      }
    }

    // Check if new code already exists (if updating code)
    if (updateDto.code && updateDto.code !== existingPractice.code) {
      const codeExists = await this.industryPracticeRepository.codeExists(updateDto.code, id);
      if (codeExists) {
        throw new ConflictException('Industry practice code already exists');
      }
    }

    const updatedPractice = await this.industryPracticeRepository.update(id, updateDto);

    return {
      status: 'success',
      message: 'Industry practice updated successfully',
      data: updatedPractice!,
    };
  }

  async removeIndustryPractice(id: string): Promise<ApiResponse<null>> {
    const practice = await this.industryPracticeRepository.findById(id);
    if (!practice) {
      throw new NotFoundException(`Industry practice with ID "${id}" not found`);
    }

    await this.industryPracticeRepository.softDelete(id);

    return {
      status: 'success',
      message: 'Industry practice deleted successfully',
      data: null,
    };
  }
}
