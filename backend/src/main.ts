import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DEFAULT_PORT, DEFAULT_FRONTEND_URL, API_PREFIX, CORS_METHODS, CORS_HEADERS } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
    methods: CORS_METHODS,
    allowedHeaders: CORS_HEADERS,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix(API_PREFIX);

  const port = process.env.PORT || DEFAULT_PORT;
  await app.listen(port);
  logger.log(`Server running on port ${port}`);
}

bootstrap();
