import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from './config.service';
import { ConfigModule } from './config.module';
import { DatabaseInitService } from './database-init.service';
import { ExpansionModule } from './modules/expansion/expansion.module';
import { PatchModule } from './modules/patch/patch.module';
import { SeasonModule } from './modules/season/season.module';
import { RaidModule } from './modules/raid/raid.module';
import { BossModule } from './modules/boss/boss.module';
import { DifficultyModule } from './modules/difficulty/difficulty.module';
import { ItemModule } from './modules/item/item.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.dbHost,
        port: config.dbPort,
        username: config.dbUser,
        password: config.dbPassword,
        database: config.dbName,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // use migrations
      }),
    }),
    ExpansionModule,
    PatchModule,
    SeasonModule,
    RaidModule,
    BossModule,
    DifficultyModule,
    ItemModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService, DatabaseInitService],
})
export class AppModule {}
