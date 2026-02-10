import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/constants/roles.constant';
import { Public } from '../../../common/decorators/public.decorator';
import { SellerResource } from '../../../entities/seller-resource.entity';
import { CreateResourceDto, UpdateResourceDto, ResourceQueryDto } from '../dto/seller-growth.dto';
import { ApiResponse } from '../../../common/interfaces/response.interface';

@ApiTags('Seller Growth - Resources')
@Controller('seller-growth/resources')
export class SellerResourcesController {
  constructor(
    @InjectRepository(SellerResource)
    private readonly resourceRepo: Repository<SellerResource>,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List published seller resources' })
  async listResources(
    @Query() query: ResourceQueryDto,
  ): Promise<ApiResponse<SellerResource[]>> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.resourceRepo
      .createQueryBuilder('r')
      .where('r.is_published = :published', { published: true })
      .orderBy('r.order', 'ASC')
      .addOrderBy('r.published_at', 'DESC');

    if (query.type) {
      qb.andWhere('r.type = :type', { type: query.type });
    }
    if (query.category) {
      qb.andWhere('r.category = :category', { category: query.category });
    }

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      status: 'success',
      message: 'Resources retrieved successfully',
      data: items,
      meta: {
        total,
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get a resource by slug' })
  async getBySlug(
    @Param('slug') slug: string,
  ): Promise<ApiResponse<SellerResource>> {
    const resource = await this.resourceRepo.findOne({
      where: { slug, isPublished: true },
    });

    if (!resource) throw new NotFoundException('Resource not found');

    return {
      status: 'success',
      message: 'Resource retrieved successfully',
      data: resource,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a seller resource (Admin only)' })
  async createResource(
    @Body() dto: CreateResourceDto,
  ): Promise<ApiResponse<SellerResource>> {
    const resource = this.resourceRepo.create({
      ...dto,
      isPublished: false,
    });

    const saved = await this.resourceRepo.save(resource);

    return {
      status: 'success',
      message: 'Resource created successfully',
      data: saved,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a seller resource (Admin only)' })
  async updateResource(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateResourceDto,
  ): Promise<ApiResponse<SellerResource>> {
    const resource = await this.resourceRepo.findOne({ where: { id } });
    if (!resource) throw new NotFoundException('Resource not found');

    Object.assign(resource, dto);

    // Set publishedAt when first published
    if (dto.isPublished && !resource.publishedAt) {
      resource.publishedAt = new Date();
    }

    const updated = await this.resourceRepo.save(resource);

    return {
      status: 'success',
      message: 'Resource updated successfully',
      data: updated,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a seller resource (Admin only)' })
  async deleteResource(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<null>> {
    const resource = await this.resourceRepo.findOne({ where: { id } });
    if (!resource) throw new NotFoundException('Resource not found');

    await this.resourceRepo.softRemove(resource);

    return {
      status: 'success',
      message: 'Resource deleted successfully',
    };
  }
}
