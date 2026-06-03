import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patch } from './patch.entity';
import { PatchRepository } from './patch.repository';
import { PatchService } from './patch.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Patch])],
  providers: [PatchRepository, PatchService],
  exports: [PatchService, PatchRepository],
})
export class PatchModule {}
