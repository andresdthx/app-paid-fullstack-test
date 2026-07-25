import { Module } from '@nestjs/common';
import { HealthController } from './infrastructure/controllers/health.controller';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
