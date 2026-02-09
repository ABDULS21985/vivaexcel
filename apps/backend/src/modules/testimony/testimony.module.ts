import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimony } from '../../entities/testimony.entity';
import { TestimonyService } from './testimony.service';
import { TestimonyController } from './testimony.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Testimony])],
    providers: [TestimonyService],
    controllers: [TestimonyController],
    exports: [TestimonyService],
})
export class TestimonyModule { }
