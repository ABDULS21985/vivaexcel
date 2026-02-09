import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplicationsService } from './job-applications.service';
import { JobApplicationsRepository } from './job-applications.repository';
import { JobApplication } from '../../entities/job-application.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplication]),
    UploadModule,
  ],
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService, JobApplicationsRepository],
  exports: [JobApplicationsService, JobApplicationsRepository],
})
export class JobApplicationsModule {}
