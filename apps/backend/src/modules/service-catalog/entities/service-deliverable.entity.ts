import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { CatalogService } from './catalog-service.entity';

@Entity('service_deliverables')
export class ServiceDeliverable extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Index()
  @Column({ name: 'service_id', type: 'uuid' })
  serviceId!: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // Relations
  @ManyToOne(() => CatalogService, (service) => service.deliverables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service!: CatalogService;
}
