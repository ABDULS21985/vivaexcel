import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServicesRepository } from './services.repository';
import { Service } from '../../entities/service.entity';
import { ServiceCategory } from '../../entities/service-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServiceCategory])],
  controllers: [ServicesController],
  providers: [ServicesService, ServicesRepository],
  exports: [ServicesService, ServicesRepository],
})
export class ServicesModule {}
