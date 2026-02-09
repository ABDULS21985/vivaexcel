import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { MediaFolder } from './media-folder.entity';
import { User } from '../../../entities/user.entity';

export enum StorageProvider {
  LOCAL = 'local',
  S3 = 's3',
  GCS = 'gcs',
  AZURE = 'azure',
}

@Entity('media_assets')
export class MediaAsset extends BaseEntity {
  @Index()
  @Column({ name: 'folder_id', type: 'uuid', nullable: true })
  folderId!: string | null;

  @Index()
  @Column({ name: 'uploaded_by_id', type: 'uuid', nullable: true })
  uploadedById!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  filename!: string;

  @Index()
  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType!: string;

  @Column({ type: 'bigint' })
  size!: number;

  @Column({ name: 'storage_path', type: 'varchar', length: 500 })
  storagePath!: string;

  @Index()
  @Column({
    name: 'storage_provider',
    type: 'enum',
    enum: StorageProvider,
    default: StorageProvider.LOCAL,
  })
  storageProvider!: StorageProvider;

  @Column({ type: 'int', nullable: true })
  width!: number | null;

  @Column({ type: 'int', nullable: true })
  height!: number | null;

  @Column({ name: 'alt_text', type: 'varchar', length: 255, nullable: true })
  altText!: string | null;

  // Relations
  @ManyToOne(() => MediaFolder, (folder) => folder.assets, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'folder_id' })
  folder!: MediaFolder | null;

  @ManyToOne(() => User, (user) => user.uploadedAssets, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy!: User | null;
}
