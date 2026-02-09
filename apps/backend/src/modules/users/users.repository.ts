import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) { }

  async findOne(options: any): Promise<User | null> {
    return this.repository.findOne(options);
  }

  async findAll(query: UserQueryDto): Promise<PaginatedResponse<User>> {
    const { cursor, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', search, status, role, emailVerified } = query;

    const qb = this.repository.createQueryBuilder('user');

    // Apply filters
    if (search) {
      qb.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    if (role) {
      qb.andWhere(':role = ANY(user.roles)', { role });
    }

    if (emailVerified !== undefined) {
      qb.andWhere('user.emailVerified = :emailVerified', { emailVerified });
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortOrder === 'DESC') {
        qb.andWhere(`user.${sortBy} < :cursorValue`, { cursorValue: decodedCursor.value });
      } else {
        qb.andWhere(`user.${sortBy} > :cursorValue`, { cursorValue: decodedCursor.value });
      }
    }

    // Order and limit
    qb.orderBy(`user.${sortBy}`, sortOrder);
    qb.take(limit + 1); // Fetch one extra to determine if there are more pages

    const items = await qb.getMany();
    const hasNextPage = items.length > limit;

    if (hasNextPage) {
      items.pop(); // Remove the extra item
    }

    const nextCursor = hasNextPage && items.length > 0
      ? this.encodeCursor({ value: (items[items.length - 1] as unknown as Record<string, unknown>)[sortBy] })
      : undefined;

    const previousCursor = cursor;

    return {
      items,
      meta: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        nextCursor,
        previousCursor,
      },
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  async restore(id: string): Promise<boolean> {
    const result = await this.repository.restore(id);
    return !!result.affected && result.affected > 0;
  }

  async count(conditions?: Record<string, unknown>): Promise<number> {
    return this.repository.count({ where: conditions as any });
  }

  async exists(conditions: Record<string, unknown>): Promise<boolean> {
    const count = await this.repository.count({ where: conditions as any });
    return count > 0;
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
