import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobApplication, ApplicationStatus } from '../../entities/job-application.entity';
import { JobApplicationQueryDto } from './dto/job-application-query.dto';
import { PaginatedResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class JobApplicationsRepository {
  constructor(
    @InjectRepository(JobApplication)
    private readonly repository: Repository<JobApplication>,
  ) {}

  async findAll(query: JobApplicationQueryDto): Promise<PaginatedResponse<JobApplication>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      status,
      department,
      positionId,
      fromDate,
      toDate,
    } = query;

    const qb = this.repository.createQueryBuilder('application');

    // Apply search filter
    if (search) {
      qb.andWhere(
        '(application.firstName ILIKE :search OR application.lastName ILIKE :search OR application.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply status filter
    if (status) {
      qb.andWhere('application.status = :status', { status });
    }

    // Apply department filter
    if (department) {
      qb.andWhere('application.department = :department', { department });
    }

    // Apply position filter
    if (positionId) {
      qb.andWhere('application.positionId = :positionId', { positionId });
    }

    // Apply date range filters
    if (fromDate) {
      qb.andWhere('application.createdAt >= :fromDate', { fromDate: new Date(fromDate) });
    }

    if (toDate) {
      qb.andWhere('application.createdAt <= :toDate', { toDate: new Date(toDate) });
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortOrder === 'DESC') {
        qb.andWhere(`application.${sortBy} < :cursorValue`, { cursorValue: decodedCursor.value });
      } else {
        qb.andWhere(`application.${sortBy} > :cursorValue`, { cursorValue: decodedCursor.value });
      }
    }

    // Order and limit
    qb.orderBy(`application.${sortBy}`, sortOrder);
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop();
    }

    const nextCursor = hasNextPage && items.length > 0
      ? this.encodeCursor({ value: (items[items.length - 1] as unknown as Record<string, unknown>)[sortBy] })
      : undefined;

    return {
      items,
      meta: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor,
        previousCursor: cursor,
      },
    };
  }

  async findById(id: string): Promise<JobApplication | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<JobApplication>): Promise<JobApplication> {
    const application = this.repository.create(data);
    return this.repository.save(application);
  }

  async update(id: string, data: Partial<JobApplication>): Promise<JobApplication | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  async countByStatus(status?: ApplicationStatus): Promise<number> {
    const qb = this.repository.createQueryBuilder('application');
    if (status) {
      qb.where('application.status = :status', { status });
    }
    return qb.getCount();
  }

  async countByDepartment(): Promise<Record<string, number>> {
    const results = await this.repository
      .createQueryBuilder('application')
      .select('application.department', 'department')
      .addSelect('COUNT(*)', 'count')
      .groupBy('application.department')
      .getRawMany();

    return results.reduce((acc, { department, count }) => {
      acc[department] = parseInt(count, 10);
      return acc;
    }, {} as Record<string, number>);
  }

  private encodeCursor(data: { value: any }): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  private decodeCursor(cursor: string): { value: any } {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      return { value: null };
    }
  }
}
