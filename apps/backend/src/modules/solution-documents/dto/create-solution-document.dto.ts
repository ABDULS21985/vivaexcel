import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsInt,
  IsOptional,
  IsArray,
  IsUUID,
  IsDateString,
  Min,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DocumentType,
  Domain,
  DiagramTool,
  MaturityLevel,
  DocumentStatus,
} from '../enums/solution-document.enums';

export class ChangelogEntryDto {
  @ApiProperty({ example: '1.0' })
  @IsString()
  version: string;

  @ApiProperty({ example: '2025-01-15' })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'List of changes in this version',
    type: [String],
    example: ['Initial release with full architecture diagrams', 'Added cost estimation worksheet'],
  })
  @IsArray()
  @IsString({ each: true })
  changes: string[];
}

export class TableOfContentsItemDto {
  @ApiProperty({ example: 'Executive Summary' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ type: () => [TableOfContentsItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableOfContentsItemDto)
  children?: TableOfContentsItemDto[];
}

export class DocumentIncludesDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  editableTemplates: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  diagramFiles: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  implementationChecklist: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  costEstimator: boolean;
}

export class CreateSolutionDocumentDto {
  @ApiProperty({ description: 'Digital product ID to associate with this document' })
  @IsUUID()
  digitalProductId: string;

  @ApiProperty({ description: 'Document title', example: 'AWS Cloud Migration SDD' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'aws-cloud-migration-sdd' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiProperty({ description: 'Full document description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Short description for listings', example: 'Complete AWS migration blueprint with architecture diagrams' })
  @IsString()
  @MaxLength(500)
  shortDescription: string;

  @ApiProperty({ description: 'ID of the user creating this document' })
  @IsString()
  createdBy: string;

  @ApiProperty({
    enum: DocumentType,
    description: 'Type of solution document',
    example: DocumentType.SOLUTION_DESIGN,
  })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({
    enum: Domain,
    description: 'Industry domain',
    example: Domain.CLOUD_INFRASTRUCTURE,
  })
  @IsEnum(Domain)
  domain: Domain;

  @ApiPropertyOptional({
    description: 'Target cloud platforms',
    type: [String],
    example: ['AWS', 'Azure', 'GCP'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cloudPlatform?: string[];

  @ApiPropertyOptional({
    description: 'Technology stack covered',
    type: [String],
    example: ['Kubernetes', 'Terraform', 'Docker'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologyStack?: string[];

  @ApiProperty({ description: 'Total page count', example: 45 })
  @IsInt()
  @Min(1)
  @Max(10000)
  pageCount: number;

  @ApiProperty({ description: 'Total word count', example: 12000 })
  @IsInt()
  @Min(1)
  wordCount: number;

  @ApiPropertyOptional({ description: 'Number of diagrams included', example: 8, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  diagramCount?: number;

  @ApiPropertyOptional({ description: 'Whether diagrams are editable', default: false })
  @IsOptional()
  @IsBoolean()
  hasEditableDiagrams?: boolean;

  @ApiPropertyOptional({
    enum: DiagramTool,
    description: 'Tool used for diagrams',
    example: DiagramTool.DRAWIO,
  })
  @IsOptional()
  @IsEnum(DiagramTool)
  diagramTool?: DiagramTool;

  @ApiPropertyOptional({
    description: 'Available template formats',
    type: [String],
    example: ['DOCX', 'PDF', 'Notion', 'Confluence', 'Markdown'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  templateFormat?: string[];

  @ApiPropertyOptional({
    description: 'Compliance frameworks covered',
    type: [String],
    example: ['SOC2', 'HIPAA', 'GDPR'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceFrameworks?: string[];

  @ApiPropertyOptional({
    enum: MaturityLevel,
    description: 'Target maturity level',
    example: MaturityLevel.ENTERPRISE,
    default: MaturityLevel.STARTER,
  })
  @IsOptional()
  @IsEnum(MaturityLevel)
  maturityLevel?: MaturityLevel;

  @ApiPropertyOptional({ description: 'Content freshness date' })
  @IsOptional()
  @IsDateString()
  lastUpdated?: string;

  @ApiPropertyOptional({ description: 'Document version', example: '1.0', default: '1.0' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  version?: string;

  @ApiPropertyOptional({
    description: 'Version changelog entries',
    type: [ChangelogEntryDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChangelogEntryDto)
  changelog?: ChangelogEntryDto[];

  @ApiPropertyOptional({
    description: 'Structured table of contents',
    type: [TableOfContentsItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableOfContentsItemDto)
  tableOfContents?: TableOfContentsItemDto[];

  @ApiProperty({ description: 'Document price', example: 49.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Original price for comparison', example: 79.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({
    enum: DocumentStatus,
    description: 'Publication status',
    example: DocumentStatus.DRAFT,
    default: DocumentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'What is included with the document',
    type: DocumentIncludesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentIncludesDto)
  includes?: DocumentIncludesDto;

  @ApiPropertyOptional({ description: 'SEO title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO description' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'Organization ID' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'AI-generated description of the document' })
  @IsOptional()
  @IsString()
  aiGeneratedDescription?: string;

  @ApiPropertyOptional({
    description: 'AI-suggested tags for the document',
    type: [String],
    example: ['cloud-migration', 'aws', 'architecture'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiSuggestedTags?: string[];

  @ApiPropertyOptional({
    description: 'Calculated freshness score 0-100',
    example: 100,
    default: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  freshnessScore?: number;
}
