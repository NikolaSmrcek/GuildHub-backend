import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild } from './guild.entity';
import { GuildRank } from './guild-rank.entity';
import { GuildMember } from './guild-member.entity';
import { GuildService } from './guild.service';
import { GuildController } from './guild.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Guild, GuildRank, GuildMember])],
  controllers: [GuildController],
  providers: [GuildService],
  exports: [TypeOrmModule, GuildService],
})
export class GuildModule {}
