import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimony } from '../../entities/testimony.entity';
import { CreateTestimonyDto, UpdateTestimonyDto } from './dto/testimony.dto';

@Injectable()
export class TestimonyService {
    constructor(
        @InjectRepository(Testimony)
        private readonly testimonyRepository: Repository<Testimony>,
    ) { }

    async create(createTestimonyDto: CreateTestimonyDto): Promise<Testimony> {
        const testimony = this.testimonyRepository.create(createTestimonyDto);
        return await this.testimonyRepository.save(testimony);
    }

    async findAll(): Promise<Testimony[]> {
        return await this.testimonyRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findAllActive(): Promise<Testimony[]> {
        return await this.testimonyRepository.find({
            where: { isActive: true },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Testimony> {
        const testimony = await this.testimonyRepository.findOne({ where: { id } });
        if (!testimony) {
            throw new NotFoundException(`Testimony with ID "${id}" not found`);
        }
        return testimony;
    }

    async update(id: string, updateTestimonyDto: UpdateTestimonyDto): Promise<Testimony> {
        const testimony = await this.findOne(id);
        Object.assign(testimony, updateTestimonyDto);
        return await this.testimonyRepository.save(testimony);
    }

    async remove(id: string): Promise<void> {
        const testimony = await this.findOne(id);
        await this.testimonyRepository.remove(testimony);
    }
}
