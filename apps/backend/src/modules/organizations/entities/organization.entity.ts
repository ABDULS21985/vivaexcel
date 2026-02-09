import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { OrganizationMember } from './organization-member.entity';
import { Product } from '../../products/entities/product.entity';
import { Service } from '../../services/entities/service.entity';
import { MediaFolder } from '../../media/entities/media-folder.entity';

@Entity('organizations')
export class Organization extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website!: string | null;

  @Column({ type: 'jsonb', default: {} })
  settings!: Record<string, unknown>;

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // Relations
  @OneToMany(() => OrganizationMember, (member) => member.organization)
  members!: OrganizationMember[];

  @OneToMany(() => Product, (product) => product.organization)
  products!: Product[];

  @OneToMany(() => Service, (service) => service.organization)
  services!: Service[];

  @OneToMany(() => MediaFolder, (folder) => folder.organization)
  mediaFolders!: MediaFolder[];
}
