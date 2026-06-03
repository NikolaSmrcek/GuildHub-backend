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

  @Column({ length: 50, nullable: true })
  shortName!: string;

  @Column({ type: 'date', nullable: true })
  releaseDate!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Patch, (patch) => patch.expansion)
  patches!: Patch[];
}
