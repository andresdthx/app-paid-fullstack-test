import { Controller, Post, Get, Param, Body, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { CreateCustomerUseCase } from '../../application/use-cases';
import { CustomerRepositoryPort, CUSTOMER_REPOSITORY_PORT } from '../../domain/ports';
import { CreateCustomerDto } from '../dto/create-customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    @Inject(CUSTOMER_REPOSITORY_PORT)
    private readonly customerRepo: CustomerRepositoryPort,
  ) {}

  @Post()
  async createCustomer(@Body() dto: CreateCustomerDto) {
    return this.createCustomerUseCase.execute(dto);
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
