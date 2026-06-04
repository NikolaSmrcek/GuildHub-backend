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
import { Boss } from '../boss/boss.entity';
import { Item } from '../item/item.entity';

export enum DifficultyName {
  LFR = 'LFR',
  NORMAL = 'Normal',
  HEROIC = 'Heroic',
  MYTHIC = 'Mythic',
}

@Entity('difficulties')
export class Difficulty {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'boss_id' })
  bossId!: string;

  @ManyToOne(() => Boss, (boss) => boss.difficulties)
  @JoinColumn({ name: 'boss_id' })
  boss!: Boss;

  @Column({
    type: 'enum',
    enum: DifficultyName,
  })
  difficulty!: DifficultyName;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Item, (item) => item.difficulty)
  items!: Item[];
}
