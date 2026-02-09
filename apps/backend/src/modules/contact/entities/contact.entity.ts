import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { ContactSubmission } from './contact-submission.entity';

@Entity('contacts')
export class Contact extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  source!: string | null;

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // Relations
  @OneToMany(() => ContactSubmission, (submission) => submission.contact)
  submissions!: ContactSubmission[];
}
