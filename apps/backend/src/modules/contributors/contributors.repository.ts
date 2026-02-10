import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContributorApplication } from '../../entities/contributor-application.entity';
import { ContributorApplicationQueryDto } from './dto/contributor-application-query.dto';

@Injectable()
export class ContributorsRepository {
  private readonly logger = new Logger(ContributorsRepository.name);

  constructor(
    @InjectRepository(ContributorApplication)
    private readonly applicationRepo: Repository<ContributorApplication>,
  ) {}

  // ─── Applications ────────────────────────────────────────────────

  async findAllApplications(query: ContributorApplicationQueryDto) {
    const { cursor, limit = 20, search, status } = query;

    const qb = this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.user', 'user');

    if (status) {
      qb.andWhere('app.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(app.displayName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (cursor) {
      const decoded = this.decodeCursor(cursor);
      if (decoded.value) {
        qb.andWhere('app.createdAt < :cursorValue', { cursorValue: decoded.value });
      }
    }

    qb.orderBy('app.createdAt', 'DESC');
    qb.take(limit + 1);

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;
    if (hasNextPage) items.pop();

    const nextCursor =
      hasNextPage && items.length > 0
        ? this.encodeCursor({ value: items[items.length - 1].createdAt.toISOString() })
        : undefined;

    return {
      items,
      meta: { hasNextPage, hasPreviousPage: !!cursor, nextCursor, previousCursor: cursor },
    };
  }

  async findApplicationByUserId(userId: string) {
    return this.applicationRepo.findOne({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findApplicationById(id: string) {
    return this.applicationRepo.findOne({
      where: { id },
      relations: ['user', 'reviewer'],
    });
  }

  async createApplication(data: Partial<ContributorApplication>) {
    const app = this.applicationRepo.create(data);
    return this.applicationRepo.save(app);
  }

  async updateApplication(id: string, data: Partial<ContributorApplication>) {
    await this.applicationRepo.update(id, data);
    return this.findApplicationById(id);
  }

  // ─── Cursor Helpers ──────────────────────────────────────────────

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
