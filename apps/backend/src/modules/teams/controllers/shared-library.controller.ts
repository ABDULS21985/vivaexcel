import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UserId } from '../../../common/decorators/current-user.decorator';
import { SharedLibraryService } from '../services/shared-library.service';
import { AddToLibraryDto } from '../dto/add-to-library.dto';
import { TeamQueryDto } from '../dto/team-query.dto';

@ApiTags('Team Shared Library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams/:teamId/library')
export class SharedLibraryController {
  constructor(private readonly libraryService: SharedLibraryService) {}

  @ApiOperation({ summary: 'Get team shared library' })
  @ApiResponse({ status: 200, description: 'Library items' })
  @Get()
  async getLibrary(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
    @Query() query: TeamQueryDto,
  ) {
    return this.libraryService.getLibrary(teamId, userId, query);
  }

  @ApiOperation({ summary: 'Add product to team library' })
  @ApiResponse({ status: 201, description: 'Product added' })
  @Post()
  async addToLibrary(
    @Param('teamId') teamId: string,
    @UserId() userId: string,
    @Body() dto: AddToLibraryDto,
  ) {
    return this.libraryService.addToLibrary(teamId, userId, dto);
  }

  @ApiOperation({ summary: 'Check if product is in team library' })
  @ApiResponse({ status: 200, description: 'Library check result' })
  @Get('check/:productId')
  async checkProductInLibrary(
    @Param('teamId') teamId: string,
    @Param('productId') productId: string,
  ) {
    return this.libraryService.checkProductInLibrary(teamId, productId);
  }

  @ApiOperation({ summary: 'Download product from team library' })
  @ApiResponse({ status: 200, description: 'Download URL' })
  @Post(':productId/download')
  async downloadFromLibrary(
    @Param('teamId') teamId: string,
    @Param('productId') productId: string,
    @UserId() userId: string,
  ) {
    return this.libraryService.downloadFromLibrary(teamId, productId, userId);
  }

  @ApiOperation({ summary: 'Remove product from team library' })
  @ApiResponse({ status: 200, description: 'Product removed' })
  @Delete(':itemId')
  async removeFromLibrary(
    @Param('teamId') teamId: string,
    @Param('itemId') itemId: string,
    @UserId() userId: string,
  ) {
    return this.libraryService.removeFromLibrary(teamId, itemId, userId);
  }
}
