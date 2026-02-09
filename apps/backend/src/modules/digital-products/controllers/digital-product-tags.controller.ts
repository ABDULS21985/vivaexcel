import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DigitalProductTagsService } from '../services/digital-product-tags.service';
import { CreateDigitalProductTagDto } from '../dto/create-digital-product-tag.dto';
import { UpdateDigitalProductTagDto } from '../dto/update-digital-product-tag.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';
import { Permission } from '../../../common/constants/permissions.constant';

@ApiTags('Digital Products - Tags')
@Controller('digital-products/tags')
@UseGuards(RolesGuard, PermissionsGuard)
export class DigitalProductTagsController {
  constructor(private readonly tagsService: DigitalProductTagsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all digital product tags' })
  @SwaggerResponse({ status: 200, description: 'Tags retrieved successfully' })
  async findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get digital product tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @SwaggerResponse({ status: 200, description: 'Tag retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Tag not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new digital product tag' })
  @SwaggerResponse({ status: 201, description: 'Tag created successfully' })
  @SwaggerResponse({ status: 409, description: 'Tag slug already exists' })
  async create(@Body() createDto: CreateDigitalProductTagDto) {
    return this.tagsService.create(createDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
  @RequirePermissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a digital product tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @SwaggerResponse({ status: 200, description: 'Tag updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Tag not found' })
  @SwaggerResponse({ status: 409, description: 'Tag slug already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDigitalProductTagDto,
  ) {
    return this.tagsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a digital product tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @SwaggerResponse({ status: 200, description: 'Tag deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Tag not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.remove(id);
  }
}
