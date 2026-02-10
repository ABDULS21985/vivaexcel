import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../../entities/user.entity';
import { Achievement } from './achievement.entity';

@Entity('user_achievements')
@Unique(['userId', 'achievementId'])
export class UserAchievement extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId!: string;

  @Column({ name: 'achievement_id' })
  @Index()
  achievementId!: string;

  @Column({ name: 'unlocked_at', type: 'timestamptz', nullable: true })
  unlockedAt!: Date | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Achievement)
  @JoinColumn({ name: 'achievement_id' })
  achievement!: Achievement;
}
