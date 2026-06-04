import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Boss } from './boss.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Boss])],
  exports: [TypeOrmModule],
})
export class BossModule {}
