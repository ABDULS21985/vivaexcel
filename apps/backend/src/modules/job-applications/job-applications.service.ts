import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { JobApplicationsRepository } from './job-applications.repository';
import { UploadService } from '../upload/upload.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationQueryDto } from './dto/job-application-query.dto';
import { UpdateApplicationStatusDto, UpdateApplicationNotesDto } from './dto/update-application-status.dto';
import { JobApplication, ApplicationStatus } from '../../entities/job-application.entity';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class JobApplicationsService {
  constructor(
    private readonly jobApplicationsRepository: JobApplicationsRepository,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(query: JobApplicationQueryDto): Promise<ApiResponse<PaginatedResponse<JobApplication>>> {
    const result = await this.jobApplicationsRepository.findAll(query);
    return {
      status: 'success',
      message: 'Job applications retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async findById(id: string): Promise<ApiResponse<JobApplication>> {
    const application = await this.jobApplicationsRepository.findById(id);
    if (!application) {
      throw new NotFoundException(`Job application with ID "${id}" not found`);
    }

    // Mark as REVIEWED when first accessed (if NEW)
    if (application.status === ApplicationStatus.NEW) {
      await this.jobApplicationsRepository.update(id, {
        status: ApplicationStatus.REVIEWED,
        reviewedAt: new Date(),
        statusChangedAt: new Date(),
      });
      application.status = ApplicationStatus.REVIEWED;
      application.reviewedAt = new Date();
      application.statusChangedAt = new Date();
    }

    return {
      status: 'success',
      message: 'Job application retrieved successfully',
      data: application,
    };
  }

  async create(
    createJobApplicationDto: CreateJobApplicationDto,
    resumeFile: Express.Multer.File,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ApiResponse<JobApplication>> {
    if (!resumeFile) {
      throw new BadRequestException('Resume file is required');
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(resumeFile.mimetype)) {
      throw new BadRequestException('Resume must be a PDF or Word document');
    }

    // Validate file size (max 10MB)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (resumeFile.size > maxFileSize) {
      throw new BadRequestException('Resume file size must not exceed 10MB');
    }

    // Upload the resume file
    const uploadResult = await this.uploadService.uploadFile(resumeFile);

    const application = await this.jobApplicationsRepository.create({
      ...createJobApplicationDto,
      resumeUrl: uploadResult.data!.url,
      resumeFilename: resumeFile.originalname,
      resumeSize: resumeFile.size,
      status: ApplicationStatus.NEW,
      ipAddress,
      userAgent,
    });

    return {
      status: 'success',
      message: 'Job application submitted successfully',
      data: application,
    };
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateApplicationStatusDto,
  ): Promise<ApiResponse<JobApplication>> {
    const application = await this.jobApplicationsRepository.findById(id);
    if (!application) {
      throw new NotFoundException(`Job application with ID "${id}" not found`);
    }

    const updateData: Partial<JobApplication> = {
      status: updateStatusDto.status,
      statusChangedAt: new Date(),
    };

    if (updateStatusDto.notes !== undefined) {
      updateData.notes = updateStatusDto.notes;
    }

    // Set reviewedAt if transitioning from NEW
    if (application.status === ApplicationStatus.NEW && !application.reviewedAt) {
      updateData.reviewedAt = new Date();
    }

    const updatedApplication = await this.jobApplicationsRepository.update(id, updateData);

    return {
      status: 'success',
      message: 'Job application status updated successfully',
      data: updatedApplication!,
    };
  }

  async updateNotes(
    id: string,
    updateNotesDto: UpdateApplicationNotesDto,
  ): Promise<ApiResponse<JobApplication>> {
    const application = await this.jobApplicationsRepository.findById(id);
    if (!application) {
      throw new NotFoundException(`Job application with ID "${id}" not found`);
    }

    const updatedApplication = await this.jobApplicationsRepository.update(id, {
      notes: updateNotesDto.notes,
    });

    return {
      status: 'success',
      message: 'Job application notes updated successfully',
      data: updatedApplication!,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const application = await this.jobApplicationsRepository.findById(id);
    if (!application) {
      throw new NotFoundException(`Job application with ID "${id}" not found`);
    }

    await this.jobApplicationsRepository.softDelete(id);

    return {
      status: 'success',
      message: 'Job application deleted successfully',
      data: null,
    };
  }

  async getStats(): Promise<ApiResponse<{
    new: number;
    reviewed: number;
    shortlisted: number;
    interview: number;
    offered: number;
    hired: number;
    rejected: number;
    withdrawn: number;
    total: number;
    byDepartment: Record<string, number>;
  }>> {
    const [
      newCount,
      reviewedCount,
      shortlistedCount,
      interviewCount,
      offeredCount,
      hiredCount,
      rejectedCount,
      withdrawnCount,
      total,
      byDepartment,
    ] = await Promise.all([
      this.jobApplicationsRepository.countByStatus(ApplicationStatus.NEW),
      this.jobApplicationsRepository.countByStatus(ApplicationStatus.REVIEWED),
      this.jobApplicationsRepository.countByStatus(ApplicationStatus.SHORTLISTED),
      this.jobApplicationsRepository.countByStatus(ApplicationStatus.INTERVIEW),
      this.jobApplicationsRepository.countByStatus(ApplicationStatus.OFFERED),
      this.jobApplicationsRepository.countByStatus(ApplicationStatus.HIRED),
      this.jobApplicationsRepository.countByStatus(ApplicationStatus.REJECTED),
      this.jobApplicationsRepository.countByStatus(ApplicationStatus.WITHDRAWN),
      this.jobApplicationsRepository.countByStatus(),
      this.jobApplicationsRepository.countByDepartment(),
    ]);

    return {
      status: 'success',
      message: 'Job application stats retrieved successfully',
      data: {
        new: newCount,
        reviewed: reviewedCount,
        shortlisted: shortlistedCount,
        interview: interviewCount,
        offered: offeredCount,
        hired: hiredCount,
        rejected: rejectedCount,
        withdrawn: withdrawnCount,
        total,
        byDepartment,
      },
    };
  }
}
