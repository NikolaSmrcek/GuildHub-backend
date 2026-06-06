import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Character } from '../character/character.entity';
import { RaidbotsReportItem } from './raidbots-report-item.entity';

@Entity('raidbots_reports')
export class RaidbotsReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'report_url', length: 512 })
  reportUrl!: string;

  @Column({ name: 'character_id' })
  characterId!: string;

  @ManyToOne(() => Character, (character) => character.raidbotsReports)
  @JoinColumn({ name: 'character_id' })
  character!: Character;

  @Column({ name: 'player_name', length: 255 })
  playerName!: string;

  @Column({ name: 'player_class', length: 50, nullable: true })
  playerClass!: string;

  @Column({ name: 'player_spec', length: 50, nullable: true })
  playerSpec!: string;

  @Column({ name: 'player_dps_mean', type: 'double precision', default: 0 })
  playerDpsMean!: number;

  @Column({ name: 'is_valid', type: 'boolean', default: true })
  isValid!: boolean;

  @Column({ name: 'raw_data', type: 'jsonb', nullable: true })
  rawData!: object;

  @OneToMany(() => RaidbotsReportItem, (reportItem) => reportItem.report)
  reportItems!: RaidbotsReportItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
