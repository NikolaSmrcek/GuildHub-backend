import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Race } from '../character/race.entity';
import { RaceClass } from '../character/race-class.entity';
import { ClassSpec } from '../character/class-spec.entity';
import { ClassArmor } from '../character/class-armor.entity';
import { ValidationService } from './validation.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Race, RaceClass, ClassSpec, ClassArmor])],
  providers: [ValidationService],
  exports: [ValidationService, TypeOrmModule],
})
export class ValidationModule {}
