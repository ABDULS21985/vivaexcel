import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, ContactStatus } from '../../entities/contact.entity';
import { ContactQueryDto } from './dto/contact-query.dto';
import { PaginatedResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class ContactRepository {
  constructor(
    @InjectRepository(Contact)
    private readonly repository: Repository<Contact>,
  ) {}

  async findAll(query: ContactQueryDto): Promise<PaginatedResponse<Contact>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      status,
    } = query;

    const qb = this.repository.createQueryBuilder('contact');

    // Apply filters
    if (search) {
      qb.andWhere(
        '(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.subject ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('contact.status = :status', { status });
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortOrder === 'DESC') {
        qb.andWhere(`contact.${sortBy} < :cursorValue`, { cursorValue: decodedCursor.value });
      } else {
        qb.andWhere(`contact.${sortBy} > :cursorValue`, { cursorValue: decodedCursor.value });
      }
    }

    // Order and limit
    qb.orderBy(`contact.${sortBy}`, sortOrder);
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

  async findById(id: string): Promise<Contact | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<Contact>): Promise<Contact> {
    const contact = this.repository.create(data);
    return this.repository.save(contact);
  }

  async update(id: string, data: Partial<Contact>): Promise<Contact | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  async countByStatus(status?: ContactStatus): Promise<number> {
    const qb = this.repository.createQueryBuilder('contact');
    if (status) {
      qb.where('contact.status = :status', { status });
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
