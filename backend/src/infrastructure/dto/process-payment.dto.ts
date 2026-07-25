import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveryDataDto {
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
  @IsNotEmpty()
  postalCode: string;
}

export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  cardToken: string;

  @IsString()
  @IsNotEmpty()
  acceptanceToken: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @ValidateNested()
  @Type(() => DeliveryDataDto)
  deliveryData: DeliveryDataDto;
}
