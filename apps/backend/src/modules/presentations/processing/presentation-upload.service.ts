import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as path from 'path';
import { PptxProcessorService, PptxMetadata, SlideInfo } from './pptx-processor.service';
import { ThumbnailGeneratorService, ThumbnailResult } from './thumbnail-generator.service';
import { PresentationsRepository } from '../presentations.repository';
import { StorageStrategy, STORAGE_STRATEGY } from '../../media/strategies/storage.interface';
import { Presentation } from '../../../entities/presentation.entity';
import { SlidePreview } from '../../../entities/slide-preview.entity';
import { DigitalProductFile } from '../../../entities/digital-product-file.entity';
import { FileFormat, SlideContentType } from '../enums/presentation.enums';
import { ApiResponse } from '../../../common/interfaces/response.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// ──────────────────────────────────────────────
//  Constants
// ──────────────────────────────────────────────

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

const ALLOWED_EXTENSIONS: Record<string, FileFormat> = {
  '.pptx': FileFormat.PPTX,
  '.ppt': FileFormat.PPT,
  '.key': FileFormat.KEY,
  '.odp': FileFormat.ODP,
  '.pdf': FileFormat.PDF,
};

const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.ms-powerpoint', // .ppt
  'application/x-iwork-keynote-sffkey', // .key
  'application/vnd.apple.keynote', // .key (alternate)
  'application/vnd.oasis.opendocument.presentation', // .odp
  'application/pdf', // .pdf
];

// ──────────────────────────────────────────────
//  Result interface
// ──────────────────────────────────────────────

export interface PresentationUploadResult {
  presentation: Presentation;
  slidePreviews: SlidePreview[];
  file: DigitalProductFile;
}

@Injectable()
export class PresentationUploadService {
  private readonly logger = new Logger(PresentationUploadService.name);

  constructor(
    private readonly pptxProcessor: PptxProcessorService,
    private readonly thumbnailGenerator: ThumbnailGeneratorService,
    private readonly repository: PresentationsRepository,
    @Inject(STORAGE_STRATEGY)
    private readonly storageStrategy: StorageStrategy,
    @InjectRepository(DigitalProductFile)
    private readonly fileRepository: Repository<DigitalProductFile>,
  ) {}

  // ──────────────────────────────────────────────
  //  Process upload
  // ──────────────────────────────────────────────

