import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({ origin: ['http://localhost:4173', 'http://127.0.0.1:4173'] });

  // ── Swagger / OpenAPI ─────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('GuildHub API')
    .setDescription('GuildHub backend — loot council, content catalog, recommendations')
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(config.port, '0.0.0.0');

  console.log(`Server listening on http://0.0.0.0:${config.port}`);
  console.log(`Swagger UI: http://0.0.0.0:${config.port}/api/docs`);
}

bootstrap();
