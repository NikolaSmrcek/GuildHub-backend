import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './season.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Season])],
  exports: [TypeOrmModule],
})
export class SeasonModule {}
