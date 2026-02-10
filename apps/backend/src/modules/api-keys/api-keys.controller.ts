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
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKeyResponseDto, ApiKeyCreatedResponseDto } from './dto/api-key-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser, JwtUserPayload } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/interfaces/response.interface';
import { ApiKey } from './entities/api-key.entity';

@ApiTags('API Keys')
@Controller('api-keys')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new API key',
    description:
      'Generates a new API key for the authenticated user. ' +
      'The plain-text key is returned ONLY in this response. Store it securely.',
  })
  @SwaggerResponse({
    status: 201,
    description: 'API key created successfully',
    type: ApiKeyCreatedResponseDto,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input' })
  @SwaggerResponse({ status: 401, description: 'Authentication required' })
  async createKey(
    @CurrentUser() user: JwtUserPayload,
    @Body() createDto: CreateApiKeyDto,
  ): Promise<ApiResponse<ApiKeyCreatedResponseDto>> {
    const { apiKey, plainKey } = await this.apiKeysService.generateApiKey(
      user.sub,
      createDto,
    );

    return {
      status: 'success',
      message:
        'API key created successfully. Store the key securely — it will not be shown again.',
      data: {
        ...this.toResponseDto(apiKey),
        plainKey,
      },
    };
  }

  @Get()
  @ApiOperation({
    summary: 'List API keys',
    description:
      'Returns all API keys for the authenticated user. ' +
      'The key hash is never exposed; only the prefix is shown for identification.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'API keys retrieved successfully',
    type: [ApiKeyResponseDto],
  })
  async listKeys(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<ApiResponse<ApiKeyResponseDto[]>> {
    const keys = await this.apiKeysService.getUserKeys(user.sub);

    return {
      status: 'success',
      message: 'API keys retrieved successfully',
      data: keys.map((k) => this.toResponseDto(k)),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get API key details',
    description: 'Returns details for a specific API key.',
  })
  @ApiParam({ name: 'id', description: 'API key ID' })
  @SwaggerResponse({
    status: 200,
    description: 'API key retrieved successfully',
    type: ApiKeyResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'API key not found' })
  async getKey(
    @CurrentUser() user: JwtUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<ApiKeyResponseDto>> {
    const apiKey = await this.apiKeysService.getKeyById(id, user.sub);

    return {
      status: 'success',
      message: 'API key retrieved successfully',
      data: this.toResponseDto(apiKey),
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an API key',
    description:
      'Updates settings for an existing API key (name, scopes, rate limit, etc.).',
  })
  @ApiParam({ name: 'id', description: 'API key ID' })
  @SwaggerResponse({
    status: 200,
    description: 'API key updated successfully',
    type: ApiKeyResponseDto,
  })
  @SwaggerResponse({ status: 404, description: 'API key not found' })
  async updateKey(
    @CurrentUser() user: JwtUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateApiKeyDto,
  ): Promise<ApiResponse<ApiKeyResponseDto>> {
    const apiKey = await this.apiKeysService.updateApiKey(id, user.sub, updateDto);

    return {
      status: 'success',
      message: 'API key updated successfully',
      data: this.toResponseDto(apiKey),
    };
  }

  @Post(':id/rotate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate an API key',
    description:
      'Generates a new key and schedules revocation of the old one. ' +
      'The old key will continue working for a short grace period (5 minutes). ' +
      'The new plain-text key is returned ONLY in this response.',
  })
  @ApiParam({ name: 'id', description: 'API key ID to rotate' })
  @SwaggerResponse({
    status: 200,
    description: 'API key rotated successfully',
    type: ApiKeyCreatedResponseDto,
  })
  @SwaggerResponse({ status: 400, description: 'Key is not active' })
  @SwaggerResponse({ status: 404, description: 'API key not found' })
  async rotateKey(
    @CurrentUser() user: JwtUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<ApiKeyCreatedResponseDto>> {
    const { apiKey, plainKey } = await this.apiKeysService.rotateApiKey(
      id,
      user.sub,
    );

    return {
      status: 'success',
      message:
        'API key rotated successfully. The old key will be revoked after a 5-minute grace period.',
      data: {
        ...this.toResponseDto(apiKey),
        plainKey,
      },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke an API key',
    description:
      'Permanently revokes an API key. This action cannot be undone.',
  })
  @ApiParam({ name: 'id', description: 'API key ID to revoke' })
  @SwaggerResponse({ status: 200, description: 'API key revoked successfully' })
  @SwaggerResponse({ status: 400, description: 'Key is already revoked' })
  @SwaggerResponse({ status: 404, description: 'API key not found' })
  async revokeKey(
    @CurrentUser() user: JwtUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<ApiKeyResponseDto>> {
    const apiKey = await this.apiKeysService.revokeApiKey(id, user.sub);

    return {
      status: 'success',
      message: 'API key revoked successfully',
      data: this.toResponseDto(apiKey),
    };
  }

  // ──────────────────────────────────────────────
  //  Private Helpers
  // ──────────────────────────────────────────────

  /**
   * Map an ApiKey entity to a safe response DTO (no key hash).
   */
  private toResponseDto(apiKey: ApiKey): ApiKeyResponseDto {
    return {
      id: apiKey.id,
      userId: apiKey.userId,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      environment: apiKey.environment,
      scopes: apiKey.scopes,
      rateLimit: apiKey.rateLimit,
      allowedOrigins: apiKey.allowedOrigins,
      allowedIPs: apiKey.allowedIPs,
      lastUsedAt: apiKey.lastUsedAt,
      requestCount: apiKey.requestCount,
      monthlyRequestCount: apiKey.monthlyRequestCount,
      monthlyRequestLimit: apiKey.monthlyRequestLimit,
      status: apiKey.status,
      revokedAt: apiKey.revokedAt,
      revokedReason: apiKey.revokedReason,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  }
}
