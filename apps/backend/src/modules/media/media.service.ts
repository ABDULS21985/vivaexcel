import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as path from 'path';
import { MediaRepository } from './media.repository';
import { UploadMediaDto, UpdateMediaDto } from './dto/upload-media.dto';
import { MediaQueryDto } from './dto/media-query.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { Media, MediaType } from '../../entities/media.entity';
import { MediaFolder } from '../../entities/media-folder.entity';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces/response.interface';
import { StorageStrategy, STORAGE_STRATEGY } from './strategies/storage.interface';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    @Inject(STORAGE_STRATEGY)
    private readonly storageStrategy: StorageStrategy,
  ) {}

  async findAll(query: MediaQueryDto): Promise<ApiResponse<PaginatedResponse<Media>>> {
    const result = await this.mediaRepository.findAllMedia(query);
    return {
      status: 'success',
      message: 'Media files retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async findById(id: string): Promise<ApiResponse<Media>> {
    const media = await this.mediaRepository.findMediaById(id);
    if (!media) {
      throw new NotFoundException(`Media with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Media file retrieved successfully',
      data: media,
    };
  }

  async upload(
    file: Express.Multer.File,
    uploadMediaDto: UploadMediaDto,
    userId?: string,
  ): Promise<ApiResponse<Media>> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const uniqueFilename = `${nanoid(16)}${ext}`;

    // Determine media type
    const type = this.getMediaType(file.mimetype);

    // Upload to storage
    const uploadResult = await this.storageStrategy.upload(
      file.buffer,
      uniqueFilename,
      file.mimetype,
    );

    // Get image dimensions if applicable
    let width: number | undefined;
    let height: number | undefined;
    if (type === MediaType.IMAGE) {
      // You could use a library like sharp to get dimensions
      // const metadata = await sharp(file.buffer).metadata();
      // width = metadata.width;
      // height = metadata.height;
    }

    // Create media record
    const media = await this.mediaRepository.createMedia({
      filename: uniqueFilename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: uploadResult.size,
      path: uploadResult.path,
      url: uploadResult.url,
      type,
      width,
      height,
      alt: uploadMediaDto.alt,
      title: uploadMediaDto.title,
      description: uploadMediaDto.description,
      folderId: uploadMediaDto.folderId,
      tags: uploadMediaDto.tags,
      uploadedBy: userId,
      storage: 'local', // or 's3' based on configuration
    });

    return {
      status: 'success',
      message: 'File uploaded successfully',
      data: media,
    };
  }

  async update(id: string, updateMediaDto: UpdateMediaDto): Promise<ApiResponse<Media>> {
    const media = await this.mediaRepository.findMediaById(id);
    if (!media) {
      throw new NotFoundException(`Media with ID "${id}" not found`);
    }

    const updatedMedia = await this.mediaRepository.updateMedia(id, updateMediaDto);

    return {
      status: 'success',
      message: 'Media updated successfully',
      data: updatedMedia!,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const media = await this.mediaRepository.findMediaById(id);
    if (!media) {
      throw new NotFoundException(`Media with ID "${id}" not found`);
    }

    // Delete from storage
    await this.storageStrategy.delete(media.path);

    // Soft delete from database
    await this.mediaRepository.softDeleteMedia(id);

    return {
      status: 'success',
      message: 'Media deleted successfully',
      data: null,
    };
  }

  // Folder methods
  async findAllFolders(): Promise<ApiResponse<MediaFolder[]>> {
    const folders = await this.mediaRepository.findAllFolders();
    return {
      status: 'success',
      message: 'Folders retrieved successfully',
      data: folders,
    };
  }

  async createFolder(createFolderDto: CreateFolderDto, userId?: string): Promise<ApiResponse<MediaFolder>> {
    // Check if slug already exists
    const slugExists = await this.mediaRepository.folderSlugExists(createFolderDto.slug);
    if (slugExists) {
      throw new ConflictException('Folder slug already exists');
    }

    const folder = await this.mediaRepository.createFolder({
      ...createFolderDto,
      createdBy: userId,
    });

    return {
      status: 'success',
      message: 'Folder created successfully',
      data: folder,
    };
  }

  async findFolderById(id: string): Promise<ApiResponse<MediaFolder>> {
    const folder = await this.mediaRepository.findFolderById(id);
    if (!folder) {
      throw new NotFoundException(`Folder with ID "${id}" not found`);
    }

    return {
      status: 'success',
      message: 'Folder retrieved successfully',
      data: folder,
    };
  }

  async removeFolder(id: string): Promise<ApiResponse<null>> {
    const folder = await this.mediaRepository.findFolderById(id);
    if (!folder) {
      throw new NotFoundException(`Folder with ID "${id}" not found`);
    }

    await this.mediaRepository.softDeleteFolder(id);

    return {
      status: 'success',
      message: 'Folder deleted successfully',
      data: null,
    };
  }

  private getMediaType(mimetype: string): MediaType {
    if (mimetype.startsWith('image/')) {
      return MediaType.IMAGE;
    }
    if (mimetype.startsWith('video/')) {
      return MediaType.VIDEO;
    }
    if (mimetype.startsWith('audio/')) {
      return MediaType.AUDIO;
    }
    if (
      mimetype.includes('pdf') ||
      mimetype.includes('document') ||
      mimetype.includes('spreadsheet') ||
      mimetype.includes('presentation') ||
      mimetype.includes('text/')
    ) {
      return MediaType.DOCUMENT;
    }
    return MediaType.OTHER;
  }
}
