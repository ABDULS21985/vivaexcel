import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Presentation } from './presentation.entity';
import { SlideContentType } from '../modules/presentations/enums/presentation.enums';

@Entity('slide_previews')
export class SlidePreview extends BaseEntity {
  @Column({ name: 'presentation_id' })
  @Index()
  presentationId: string;

  @Column({ name: 'slide_number', type: 'int' })
  slideNumber: number;

  @Column({ nullable: true })
  title?: string;

  @Column({ name: 'thumbnail_url' })
  thumbnailUrl: string;

  @Column({ name: 'thumbnail_key' })
  thumbnailKey: string;

  @Column({ name: 'preview_url', nullable: true })
  previewUrl?: string;

  @Column({ name: 'preview_key', nullable: true })
  previewKey?: string;

  @Column({ type: 'int' })
  width: number;

  @Column({ type: 'int' })
  height: number;

  @Column({ name: 'has_notes', default: false })
  hasNotes: boolean;

  @Column({ name: 'notes_preview', type: 'text', nullable: true })
  notesPreview?: string;

  @Column({
    name: 'content_type',
    type: 'enum',
    enum: SlideContentType,
    default: SlideContentType.CONTENT,
  })
  contentType: SlideContentType;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  // Relations

  @ManyToOne(() => Presentation, (presentation) => presentation.slidePreviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'presentation_id' })
  presentation: Presentation;
}
