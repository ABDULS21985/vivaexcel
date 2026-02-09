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
import { FAQService } from './faq.service';
import { CreateFAQDto, UpdateFAQDto } from './dto/faq.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('FAQs')
@Controller('faqs')
export class FAQController {
    constructor(private readonly faqService: FAQService) { }

    @Get('public')
    @ApiOperation({ summary: 'Get all active FAQs (Public)' })
    findAllPublic() {
        return this.faqService.findAllActive();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new FAQ (Admin)' })
    create(@Body() createFAQDto: CreateFAQDto) {
        return this.faqService.create(createFAQDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all FAQs (Admin)' })
    findAll() {
        return this.faqService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a specific FAQ (Admin)' })
    findOne(@Param('id') id: string) {
        return this.faqService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an FAQ (Admin)' })
    update(@Param('id') id: string, @Body() updateFAQDto: UpdateFAQDto) {
        return this.faqService.update(id, updateFAQDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete an FAQ (Admin)' })
    remove(@Param('id') id: string) {
        return this.faqService.remove(id);
    }
}
