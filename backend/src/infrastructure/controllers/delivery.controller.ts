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
import { CreateDeliveryUseCase } from '../../application/use-cases';
import { DeliveryRepositoryPort, DELIVERY_REPOSITORY_PORT } from '../../domain/ports';
import { isFailure } from '../../domain/value-objects';
import { CreateDeliveryDto } from '../dto/create-delivery.dto';
import { mapErrorToHttp } from '../config/error-mapper';

@Controller('deliveries')
export class DeliveryController {
  constructor(
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
    @Inject(DELIVERY_REPOSITORY_PORT)
    private readonly deliveryRepo: DeliveryRepositoryPort,
  ) {}

  @Post()
  async createDelivery(@Body() dto: CreateDeliveryDto) {
    const result = await this.createDeliveryUseCase.execute(dto);
    if (isFailure(result)) {
      const { status, message } = mapErrorToHttp(result.error);
      throw new HttpException(message, status);
    }
    return result.value;
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
