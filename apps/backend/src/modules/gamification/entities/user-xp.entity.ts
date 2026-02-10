import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../../entities/user.entity';

@Entity('user_xp')
export class UserXP extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index({ unique: true })
  userId!: string;

  @Column({ name: 'total_xp', type: 'int', default: 0 })
  totalXP!: number;

  @Column({ type: 'int', default: 1 })
  level!: number;

  @Column({ name: 'current_level_xp', type: 'int', default: 0 })
  currentLevelXP!: number;

  @Column({ name: 'next_level_xp', type: 'int', default: 100 })
  nextLevelXP!: number;

  @Column({ length: 50, default: 'Newcomer' })
  title!: string;

  @Column({ type: 'int', default: 0 })
  streak!: number;

  @Column({ name: 'longest_streak', type: 'int', default: 0 })
  longestStreak!: number;

  @Column({ name: 'last_active_date', type: 'date', nullable: true })
  lastActiveDate!: Date | null;

  @Column({ name: 'streak_freeze_available', type: 'int', default: 0 })
  streakFreezeAvailable!: number;

  @Column({ name: 'streak_freeze_used_at', type: 'timestamptz', nullable: true })
  streakFreezeUsedAt!: Date | null;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
