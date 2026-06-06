import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { RaidbotsReport } from './raidbots-report.entity';
import { Item } from '../item/item.entity';

@Entity('raidbots_report_items')
export class RaidbotsReportItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'report_id' })
  reportId!: string;

  @ManyToOne(() => RaidbotsReport, (report) => report.reportItems)
  @JoinColumn({ name: 'report_id' })
  report!: RaidbotsReport;

  @Column({ name: 'item_id' })
  itemId!: string;

  @OneToOne(() => Item, (item) => item.raidbotsReportItem)
  @JoinColumn({ name: 'item_id' })
  item!: Item;

  @Column({ name: 'item_name', length: 255 })
  itemName!: string;

  @Column({ name: 'player_dps_mean', type: 'double precision', default: 0 })
  playerDpsMean!: number;

  @Column({ name: 'upgrade_dps_mean', type: 'double precision', default: 0 })
  upgradeDpsMean!: number;

  @Column({ name: 'dps_improvement', type: 'double precision', default: 0 })
  dpsImprovement!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
