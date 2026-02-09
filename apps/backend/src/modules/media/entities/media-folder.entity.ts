import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { MediaAsset } from './media-asset.entity';

@Entity('media_folders')
export class MediaFolder extends BaseEntity {
  @Index()
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  slug!: string;

  @Index()
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId!: string | null;

  // Self-referencing relations
  @ManyToOne(() => MediaFolder, (folder) => folder.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: MediaFolder | null;

  @OneToMany(() => MediaFolder, (folder) => folder.parent)
  children!: MediaFolder[];

  // Organization relation
  @ManyToOne(() => Organization, (organization) => organization.mediaFolders, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization | null;

  // Asset relations
  @OneToMany(() => MediaAsset, (asset) => asset.folder)
  assets!: MediaAsset[];
}
