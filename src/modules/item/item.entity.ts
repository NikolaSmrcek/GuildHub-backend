import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Difficulty } from '../difficulty/difficulty.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'difficulty_id' })
  difficultyId!: string;

  @ManyToOne(() => Difficulty, (difficulty) => difficulty.items)
  @JoinColumn({ name: 'difficulty_id' })
  difficulty!: Difficulty;

  @Column({ type: 'integer', nullable: true })
  ilvl!: number;

  @Column({ length: 100, nullable: true })
  slot!: string;

  @Column({ length: 100, nullable: true })
  class!: string;

  @Column({ length: 100, nullable: true, name: 'subclass' })
  subclass!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
