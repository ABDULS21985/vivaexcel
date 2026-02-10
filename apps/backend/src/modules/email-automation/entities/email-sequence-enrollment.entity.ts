import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { EnrollmentStatus } from '../enums/email-automation.enums';
import { EmailSequence } from './email-sequence.entity';

@Entity('email_sequence_enrollments')
@Unique(['sequenceId', 'userId'])
export class EmailSequenceEnrollment extends BaseEntity {
  @Column({ name: 'sequence_id' })
  @Index()
  sequenceId!: string;

  @Column({ name: 'user_id' })
  @Index()
  userId!: string;

  @Column({ name: 'current_step', type: 'int', default: 0 })
  currentStep!: number;

  @Index()
  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status!: EnrollmentStatus;

  @Column({
    name: 'enrolled_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  enrolledAt!: Date;

  @Column({ name: 'last_step_sent_at', type: 'timestamptz', nullable: true })
  lastStepSentAt!: Date | null;

  @Column({ name: 'next_step_at', type: 'timestamptz', nullable: true })
  nextStepAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @ManyToOne(() => EmailSequence, (sequence) => sequence.enrollments, {
    eager: false,
  })
  @JoinColumn({ name: 'sequence_id' })
  sequence!: EmailSequence;
}
