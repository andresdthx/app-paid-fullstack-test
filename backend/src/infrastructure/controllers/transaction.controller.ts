import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { CreateTransactionUseCase, ProcessPaymentUseCase } from '../../application/use-cases';
import { TransactionRepositoryPort, TRANSACTION_REPOSITORY_PORT } from '../../domain/ports';
import { isFailure } from '../../domain/value-objects';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { ProcessPaymentDto } from '../dto/process-payment.dto';
import { mapErrorToHttp } from '../config/error-mapper';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    @Inject(TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepo: TransactionRepositoryPort,
  ) {}

  @Post()
  async createTransaction(@Body() dto: CreateTransactionDto) {
    const result = await this.createTransactionUseCase.execute({
      productId: dto.productId,
      quantity: dto.quantity,
      customerEmail: dto.customerEmail,
      baseFee: dto.baseFee,
      deliveryFee: dto.deliveryFee,
    });

    if (isFailure(result)) {
      const { status, message } = mapErrorToHttp(result.error);
      throw new HttpException(message, status);
    }

    return result.value;
  }

  @Get(':id')
  async getTransaction(@Param('id') id: string) {
    const transaction = await this.transactionRepo.findById(id);
    if (!transaction) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }
    return transaction;
  }

  @Post(':id/process')
  async processPayment(@Param('id') id: string, @Body() dto: ProcessPaymentDto) {
    const result = await this.processPaymentUseCase.execute({
      transactionId: id,
      cardToken: dto.cardToken,
      acceptanceToken: dto.acceptanceToken,
      customerEmail: dto.customerEmail,
      deliveryData: dto.deliveryData,
    });

    if (isFailure(result)) {
      const { status, message } = mapErrorToHttp(result.error);
      throw new HttpException(message, status);
    }

    return result.value;
  }
}
