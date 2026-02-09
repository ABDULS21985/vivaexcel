import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Media } from './media.entity';
import { User } from './user.entity';

@Entity('media_folders')
export class MediaFolder extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId?: string;

  @ManyToOne(() => MediaFolder, (folder) => folder.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: MediaFolder;

  @OneToMany(() => MediaFolder, (folder) => folder.parent)
  children?: MediaFolder[];

  @OneToMany(() => Media, (media) => media.folder)
  files?: Media[];

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @Column({ default: 0 })
  order: number;
}
