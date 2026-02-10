import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { AchievementCategory, AchievementTier } from '../enums/gamification.enums';
import { UserAchievement } from './user-achievement.entity';

@Entity('achievements')
export class Achievement extends BaseEntity {
  @Column({ unique: true })
  @Index()
  slug!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: AchievementCategory })
  @Index()
  category!: AchievementCategory;

  @Column({ type: 'enum', enum: AchievementTier })
  tier!: AchievementTier;

  @Column({ name: 'icon_url', nullable: true })
  iconUrl!: string | null;

  @Column({ name: 'badge_color', length: 7, nullable: true })
  badgeColor!: string | null;

  @Column({ type: 'jsonb' })
  requirement!: Record<string, any>;

  @Column({ name: 'xp_reward', type: 'int' })
  xpReward!: number;

  @Column({ name: 'credit_reward', type: 'int', nullable: true })
  creditReward!: number | null;

  @Column({ name: 'is_secret', default: false })
  isSecret!: boolean;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @OneToMany(() => UserAchievement, (ua) => ua.achievement)
  userAchievements!: UserAchievement[];
}
