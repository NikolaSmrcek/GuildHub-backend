import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Difficulty } from './difficulty.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Difficulty])],
  exports: [TypeOrmModule],
})
export class DifficultyModule {}
