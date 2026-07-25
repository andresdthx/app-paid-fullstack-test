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
import { CreateCustomerUseCase } from '../../application/use-cases';
import { CustomerRepositoryPort, CUSTOMER_REPOSITORY_PORT } from '../../domain/ports';
import { isFailure } from '../../domain/value-objects';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { mapErrorToHttp } from '../config/error-mapper';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    @Inject(CUSTOMER_REPOSITORY_PORT)
    private readonly customerRepo: CustomerRepositoryPort,
  ) {}

  @Post()
  async createCustomer(@Body() dto: CreateCustomerDto) {
    const result = await this.createCustomerUseCase.execute(dto);
    if (isFailure(result)) {
      const { status, message } = mapErrorToHttp(result.error);
      throw new HttpException(message, status);
    }
    return result.value;
  }

  @Get(':id')
  async getCustomer(@Param('id') id: string) {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }
    return customer;
  }
}
