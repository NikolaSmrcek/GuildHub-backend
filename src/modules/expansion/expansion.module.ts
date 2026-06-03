import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expansion } from './expansion.entity';
import { ExpansionRepository } from './expansion.repository';
import { ExpansionService } from './expansion.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Expansion])],
  providers: [ExpansionRepository, ExpansionService],
  exports: [ExpansionService],
})
export class ExpansionModule {}
