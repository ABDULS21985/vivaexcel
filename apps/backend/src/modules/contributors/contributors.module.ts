import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributorApplication } from '../../entities/contributor-application.entity';
import { User } from '../../entities/user.entity';
import { ContributorsRepository } from './contributors.repository';
import { ContributorApplicationsService } from './services/contributor-applications.service';
import { ContributorApplicationsController } from './controllers/contributor-applications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContributorApplication, User]),
  ],
  controllers: [ContributorApplicationsController],
  providers: [
    ContributorsRepository,
    ContributorApplicationsService,
  ],
  exports: [ContributorApplicationsService],
})
export class ContributorsModule {}
