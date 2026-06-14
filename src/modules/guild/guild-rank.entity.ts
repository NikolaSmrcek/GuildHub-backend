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
import { Guild } from './guild.entity';
import { GuildMember } from './guild-member.entity';

@Entity('guild_ranks')
export class GuildRank {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'guild_id' })
  guildId!: string;

  @ManyToOne(() => Guild, (guild) => guild.ranks)
  @JoinColumn({ name: 'guild_id' })
  guild!: Guild;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'integer', default: 50 })
  priority!: number;

  @Column({ name: 'default_loyalty', type: 'integer', default: 50 })
  defaultLoyalty!: number;

  @OneToMany(() => GuildMember, (member) => member.rank)
  members!: GuildMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
