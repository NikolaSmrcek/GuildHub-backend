import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Character } from '../character/character.entity';
import { GuildRank } from './guild-rank.entity';
import { GuildMember } from './guild-member.entity';

export interface LootConfig {
  sectionWeights: Record<string, number>;
}

@Entity('guilds')
export class Guild {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 50 })
  realm!: string;

  @Column({ length: 50 })
  faction!: string;

  @Column({ length: 20, name: 'guild_type', default: 'guild' })
  guildType!: string;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @Column({ name: 'loot_config', type: 'jsonb', nullable: true })
  lootConfig!: LootConfig | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Character, (character) => character.guild)
  characters!: Character[];

  @OneToMany(() => GuildRank, (rank) => rank.guild)
  ranks!: GuildRank[];

  @OneToMany(() => GuildMember, (member) => member.guild)
  members!: GuildMember[];
}
