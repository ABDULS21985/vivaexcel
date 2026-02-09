import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { SolutionDocument } from './solution-document.entity';

@Entity('document_updates')
export class DocumentUpdate extends BaseEntity {
  @Column({ name: 'document_id' })
  @Index()
  documentId: string;

  @ManyToOne(() => SolutionDocument, (doc) => doc.documentUpdates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'document_id' })
  solutionDocument: SolutionDocument;

  @Column()
  version: string;

  @Column({ name: 'release_notes', type: 'text' })
  releaseNotes: string;

  @Column({ name: 'file_id', nullable: true })
  fileId?: string;

  @Column({ name: 'published_at', nullable: true })
  publishedAt?: Date;
}
