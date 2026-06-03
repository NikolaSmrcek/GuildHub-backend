import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LootModule } from './modules/loot/loot.module';
import { ExpansionModule } from './modules/expansion/expansion.module';
import { PatchModule } from './modules/patch/patch.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'guildhub',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // use migrations
    }),
    LootModule,
    ExpansionModule,
    PatchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
