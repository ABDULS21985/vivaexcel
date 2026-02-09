import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaType } from '../../entities/media.entity';
import { MediaFolder } from '../../entities/media-folder.entity';
import { MediaQueryDto } from './dto/media-query.dto';
import { PaginatedResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class MediaRepository {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(MediaFolder)
    private readonly folderRepository: Repository<MediaFolder>,
  ) {}

  async findAllMedia(query: MediaQueryDto): Promise<PaginatedResponse<Media>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      type,
      folderId,
      tag,
    } = query;

    const qb = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.folder', 'folder');

    // Apply filters
    if (search) {
      qb.andWhere(
        '(media.filename ILIKE :search OR media.title ILIKE :search OR media.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      qb.andWhere('media.type = :type', { type });
    }

    if (folderId) {
      qb.andWhere('media.folderId = :folderId', { folderId });
    }

    if (tag) {
      qb.andWhere(':tag = ANY(media.tags)', { tag });
    }

    // Apply cursor pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortOrder === 'DESC') {
        qb.andWhere(`media.${sortBy} < :cursorValue`, { cursorValue: decodedCursor.value });
      } else {
        qb.andWhere(`media.${sortBy} > :cursorValue`, { cursorValue: decodedCursor.value });
      }
    }

    // Order and limit
    qb.orderBy(`media.${sortBy}`, sortOrder);
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

  async findMediaById(id: string): Promise<Media | null> {
    return this.mediaRepository.findOne({
      where: { id },
      relations: ['folder'],
    });
  }

  async createMedia(data: Partial<Media>): Promise<Media> {
    const media = this.mediaRepository.create(data);
    return this.mediaRepository.save(media);
  }

  async updateMedia(id: string, data: Partial<Media>): Promise<Media | null> {
    await this.mediaRepository.update(id, data);
    return this.findMediaById(id);
  }

  async softDeleteMedia(id: string): Promise<boolean> {
    const result = await this.mediaRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  // Folder methods
  async findAllFolders(): Promise<MediaFolder[]> {
    return this.folderRepository.find({
      relations: ['parent', 'children'],
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async findFolderById(id: string): Promise<MediaFolder | null> {
    return this.folderRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  async findFolderBySlug(slug: string): Promise<MediaFolder | null> {
    return this.folderRepository.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });
  }

  async createFolder(data: Partial<MediaFolder>): Promise<MediaFolder> {
    const folder = this.folderRepository.create(data);
    return this.folderRepository.save(folder);
  }

  async updateFolder(id: string, data: Partial<MediaFolder>): Promise<MediaFolder | null> {
    await this.folderRepository.update(id, data);
    return this.findFolderById(id);
  }

  async softDeleteFolder(id: string): Promise<boolean> {
    const result = await this.folderRepository.softDelete(id);
    return !!result.affected && result.affected > 0;
  }

  async folderSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.folderRepository.createQueryBuilder('folder')
      .where('folder.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('folder.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
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
