import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { User } from '../../../entities/user.entity';
import { Showcase } from './showcase.entity';

@Entity('showcase_likes')
@Unique('UQ_showcase_like_user', ['showcaseId', 'userId'])
export class ShowcaseLike extends BaseEntity {
  @Column({ name: 'showcase_id' })
  @Index()
  showcaseId: string;

  @ManyToOne(() => Showcase, (showcase) => showcase.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'showcase_id' })
  showcase: Showcase;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
