import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { MediaFolder } from './media-folder.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}

@Entity('media')
export class Media extends BaseEntity {
  @Column()
  filename: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column({ nullable: true })
  url?: string;

  @Column({ type: 'enum', enum: MediaType, default: MediaType.OTHER })
  type: MediaType;

  @Column({ nullable: true })
  alt?: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  width?: number;

  @Column({ nullable: true })
  height?: number;

  @Column({ name: 'folder_id', nullable: true })
  folderId?: string;

  @ManyToOne(() => MediaFolder, (folder) => folder.files, { nullable: true })
  @JoinColumn({ name: 'folder_id' })
  folder?: MediaFolder;

  @Column({ name: 'uploaded_by', nullable: true })
  uploadedBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploader?: User;

  @Column({ nullable: true })
  storage?: string; // 'local', 's3', etc.

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  @Index()
  tags?: string[];
}
