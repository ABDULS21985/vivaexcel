import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as path from 'path';
import { DocumentProcessorService, DocumentMetadata } from './document-processor.service';
import { SolutionDocumentsRepository } from '../solution-documents.repository';
import { StorageStrategy, STORAGE_STRATEGY } from '../../media/strategies/storage.interface';
import { SolutionDocument } from '../../../entities/solution-document.entity';
import { DigitalProductFile } from '../../../entities/digital-product-file.entity';
import { ApiResponse } from '../../../common/interfaces/response.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// ──────────────────────────────────────────────
//  Constants
// ──────────────────────────────────────────────

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_EXTENSIONS: Record<string, string> = {
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.md': 'text/markdown',
};

const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/pdf', // .pdf
  'application/msword', // .doc
  'text/markdown', // .md
  'text/plain', // .md (some clients)
];

// ──────────────────────────────────────────────
//  Result interface
// ──────────────────────────────────────────────

export interface DocumentUploadResult {
  document: SolutionDocument;
  file: DigitalProductFile;
}

@Injectable()
export class DocumentUploadService {
  private readonly logger = new Logger(DocumentUploadService.name);

  constructor(
    private readonly documentProcessor: DocumentProcessorService,
    private readonly repository: SolutionDocumentsRepository,
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
  ): Promise<ApiResponse<DocumentUploadResult>> {
    // 1. Validate file
    this.validateFile(file);

    const ext = path.extname(file.originalname).toLowerCase();

    // 2. Upload original file to storage
    const uniqueFilename = `solution-documents/${digitalProductId}/files/${nanoid(16)}${ext}`;
    const uploadResult = await this.storageStrategy.upload(
      file.buffer,
      uniqueFilename,
      file.mimetype,
    );

    this.logger.debug(
      `Uploaded document file: ${uniqueFilename} (${file.size} bytes)`,
    );

    // 3. Extract metadata based on file type
    let metadata: DocumentMetadata | null = null;

    if (ext === '.docx') {
      try {
        metadata = await this.documentProcessor.extractDocxMetadata(file.buffer);
        this.logger.debug(
          `Extracted DOCX metadata: ${metadata.pageCount} pages, ${metadata.wordCount} words, ${metadata.headings.length} headings`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to extract DOCX metadata: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    } else if (ext === '.pdf') {
      try {
        metadata = await this.documentProcessor.extractPdfMetadata(file.buffer);
        this.logger.debug(
          `Extracted PDF metadata: ${metadata.pageCount} pages, ${metadata.wordCount} words`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to extract PDF metadata: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // 4. Detect technologies and compliance frameworks from extracted text
    const extractedText = metadata?.extractedText || '';
    const technologies = this.documentProcessor.detectTechnologies(extractedText);
    const complianceFrameworks = this.documentProcessor.detectComplianceFrameworks(extractedText);

    // 5. Generate table of contents from headings
    const tableOfContents = metadata?.headings
      ? this.documentProcessor.generateTableOfContents(metadata.headings)
      : [];

    // 6. Create or update SolutionDocument record
    const existingDocument = await this.repository.findByProductId(digitalProductId);

    const documentData: Partial<SolutionDocument> = {
      digitalProductId,
      pageCount: metadata?.pageCount ?? (existingDocument?.pageCount || 1),
      wordCount: metadata?.wordCount ?? (existingDocument?.wordCount || 0),
      diagramCount: metadata?.diagramCount ?? (existingDocument?.diagramCount || 0),
      tableOfContents: tableOfContents.length > 0
        ? tableOfContents
        : (existingDocument?.tableOfContents ?? undefined),
      technologyStack: technologies.length > 0
        ? technologies
        : (existingDocument?.technologyStack ?? []),
      complianceFrameworks: complianceFrameworks.length > 0
        ? complianceFrameworks
        : (existingDocument?.complianceFrameworks ?? []),
      lastUpdated: new Date(),
    };

    // If metadata extracted author/title/description, use them as defaults
    if (metadata?.title && !existingDocument?.title) {
      documentData.title = metadata.title;
    }
    if (metadata?.description && !existingDocument?.description) {
      documentData.description = metadata.description;
    }

    let document: SolutionDocument;

    if (existingDocument) {
      document = (await this.repository.update(
        existingDocument.id,
        documentData,
      ))!;
      this.logger.debug(`Updated existing solution document ${existingDocument.id}`);
    } else {
      // For new documents, ensure required fields have defaults
      documentData.createdBy = userId;
      document = await this.repository.create(documentData);
      this.logger.debug(`Created new solution document ${document.id}`);
    }

    // 7. Create DigitalProductFile record
    const digitalProductFile = this.fileRepository.create({
      productId: digitalProductId,
      fileName: file.originalname,
      fileKey: uploadResult.path,
      fileSize: uploadResult.size,
      mimeType: file.mimetype,
      uploadedBy: userId,
      version: existingDocument?.version || '1.0',
    });

    const savedFile = await this.fileRepository.save(digitalProductFile);
    this.logger.debug(`Created digital product file record ${savedFile.id}`);

    // 8. Reload the full document with relations
    const fullDocument = await this.repository.findById(document.id);

    return {
      status: 'success',
      message: 'Document uploaded and processed successfully',
      data: {
        document: fullDocument || document,
        file: savedFile,
      },
    };
  }

  // ──────────────────────────────────────────────
  //  Reprocess
  // ──────────────────────────────────────────────

  async reprocessDocument(
    documentId: string,
  ): Promise<ApiResponse<DocumentUploadResult>> {
    const document = await this.repository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Solution document with ID "${documentId}" not found`);
    }

    // Find the associated digital product file
    const files = await this.fileRepository.find({
      where: { productId: document.digitalProductId },
      order: { createdAt: 'DESC' },
    });

    if (files.length === 0) {
      throw new NotFoundException(
        `No files found for document "${documentId}". Upload a file first.`,
      );
    }

    const latestFile = files[0];
    const ext = path.extname(latestFile.fileName).toLowerCase();

    // Check that the file type supports metadata extraction
    if (ext !== '.docx' && ext !== '.pdf') {
      throw new BadRequestException(
        `File type "${ext}" does not support metadata reprocessing. Only .docx and .pdf files can be reprocessed.`,
      );
    }

    // Check that the file still exists in storage
    const fileExists = await this.storageStrategy.exists(latestFile.fileKey);
    if (!fileExists) {
      throw new NotFoundException(
        `The stored file for document "${documentId}" could not be found in storage.`,
      );
    }

    // Note: StorageStrategy does not have a download method.
    // For reprocessing, we would need to add a download method to the interface.
    // For now, we indicate this limitation.
    throw new BadRequestException(
      'Reprocessing requires re-downloading the file from storage. ' +
      'Please re-upload the file using the upload endpoint to reprocess.',
    );
  }

  // ──────────────────────────────────────────────
  //  Delete document files
  // ──────────────────────────────────────────────

  async deleteDocumentFiles(
    documentId: string,
  ): Promise<ApiResponse<null>> {
    const document = await this.repository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Solution document with ID "${documentId}" not found`);
    }

    // 1. Delete files from storage + file records
    const productFiles = await this.fileRepository.find({
      where: { productId: document.digitalProductId },
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

    // 2. Soft-delete the solution document record
    await this.repository.softDelete(documentId);
    this.logger.debug(`Soft-deleted solution document ${documentId}`);

    return {
      status: 'success',
      message: 'Solution document and all associated files deleted successfully',
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
