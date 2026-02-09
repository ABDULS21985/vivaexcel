import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber, SubscriberStatus } from '../../entities/newsletter-subscriber.entity';
import { SubscriberQueryDto } from './dto/subscriber-query.dto';
import { PaginatedResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class NewsletterRepository {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly repository: Repository<NewsletterSubscriber>,
  ) {}

  async findAll(query: SubscriberQueryDto): Promise<PaginatedResponse<NewsletterSubscriber>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      status,
      tag,
    } = query;

    const qb = this.repository.createQueryBuilder('subscriber');

    // Apply filters
    if (search) {
      qb.andWhere(
        '(subscriber.email ILIKE :search OR subscriber.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('subscriber.status = :status', { status });
    }

    if (tag) {
      qb.andWhere(':tag = ANY(subscriber.tags)', { tag });
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortOrder === 'DESC') {
        qb.andWhere(`subscriber.${sortBy} < :cursorValue`, { cursorValue: decodedCursor.value });
      } else {
        qb.andWhere(`subscriber.${sortBy} > :cursorValue`, { cursorValue: decodedCursor.value });
      }
    }

    // Order and limit
    qb.orderBy(`subscriber.${sortBy}`, sortOrder);
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

  async findById(id: string): Promise<NewsletterSubscriber | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<NewsletterSubscriber | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByConfirmationToken(token: string): Promise<NewsletterSubscriber | null> {
    return this.repository.findOne({ where: { confirmationToken: token } });
  }

  async findByUnsubscribeToken(token: string): Promise<NewsletterSubscriber | null> {
    return this.repository.findOne({ where: { unsubscribeToken: token } });
  }

  async create(data: Partial<NewsletterSubscriber>): Promise<NewsletterSubscriber> {
    const subscriber = this.repository.create(data);
    return this.repository.save(subscriber);
  }

  async update(id: string, data: Partial<NewsletterSubscriber>): Promise<NewsletterSubscriber | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  async countByStatus(status?: SubscriberStatus): Promise<number> {
    const qb = this.repository.createQueryBuilder('subscriber');
    if (status) {
      qb.where('subscriber.status = :status', { status });
    }
    return qb.getCount();
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
