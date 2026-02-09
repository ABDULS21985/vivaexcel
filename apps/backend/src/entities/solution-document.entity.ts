import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { DigitalProduct } from './digital-product.entity';
import { User } from './user.entity';
import { DocumentUpdate } from './document-update.entity';
import {
  DocumentType,
  Domain,
  DiagramTool,
  MaturityLevel,
  DocumentStatus,
} from '../modules/solution-documents/enums/solution-document.enums';

export interface DocumentIncludes {
  editableTemplates: boolean;
  diagramFiles: boolean;
  implementationChecklist: boolean;
  costEstimator: boolean;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface TableOfContentsItem {
  title: string;
  page?: number;
  children?: TableOfContentsItem[];
}

@Entity('solution_documents')
export class SolutionDocument extends BaseEntity {
  @Column()
  title: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'short_description', length: 500 })
  shortDescription: string;

  @Column({ name: 'digital_product_id' })
  @Index()
  digitalProductId: string;

  @ManyToOne(() => DigitalProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct: DigitalProduct;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
  })
  @Index()
  documentType: DocumentType;

  @Column({
    type: 'enum',
    enum: Domain,
  })
  @Index()
  domain: Domain;

  @Column({
    name: 'cloud_platform',
    type: 'jsonb',
    default: [],
  })
  cloudPlatform: string[];

  @Column({
    name: 'technology_stack',
    type: 'jsonb',
    default: [],
  })
  technologyStack: string[];

  @Column({ name: 'page_count', type: 'int' })
  pageCount: number;

  @Column({ name: 'word_count', type: 'int' })
  wordCount: number;

  @Column({ name: 'diagram_count', type: 'int', default: 0 })
  diagramCount: number;

  @Column({ name: 'has_editable_diagrams', default: false })
  hasEditableDiagrams: boolean;

  @Column({
    name: 'diagram_tool',
    type: 'enum',
    enum: DiagramTool,
    default: DiagramTool.NONE,
  })
  diagramTool: DiagramTool;

  @Column({
    name: 'template_format',
    type: 'jsonb',
    default: [],
  })
  templateFormat: string[];

  @Column({
    name: 'compliance_frameworks',
    type: 'jsonb',
    default: [],
  })
  complianceFrameworks: string[];

  @Column({
    name: 'maturity_level',
    type: 'enum',
    enum: MaturityLevel,
    default: MaturityLevel.STARTER,
  })
  maturityLevel: MaturityLevel;

  @Column({ name: 'last_updated', nullable: true })
  lastUpdated?: Date;

  @Column({ default: '1.0' })
  version: string;

  @Column({
    type: 'jsonb',
    default: [],
  })
  changelog: ChangelogEntry[];

  @Column({
    name: 'table_of_contents',
    type: 'jsonb',
    nullable: true,
  })
  tableOfContents?: TableOfContentsItem[];

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  price: number;

  @Column({
    name: 'compare_at_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  compareAtPrice?: number;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  @Index()
  status: DocumentStatus;

  @Column({ name: 'featured_image', nullable: true })
  featuredImage?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({
    type: 'jsonb',
    default: {
      editableTemplates: false,
      diagramFiles: false,
      implementationChecklist: false,
      costEstimator: false,
    },
  })
  includes: DocumentIncludes;

  @Column({ name: 'seo_title', nullable: true })
  seoTitle?: string;

  @Column({ name: 'seo_description', type: 'text', nullable: true })
  seoDescription?: string;

  @Column({ name: 'organization_id', nullable: true })
  organizationId?: string;

  @Column({ name: 'ai_generated_description', type: 'text', nullable: true })
  aiGeneratedDescription?: string;

  @Column({ name: 'ai_suggested_tags', type: 'jsonb', nullable: true })
  aiSuggestedTags?: string[];

  @Column({ name: 'freshness_score', type: 'int', default: 100 })
  freshnessScore: number;

  // Relations

  @OneToMany(() => DocumentUpdate, (update) => update.solutionDocument)
  documentUpdates?: DocumentUpdate[];
}
