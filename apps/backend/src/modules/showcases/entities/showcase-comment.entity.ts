import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { User } from '../../../entities/user.entity';
import { Showcase } from './showcase.entity';

@Entity('showcase_comments')
export class ShowcaseComment extends BaseEntity {
  @Column({ name: 'showcase_id' })
  @Index()
  showcaseId: string;

  @ManyToOne(() => Showcase, (showcase) => showcase.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'showcase_id' })
  showcase: Showcase;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId?: string;

  @ManyToOne(() => ShowcaseComment, (comment) => comment.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: ShowcaseComment;

  @OneToMany(() => ShowcaseComment, (comment) => comment.parent)
  children: ShowcaseComment[];
}
