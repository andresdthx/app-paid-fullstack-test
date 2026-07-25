import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

const REQUIRED_VARS = [
  'DATABASE_URL',
  'PAYMENT_GATEWAY_API_URL',
  'PAYMENT_GATEWAY_PUBLIC_KEY',
  'PAYMENT_GATEWAY_PRIVATE_KEY',
  'PAYMENT_GATEWAY_INTEGRITY_KEY',
];

const OPTIONAL_VARS = [
  'PORT',
  'FRONTEND_URL',
  'BASE_FEE',
  'DELIVERY_FEE',
];

export function validateEnvironment(): void {
  const missing: string[] = [];

  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(message);
    throw new Error(message);
  }

  for (const varName of OPTIONAL_VARS) {
    if (!process.env[varName]) {
      logger.warn(`Optional env var ${varName} not set, using default`);
    }
  }

  logger.log('Environment validation passed');
}
