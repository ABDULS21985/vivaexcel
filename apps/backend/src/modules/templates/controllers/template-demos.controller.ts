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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TemplateDemosService } from '../services/template-demos.service';
import { CreateTemplateDemoDto } from '../dto/create-template-demo.dto';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Template Demos')
@Controller('templates')
export class TemplateDemosController {
  constructor(private readonly demosService: TemplateDemosService) {}

  @Public()
  @Get(':templateId/demos')
  @ApiOperation({ summary: 'Get demos for a template' })
  async findByTemplate(@Param('templateId', ParseUUIDPipe) templateId: string) {
    return this.demosService.findByTemplate(templateId);
  }

  @Post(':templateId/demos')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a demo' })
  async create(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() dto: CreateTemplateDemoDto,
  ) {
    return this.demosService.create(templateId, dto);
  }

  @Patch('demos/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a demo' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateTemplateDemoDto>,
  ) {
    return this.demosService.update(id, dto);
  }

  @Delete('demos/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a demo' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.demosService.remove(id);
  }
}
