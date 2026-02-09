import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProductUpdateService } from '../services/product-update.service';
import { CreateProductUpdateDto } from '../dto/create-product-update.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Role } from '../../../common/constants/roles.constant';

@Controller('products')
@ApiTags('Product Updates')
@UseGuards(RolesGuard, PermissionsGuard)
export class ProductUpdateController {
  constructor(private readonly updateService: ProductUpdateService) {}

  @Post(':id/updates')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publish product update' })
  @ApiParam({ name: 'id', description: 'Digital product ID' })
  @SwaggerResponse({ status: 201, description: 'Product update published successfully' })
  @SwaggerResponse({ status: 404, description: 'Digital product not found' })
  async publishUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateProductUpdateDto,
  ) {
    return this.updateService.publishUpdate(
      id,
      body.version,
      body.releaseNotes,
      body.fileId,
      body.isBreaking,
    );
  }

  @Get(':id/changelog')
  @Public()
  @ApiOperation({ summary: 'Get product changelog' })
  @ApiParam({ name: 'id', description: 'Digital product ID' })
  @SwaggerResponse({ status: 200, description: 'Product changelog retrieved' })
  @SwaggerResponse({ status: 404, description: 'Digital product not found' })
  async getChangelog(@Param('id', ParseUUIDPipe) id: string) {
    return this.updateService.getProductChangelog(id);
  }

  @Get('updates/my-updates')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available updates for purchased products' })
  @SwaggerResponse({ status: 200, description: 'User available updates retrieved' })
  async getMyUpdates(@CurrentUser('sub') userId: string) {
    return this.updateService.getUserUpdates(userId);
  }
}
