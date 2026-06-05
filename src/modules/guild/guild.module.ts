import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild } from './guild.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Guild])],
  exports: [TypeOrmModule],
})
export class GuildModule {}
