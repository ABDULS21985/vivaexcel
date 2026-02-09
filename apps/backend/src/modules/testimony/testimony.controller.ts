import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TestimonyService } from './testimony.service';
import { CreateTestimonyDto, UpdateTestimonyDto } from './dto/testimony.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Testimonies')
@Controller('testimonies')
export class TestimonyController {
    constructor(private readonly testimonyService: TestimonyService) { }

    @Get('public')
    @ApiOperation({ summary: 'Get all active testimonies (Public)' })
    findAllPublic() {
        return this.testimonyService.findAllActive();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new testimony (Admin)' })
    create(@Body() createTestimonyDto: CreateTestimonyDto) {
        return this.testimonyService.create(createTestimonyDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all testimonies (Admin)' })
    findAll() {
        return this.testimonyService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a specific testimony (Admin)' })
    findOne(@Param('id') id: string) {
        return this.testimonyService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a testimony (Admin)' })
    update(@Param('id') id: string, @Body() updateTestimonyDto: UpdateTestimonyDto) {
        return this.testimonyService.update(id, updateTestimonyDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a testimony (Admin)' })
    remove(@Param('id') id: string) {
        return this.testimonyService.remove(id);
    }
}
