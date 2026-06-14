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
import { Account } from '../account/account.entity';
import { Guild } from '../guild/guild.entity';
import { RaidbotsReport } from '../raidbots/raidbots-report.entity';
import { Race } from './race.entity';
import { Spec } from './spec.entity';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 50 })
  realm!: string;

  @Column({ length: 50 })
  faction!: string;

  // ── Race (FK → races.id) ──────────────────────────────────
  @Column({ name: 'race_id', nullable: true })
  raceId!: string;

  @ManyToOne(() => Race, { nullable: true })
  @JoinColumn({ name: 'race_id' })
  race?: Race;

  // ── Player Class (FK → class_armor.class_name) ────────────
  @Column({ length: 50, nullable: true, name: 'player_class' })
  playerClass!: string;

  // ── Spec (FK → specs.id) ──────────────────────────────────
  @Column({ name: 'spec_id', nullable: true })
  specId!: string;

  @ManyToOne(() => Spec, { nullable: true })
  @JoinColumn({ name: 'spec_id' })
  spec?: Spec;

  @Column({ name: 'item_level', type: 'integer', nullable: true })
  itemLevel!: number;

  @Column({ name: 'account_id' })
  accountId!: string;

  @ManyToOne(() => Account, (account) => account.characters)
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @Column({ name: 'guild_id', nullable: true })
  guildId!: string;

  @ManyToOne(() => Guild, (guild) => guild.characters)
  @JoinColumn({ name: 'guild_id' })
  guild!: Guild;

  @OneToMany(() => RaidbotsReport, (report) => report.character)
  raidbotsReports!: RaidbotsReport[];

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
