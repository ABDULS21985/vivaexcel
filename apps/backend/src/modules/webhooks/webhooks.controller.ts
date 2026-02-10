import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
import { WebhooksService } from './webhooks.service';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';
import { DeliveryQueryDto } from './dto/delivery-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Webhooks')
@Controller('webhooks')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  // ---------------------------------------------------------------------------
  // Endpoint Management
  // ---------------------------------------------------------------------------

  @Post('endpoints')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR, Role.VIEWER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new webhook endpoint' })
  @SwaggerResponse({ status: 201, description: 'Endpoint created successfully' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async createEndpoint(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateEndpointDto,
  ) {
    const endpoint = await this.webhooksService.createEndpoint(userId, dto);
    return {
      status: 'success',
      message: 'Webhook endpoint created successfully',
      data: endpoint,
    };
  }

  @Get('endpoints')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'List all webhook endpoints for the current user' })
  @SwaggerResponse({ status: 200, description: 'Endpoints retrieved successfully' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async listEndpoints(@CurrentUser('sub') userId: string) {
    const endpoints = await this.webhooksService.listEndpoints(userId);
    return {
      status: 'success',
      message: 'Webhook endpoints retrieved successfully',
      data: endpoints,
    };
  }

  @Get('endpoints/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get a webhook endpoint by ID' })
  @ApiParam({ name: 'id', description: 'Webhook endpoint ID' })
  @SwaggerResponse({ status: 200, description: 'Endpoint retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Endpoint not found' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async getEndpoint(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const endpoint = await this.webhooksService.getEndpointById(id, userId);
    return {
      status: 'success',
      message: 'Webhook endpoint retrieved successfully',
      data: endpoint,
    };
  }

  @Patch('endpoints/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'Update a webhook endpoint' })
  @ApiParam({ name: 'id', description: 'Webhook endpoint ID' })
  @SwaggerResponse({ status: 200, description: 'Endpoint updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Endpoint not found' })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async updateEndpoint(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateEndpointDto,
  ) {
    const endpoint = await this.webhooksService.updateEndpoint(id, userId, dto);
    return {
      status: 'success',
      message: 'Webhook endpoint updated successfully',
      data: endpoint,
    };
  }

  @Delete('endpoints/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR, Role.VIEWER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a webhook endpoint' })
  @ApiParam({ name: 'id', description: 'Webhook endpoint ID' })
  @SwaggerResponse({ status: 200, description: 'Endpoint deleted successfully' })
  @SwaggerResponse({ status: 404, description: 'Endpoint not found' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async deleteEndpoint(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.webhooksService.deleteEndpoint(id, userId);
    return {
      status: 'success',
      message: 'Webhook endpoint deleted successfully',
      data: null,
    };
  }

  @Post('endpoints/:id/test')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR, Role.VIEWER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test event to a webhook endpoint' })
  @ApiParam({ name: 'id', description: 'Webhook endpoint ID' })
  @SwaggerResponse({ status: 200, description: 'Test event sent successfully' })
  @SwaggerResponse({ status: 404, description: 'Endpoint not found' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async testEndpoint(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const delivery = await this.webhooksService.testEndpoint(id, userId);
    return {
      status: 'success',
      message: 'Test webhook delivered',
      data: delivery,
    };
  }

  // ---------------------------------------------------------------------------
  // Delivery Management
  // ---------------------------------------------------------------------------

  @Get('deliveries')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'List recent webhook deliveries' })
  @SwaggerResponse({ status: 200, description: 'Deliveries retrieved successfully' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async getDeliveries(
    @CurrentUser('sub') userId: string,
    @Query() query: DeliveryQueryDto,
  ) {
    const result = await this.webhooksService.getDeliveries(userId, query);
    return {
      status: 'success',
      message: 'Webhook deliveries retrieved successfully',
      data: result.items,
      meta: {
        total: result.total,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      },
    };
  }

  @Post('deliveries/:id/retry')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR, Role.VIEWER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually retry a failed webhook delivery' })
  @ApiParam({ name: 'id', description: 'Webhook delivery ID' })
  @SwaggerResponse({ status: 200, description: 'Delivery retried successfully' })
  @SwaggerResponse({ status: 404, description: 'Delivery not found' })
  @SwaggerResponse({ status: 403, description: 'Cannot retry a delivered webhook' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async retryDelivery(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    const delivery = await this.webhooksService.retryDelivery(id, userId);
    return {
      status: 'success',
      message: 'Webhook delivery retried',
      data: delivery,
    };
  }
}
