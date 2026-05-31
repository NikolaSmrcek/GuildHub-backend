import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LootModule } from './modules/loot/loot.module';

@Module({
  imports: [LootModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
