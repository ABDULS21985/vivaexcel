import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCatalogController } from './service-catalog.controller';
import { ServiceCatalogService } from './service-catalog.service';
import { ServiceTowerRepository } from './repositories/service-tower.repository';
import { CatalogServiceRepository } from './repositories/catalog-service.repository';
import { EngagementModelRepository } from './repositories/engagement-model.repository';
import { IndustryPracticeRepository } from './repositories/industry-practice.repository';
import { ServiceTower } from './entities/service-tower.entity';
import { CatalogService } from './entities/catalog-service.entity';
import { ServiceDeliverable } from './entities/service-deliverable.entity';
import { EngagementModel } from './entities/engagement-model.entity';
import { IndustryPractice } from './entities/industry-practice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceTower,
      CatalogService,
      ServiceDeliverable,
      EngagementModel,
      IndustryPractice,
    ]),
  ],
  controllers: [ServiceCatalogController],
  providers: [
    ServiceCatalogService,
    ServiceTowerRepository,
    CatalogServiceRepository,
    EngagementModelRepository,
    IndustryPracticeRepository,
  ],
  exports: [
    ServiceCatalogService,
    ServiceTowerRepository,
    CatalogServiceRepository,
    EngagementModelRepository,
    IndustryPracticeRepository,
  ],
})
export class ServiceCatalogModule {}
