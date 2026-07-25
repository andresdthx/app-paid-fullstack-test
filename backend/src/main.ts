import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResultInterceptor } from './infrastructure/config/result.interceptor';
import { validateEnvironment } from './infrastructure/config/env.validation';
import { DEFAULT_PORT, DEFAULT_FRONTEND_URL, API_PREFIX, CORS_METHODS, CORS_HEADERS } from './constants';

async function bootstrap() {
  validateEnvironment();

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });
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

  app.useGlobalInterceptors(new ResultInterceptor());
  app.setGlobalPrefix(API_PREFIX);

  const port = process.env.PORT || DEFAULT_PORT;
  await app.listen(port);
  logger.log(`Server running on port ${port} | env: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
