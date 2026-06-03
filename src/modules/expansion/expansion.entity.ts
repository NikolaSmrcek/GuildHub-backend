import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Patch } from '../patch/patch.entity';

@Entity('expansions')
export class Expansion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'short_name', length: 50, nullable: true })
  shortName!: string;

  @Column({ name: 'release_date', type: 'date', nullable: true })
  releaseDate!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Patch, (patch) => patch.expansion)
  patches!: Patch[];
}
