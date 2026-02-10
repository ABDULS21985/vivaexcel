import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { EmailSequenceTrigger } from '../enums/email-automation.enums';
import { EmailSequenceStep } from '../interfaces/email-sequence-step.interface';
import { EmailSequenceEnrollment } from './email-sequence-enrollment.entity';

@Entity('email_sequences')
export class EmailSequence extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: EmailSequenceTrigger,
  })
  trigger!: EmailSequenceTrigger;

  @Column({ type: 'jsonb' })
  steps!: EmailSequenceStep[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(
    () => EmailSequenceEnrollment,
    (enrollment) => enrollment.sequence,
  )
  enrollments!: EmailSequenceEnrollment[];
}
