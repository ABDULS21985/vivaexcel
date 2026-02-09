import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('testimonies')
export class Testimony extends BaseEntity {
    @Column({ type: 'text' })
    quote: string;

    @Column()
    author: string;

    @Column()
    position: string;

    @Column()
    company: string;

    @Column({ type: 'int', default: 5 })
    rating: number;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ default: true })
    isVerified: boolean;

    @Column({ default: true })
    isActive: boolean;
}
