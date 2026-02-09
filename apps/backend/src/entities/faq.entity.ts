import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('faqs')
export class FAQ extends BaseEntity {
    @Column()
    question: string;

    @Column({ type: 'text' })
    answer: string;

    @Column({ default: 0 })
    order: number;

    @Column({ default: true })
    isActive: boolean;
}
