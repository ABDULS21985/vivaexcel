import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FAQ } from '../../entities/faq.entity';
import { CreateFAQDto, UpdateFAQDto } from './dto/faq.dto';

@Injectable()
export class FAQService {
    constructor(
        @InjectRepository(FAQ)
        private readonly faqRepository: Repository<FAQ>,
    ) { }

    async create(createFAQDto: CreateFAQDto): Promise<FAQ> {
        const faq = this.faqRepository.create(createFAQDto);
        return await this.faqRepository.save(faq);
    }

    async findAll(): Promise<FAQ[]> {
        return await this.faqRepository.find({
            order: { order: 'ASC', createdAt: 'DESC' },
        });
    }

    async findAllActive(): Promise<FAQ[]> {
        return await this.faqRepository.find({
            where: { isActive: true },
            order: { order: 'ASC', createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<FAQ> {
        const faq = await this.faqRepository.findOne({ where: { id } });
        if (!faq) {
            throw new NotFoundException(`FAQ with ID "${id}" not found`);
        }
        return faq;
    }

    async update(id: string, updateFAQDto: UpdateFAQDto): Promise<FAQ> {
        const faq = await this.findOne(id);
        Object.assign(faq, updateFAQDto);
        return await this.faqRepository.save(faq);
    }

    async remove(id: string): Promise<void> {
        const faq = await this.findOne(id);
        await this.faqRepository.remove(faq);
    }
}
