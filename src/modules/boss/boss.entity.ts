import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Raid } from '../raid/raid.entity';
import { Difficulty } from '../difficulty/difficulty.entity';

@Entity('bosses')
export class Boss {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'raid_id' })
  raidId!: string;

  @ManyToOne(() => Raid, (raid) => raid.bosses)
  @JoinColumn({ name: 'raid_id' })
  raid!: Raid;

  @Column({ name: 'order', type: 'integer', nullable: true })
  order!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Difficulty, (difficulty) => difficulty.boss)
  difficulties!: Difficulty[];
}
