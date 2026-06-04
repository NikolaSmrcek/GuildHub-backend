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
import { Season } from '../season/season.entity';

@Entity('patches')
export class Patch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'expansion_id' })
  expansionId!: string;

  @ManyToOne(() => Expansion, (expansion) => expansion.patches)
  @JoinColumn({ name: 'expansion_id' })
  expansion!: Expansion;

  @Column({ name: 'season_id', nullable: true })
  seasonId!: string;

  @ManyToOne(() => Season, (season) => season.patches)
  @JoinColumn({ name: 'season_id' })
  season!: Season;

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
