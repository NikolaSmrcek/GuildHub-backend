import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Expansion } from '../expansion/expansion.entity';

@Entity('patches')
export class Patch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'expansion_id' })
  expansionId!: string;

  @ManyToOne(() => Expansion, (expansion) => expansion.patches)
  @JoinColumn({ name: 'expansion_id' })
  expansion!: Expansion;

  @Column({ name: 'patch_number', length: 20 })
  patchNumber!: string;

  @Column({ length: 255, nullable: true })
  name!: string;

  @Column({ name: 'release_date', type: 'date', nullable: true })
  releaseDate!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
