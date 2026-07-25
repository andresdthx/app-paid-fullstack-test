import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

// Config
import { PrismaService } from './infrastructure/config/prisma.service';
import { RequestLoggerMiddleware } from './infrastructure/config/request-logger.middleware';
import { AppLogger, APP_LOGGER } from './infrastructure/config/app-logger.service';

// Use Cases
import {
  GetProductsUseCase,
  CreateTransactionUseCase,
  ProcessPaymentUseCase,
  CreateCustomerUseCase,
  CreateDeliveryUseCase,
} from './application/use-cases';

// Domain Ports (symbols)
import {
  PRODUCT_REPOSITORY_PORT,
  TRANSACTION_REPOSITORY_PORT,
  CUSTOMER_REPOSITORY_PORT,
  DELIVERY_REPOSITORY_PORT,
  PAYMENT_GATEWAY_PORT,
  INTEGRITY_SERVICE_PORT,
} from './domain/ports';

// Adapters
import { PrismaProductRepository } from './infrastructure/adapters/prisma-product.repository';
import { PrismaTransactionRepository } from './infrastructure/adapters/prisma-transaction.repository';
import { PrismaCustomerRepository } from './infrastructure/adapters/prisma-customer.repository';
import { PrismaDeliveryRepository } from './infrastructure/adapters/prisma-delivery.repository';
import { PayGatewayAdapter } from './infrastructure/adapters/pay-gateway-payment.adapter';

// Domain Services
import { IntegrityService } from './domain/services';

// Controllers
import { HealthController } from './infrastructure/controllers/health.controller';
import { ProductController } from './infrastructure/controllers/product.controller';
import { TransactionController } from './infrastructure/controllers/transaction.controller';
import { CustomerController } from './infrastructure/controllers/customer.controller';
import { DeliveryController } from './infrastructure/controllers/delivery.controller';

@Module({
  imports: [HttpModule],
  controllers: [
    HealthController,
    ProductController,
    TransactionController,
    CustomerController,
    DeliveryController,
  ],
  providers: [
    PrismaService,
    // Logger
    { provide: APP_LOGGER, useFactory: () => new AppLogger('PaymentCheckout') },
    // Repository adapters bound to ports
    { provide: PRODUCT_REPOSITORY_PORT, useClass: PrismaProductRepository },
    { provide: TRANSACTION_REPOSITORY_PORT, useClass: PrismaTransactionRepository },
    { provide: CUSTOMER_REPOSITORY_PORT, useClass: PrismaCustomerRepository },
    { provide: DELIVERY_REPOSITORY_PORT, useClass: PrismaDeliveryRepository },
    // External service adapters
    { provide: PAYMENT_GATEWAY_PORT, useClass: PayGatewayAdapter },
    // Domain services
    {
      provide: INTEGRITY_SERVICE_PORT,
      useFactory: () => new IntegrityService(process.env.PAYMENT_GATEWAY_INTEGRITY_KEY || ''),
    },
    // Use Cases
    GetProductsUseCase,
    CreateTransactionUseCase,
    ProcessPaymentUseCase,
    CreateCustomerUseCase,
    CreateDeliveryUseCase,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
