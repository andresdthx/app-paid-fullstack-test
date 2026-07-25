import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Postal code must be exactly 6 digits' })
  postalCode: string;
}