  async processUpload(
    file: Express.Multer.File,
    digitalProductId: string,
    userId: string,
  ): Promise<ApiResponse<PresentationUploadResult>> {
    // 1. Validate file
    this.validateFile(file);

    const ext = path.extname(file.originalname).toLowerCase();
    const fileFormat = ALLOWED_EXTENSIONS[ext];

    // 2. Upload original file to storage
    const uniqueFilename = `presentations/${digitalProductId}/files/${nanoid(16)}${ext}`;
    const uploadResult = await this.storageStrategy.upload(
      file.buffer,
      uniqueFilename,
      file.mimetype,
    );

    this.logger.debug(
      `Uploaded presentation file: ${uniqueFilename} (${file.size} bytes)`,
    );

    // 3. Extract metadata if .pptx
    let metadata: PptxMetadata | null = null;
    let slideInfos: SlideInfo[] = [];

    if (fileFormat === FileFormat.PPTX) {
      try {
        metadata = await this.pptxProcessor.extractMetadata(file.buffer);
        this.logger.debug(
          `Extracted metadata: ${metadata.slideCount} slides, ${metadata.aspectRatio} aspect ratio`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to extract metadata from PPTX: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // 5. Extract slide info
      try {
        slideInfos = await this.pptxProcessor.extractSlideInfo(file.buffer);
        this.logger.debug(`Extracted info for ${slideInfos.length} slides`);
      } catch (err) {
        this.logger.error(
          `Failed to extract slide info: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // 4. Create or update Presentation record
    const existingPresentation = await this.repository.findByProductId(digitalProductId);

    const presentationData: Partial<Presentation> = {
      digitalProductId,
      fileFormat,
      slideCount: metadata?.slideCount ?? (slideInfos.length || 1),
      aspectRatio: metadata?.aspectRatio ?? existingPresentation?.aspectRatio,
      softwareCompatibility: metadata?.softwareCompatibility ?? existingPresentation?.softwareCompatibility ?? [],
      colorSchemes: metadata?.colorSchemes ?? existingPresentation?.colorSchemes,
      fontFamilies: metadata?.fontFamilies ?? existingPresentation?.fontFamilies,
      hasAnimations: metadata?.hasAnimations ?? false,
      hasTransitions: metadata?.hasTransitions ?? false,
      hasSpeakerNotes: metadata?.hasSpeakerNotes ?? false,
      hasCharts: metadata?.hasCharts ?? false,
      hasImages: metadata?.hasImages ?? false,
      masterSlideCount: metadata?.masterSlideCount,
      layoutCount: metadata?.layoutCount,
      presentationSize: metadata?.presentationSize ?? undefined,
      lastAnalyzedAt: metadata ? new Date() : existingPresentation?.lastAnalyzedAt,
    };

    let presentation: Presentation;

    if (existingPresentation) {
      presentation = (await this.repository.update(
        existingPresentation.id,
        presentationData,
      ))!;
      this.logger.debug(`Updated existing presentation ${existingPresentation.id}`);
    } else {
      presentation = await this.repository.create(presentationData);
      this.logger.debug(`Created new presentation ${presentation.id}`);
    }

    // 6. Generate thumbnails
    let thumbnailResults: ThumbnailResult[] = [];

    if (fileFormat === FileFormat.PPTX) {
      try {
        const titles = slideInfos.map((s) => s.title);
        thumbnailResults = await this.thumbnailGenerator.generateThumbnails(
          file.buffer,
          presentation.id,
          metadata?.slideCount ?? (slideInfos.length || 1),
          titles,
          metadata?.colorSchemes,
        );
        this.logger.debug(`Generated ${thumbnailResults.length} thumbnails`);
      } catch (err) {
        this.logger.error(
          `Failed to generate thumbnails: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // 7. Create SlidePreview records
    // First, remove old slide previews if updating
    if (existingPresentation) {
      const oldPreviews = await this.repository.findSlidePreviews(presentation.id);
      if (oldPreviews.length > 0) {
        const oldKeys = oldPreviews.flatMap((p) => [
          p.thumbnailKey,
          ...(p.previewKey ? [p.previewKey] : []),
        ]);
        await this.thumbnailGenerator.deleteThumbnails(oldKeys);

        for (const oldPreview of oldPreviews) {
          await this.repository.deleteSlidePreview(oldPreview.id);
        }
        this.logger.debug(`Cleaned up ${oldPreviews.length} old slide previews`);
      }
    }

    const slidePreviewData: Partial<SlidePreview>[] = [];

    // Build slide preview records from slide infos + thumbnails
    const slideCount = metadata?.slideCount ?? (slideInfos.length || 1);

    for (let i = 0; i < slideCount; i++) {
      const slideNumber = i + 1;
      const info = slideInfos[i] ?? null;
      const thumb = thumbnailResults.find((t) => t.slideNumber === slideNumber);

      slidePreviewData.push({
        presentationId: presentation.id,
        slideNumber,
        title: info?.title ?? undefined,
        thumbnailUrl: thumb?.thumbnailUrl ?? '',
        thumbnailKey: thumb?.thumbnailKey ?? '',
        previewUrl: thumb?.previewUrl ?? undefined,
        previewKey: thumb?.previewKey ?? undefined,
        width: thumb?.width ?? 400,
        height: thumb?.height ?? 225,
        hasNotes: info?.hasNotes ?? false,
        notesPreview: info?.notesPreview ?? undefined,
        contentType: info?.contentType ?? SlideContentType.CONTENT,
        sortOrder: slideNumber,
      });
    }

    let slidePreviews: SlidePreview[] = [];

    if (slidePreviewData.length > 0) {
      slidePreviews = await this.repository.bulkCreateSlidePreviews(slidePreviewData);
      this.logger.debug(`Created ${slidePreviews.length} slide preview records`);
    }

    // 8. Create DigitalProductFile record
    const digitalProductFile = this.fileRepository.create({
      productId: digitalProductId,
      fileName: file.originalname,
      fileKey: uploadResult.path,
      fileSize: uploadResult.size,
      mimeType: file.mimetype,
      uploadedBy: userId,
      version: '1.0',
    });

    const savedFile = await this.fileRepository.save(digitalProductFile);
    this.logger.debug(`Created digital product file record ${savedFile.id}`);

    // 9. Reload the full presentation with relations
    const fullPresentation = await this.repository.findById(presentation.id);

    return {
      status: 'success',
      message: 'Presentation uploaded and processed successfully',
      data: {
        presentation: fullPresentation || presentation,
        slidePreviews,
        file: savedFile,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Reprocess
  // ──────────────────────────────────────────────

  async reprocessPresentation(
    presentationId: string,
  ): Promise<ApiResponse<PresentationUploadResult>> {
    const presentation = await this.repository.findById(presentationId);
    if (!presentation) {
      throw new NotFoundException(`Presentation with ID "${presentationId}" not found`);
    }

    // Find the associated digital product file
    const files = await this.fileRepository.find({
      where: { productId: presentation.digitalProductId },
      order: { createdAt: 'DESC' },
    });

    if (files.length === 0) {
      throw new NotFoundException(
        `No files found for presentation "${presentationId}". Upload a file first.`,
      );
    }

    const latestFile = files[0];

    // Check if file is a PPTX
    if (presentation.fileFormat !== FileFormat.PPTX) {
      throw new BadRequestException(
        'Only .pptx files can be reprocessed for metadata extraction.',
      );
    }

    // Check that the file still exists in storage
    const fileExists = await this.storageStrategy.exists(latestFile.fileKey);
    if (!fileExists) {
      throw new NotFoundException(
        `The stored file for presentation "${presentationId}" could not be found in storage.`,
      );
    }

    // Download the file from storage to re-process
    // Since StorageStrategy doesn't have a download method, we need to use getUrl
    // and fetch, or we store the buffer. For now, throw a meaningful error
    // if the file is not available as a buffer.
    // A production enhancement would be to add a download method to StorageStrategy.
    throw new BadRequestException(
      'Reprocessing requires re-downloading the file from storage. ' +
      'Please re-upload the file using the upload endpoint to reprocess.',
    );
  }

  // ──────────────────────────────────────────────
  //  Delete presentation files
  // ──────────────────────────────────────────────

  async deletePresentation(
    presentationId: string,
  ): Promise<ApiResponse<null>> {
    const presentation = await this.repository.findById(presentationId);
    if (!presentation) {
      throw new NotFoundException(`Presentation with ID "${presentationId}" not found`);
    }

    // 1. Delete thumbnails and previews from storage
    const slidePreviews = await this.repository.findSlidePreviews(presentationId);
    if (slidePreviews.length > 0) {
      const keys = slidePreviews.flatMap((p) => [
        p.thumbnailKey,
        ...(p.previewKey ? [p.previewKey] : []),
      ]);
      await this.thumbnailGenerator.deleteThumbnails(keys);

      // Delete slide preview records
      for (const preview of slidePreviews) {
        await this.repository.deleteSlidePreview(preview.id);
      }

      this.logger.debug(`Deleted ${slidePreviews.length} slide previews and their storage files`);
    }

    // 2. Delete original presentation files from storage
    const productFiles = await this.fileRepository.find({
      where: { productId: presentation.digitalProductId },
    });

    for (const file of productFiles) {
      try {
        await this.storageStrategy.delete(file.fileKey);
        await this.fileRepository.remove(file);
        this.logger.debug(`Deleted file ${file.fileKey} from storage`);
      } catch (err) {
        this.logger.warn(
          `Failed to delete file ${file.fileKey}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // 3. Soft-delete the presentation record
    await this.repository.softDelete(presentationId);
    this.logger.debug(`Soft-deleted presentation ${presentationId}`);

    return {
      status: 'success',
      message: 'Presentation and all associated files deleted successfully',
      data: null,
    };
  }

  // ──────────────────────────────────────────────
  //  Validation
  // ──────────────────────────────────────────────

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds the maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS[ext]) {
      throw new BadRequestException(
        `File type "${ext}" is not supported. Allowed types: ${Object.keys(ALLOWED_EXTENSIONS).join(', ')}`,
      );
    }

    // Check MIME type
    const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.mimetype) ||
      file.mimetype === 'application/octet-stream'; // Some clients send generic MIME

    if (!isAllowedMime) {
      this.logger.warn(
        `Unexpected MIME type "${file.mimetype}" for file "${file.originalname}", proceeding with extension-based validation`,
      );
    }
  }
}
