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
import { SlidePreview } from './slide-preview.entity';
import {
  AspectRatio,
  Industry,
  PresentationType,
  FileFormat,
} from '../modules/presentations/enums/presentation.enums';

export interface ColorScheme {
  name: string;
  colors: string[];
}

@Entity('presentations')
export class Presentation extends BaseEntity {
  @Column({ name: 'digital_product_id' })
  @Index()
  digitalProductId: string;

  @ManyToOne(() => DigitalProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'digital_product_id' })
  digitalProduct: DigitalProduct;

  @Column({ name: 'slide_count', type: 'int' })
  slideCount: number;

  @Column({
    name: 'aspect_ratio',
    type: 'enum',
    enum: AspectRatio,
  })
  aspectRatio: AspectRatio;

  @Column({
    name: 'software_compatibility',
    type: 'jsonb',
  })
  softwareCompatibility: string[];

  @Column({
    name: 'color_schemes',
    type: 'jsonb',
    nullable: true,
  })
  colorSchemes?: ColorScheme[];

  @Column({
    name: 'font_families',
    type: 'jsonb',
    nullable: true,
  })
  fontFamilies?: string[];

  @Column({ name: 'has_animations', default: false })
  hasAnimations: boolean;

  @Column({ name: 'has_transitions', default: false })
  hasTransitions: boolean;

  @Column({ name: 'has_speaker_notes', default: false })
  hasSpeakerNotes: boolean;

  @Column({ name: 'has_charts', default: false })
  hasCharts: boolean;

  @Column({ name: 'has_images', default: false })
  hasImages: boolean;

  @Column({ name: 'master_slide_count', type: 'int', nullable: true })
  masterSlideCount?: number;

  @Column({ name: 'layout_count', type: 'int', nullable: true })
  layoutCount?: number;

  @Column({
    type: 'enum',
    enum: Industry,
  })
  @Index()
  industry: Industry;

  @Column({
    name: 'presentation_type',
    type: 'enum',
    enum: PresentationType,
  })
  @Index()
  presentationType: PresentationType;

  @Column({
    name: 'file_format',
    type: 'enum',
    enum: FileFormat,
  })
  fileFormat: FileFormat;

  @Column({ name: 'presentation_size', nullable: true })
  presentationSize?: string;

  @Column({ name: 'template_category', nullable: true })
  templateCategory?: string;

  @Column({ name: 'is_fully_editable', default: true })
  isFullyEditable: boolean;

  @Column({ name: 'includes_documentation', default: false })
  includesDocumentation: boolean;

  @Column({ name: 'last_analyzed_at', nullable: true })
  lastAnalyzedAt?: Date;

  @Column({ name: 'ai_generated_description', type: 'text', nullable: true })
  aiGeneratedDescription?: string;

  @Column({ name: 'ai_suggested_tags', type: 'jsonb', nullable: true })
  aiSuggestedTags?: string[];

  @Column({
    name: 'ai_suggested_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  aiSuggestedPrice?: number;

  // Relations

  @OneToMany(() => SlidePreview, (slidePreview) => slidePreview.presentation)
  slidePreviews?: SlidePreview[];
}
