import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Guild } from './guild.entity';
import { GuildRank } from './guild-rank.entity';
import { Character } from '../character/character.entity';

@Entity('guild_members')
@Unique(['guildId', 'characterId'])
export class GuildMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'guild_id' })
  guildId!: string;

  @ManyToOne(() => Guild, (guild) => guild.members)
  @JoinColumn({ name: 'guild_id' })
  guild!: Guild;

  @Column({ name: 'character_id' })
  characterId!: string;

  @ManyToOne(() => Character, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'character_id' })
  character!: Character;

  @Column({ name: 'rank_id' })
  rankId!: string;

  @ManyToOne(() => GuildRank, (rank) => rank.members)
  @JoinColumn({ name: 'rank_id' })
  rank!: GuildRank;

  @Column({ name: 'loyalty_override', type: 'integer', nullable: true })
  loyaltyOverride!: number | null;

  @Column({ name: 'is_on_raid_roster', type: 'boolean', default: false })
  isOnRaidRoster!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
