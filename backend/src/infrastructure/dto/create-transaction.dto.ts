import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsNumber()
  @Min(0)
  baseFee: number;

  @IsNumber()
  @Min(0)
  deliveryFee: number;
}
