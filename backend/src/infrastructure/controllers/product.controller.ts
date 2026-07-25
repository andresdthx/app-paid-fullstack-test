import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { GetProductsUseCase } from '../../application/use-cases';
import { isFailure } from '../../domain/value-objects';
import { mapErrorToHttp } from '../config/error-mapper';

@Controller('products')
export class ProductController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  @Get()
  async getProducts() {
    const result = await this.getProductsUseCase.execute();
    if (isFailure(result)) {
      const { status, message } = mapErrorToHttp(result.error);
      throw new HttpException(message, status);
    }
    return result.value.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl,
    }));
  }
}
