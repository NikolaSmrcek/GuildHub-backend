import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raid } from './raid.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Raid])],
  exports: [TypeOrmModule],
})
export class RaidModule {}
