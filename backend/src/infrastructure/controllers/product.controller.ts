import { Controller, Get } from '@nestjs/common';
import { GetProductsUseCase } from '../../application/use-cases';

@Controller('products')
export class ProductController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  @Get()
  async getProducts() {
    return this.getProductsUseCase.execute();
  }
}
