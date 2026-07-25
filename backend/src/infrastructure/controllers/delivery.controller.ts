import { Controller, Post, Get, Param, Body, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { CreateDeliveryUseCase } from '../../application/use-cases';
import { DeliveryRepositoryPort, DELIVERY_REPOSITORY_PORT } from '../../domain/ports';
import { CreateDeliveryDto } from '../dto/create-delivery.dto';

@Controller('deliveries')
export class DeliveryController {
  constructor(
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
    @Inject(DELIVERY_REPOSITORY_PORT)
    private readonly deliveryRepo: DeliveryRepositoryPort,
  ) {}

  @Post()
  async createDelivery(@Body() dto: CreateDeliveryDto) {
    return this.createDeliveryUseCase.execute(dto);
  }

  @Get(':id')
  async getDelivery(@Param('id') id: string) {
    const delivery = await this.deliveryRepo.findById(id);
    if (!delivery) {
      throw new HttpException('Delivery not found', HttpStatus.NOT_FOUND);
    }
    return delivery;
  }
}
