import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../../entities/user.entity';
import {
  LeaderboardPeriod,
  LeaderboardCategory,
} from '../enums/gamification.enums';

@Entity('leaderboard_entries')
@Unique(['userId', 'period', 'category', 'periodStart'])
export class LeaderboardEntry extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId!: string;

  @Column({ type: 'enum', enum: LeaderboardPeriod })
  @Index()
  period!: LeaderboardPeriod;

  @Column({ type: 'enum', enum: LeaderboardCategory })
  @Index()
  category!: LeaderboardCategory;

  @Column({ type: 'int', default: 0 })
  score!: number;

  @Column({ type: 'int', default: 0 })
  rank!: number;

  @Column({ name: 'period_start', type: 'date' })
  @Index()
  periodStart!: Date;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
