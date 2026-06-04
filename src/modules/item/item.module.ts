import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './item.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  exports: [TypeOrmModule],
})
export class ItemModule {}
