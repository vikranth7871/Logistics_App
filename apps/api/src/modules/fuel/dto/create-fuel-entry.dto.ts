import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsEnum, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMode } from '../entities/fuel-entry.entity';

export class CreateFuelEntryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiProperty({ example: '2026-08-10' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'HP Petrol Pump, Ambattur' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 120.5 })
  @IsNumber()
  @IsPositive()
  fuelQuantityLiters: number;

  @ApiProperty({ example: 94.5 })
  @IsNumber()
  @IsPositive()
  pricePerLiter: number;

  @ApiProperty({ example: 11387.25 })
  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @ApiPropertyOptional({ example: 45200 })
  @IsOptional()
  @IsNumber()
  odometerReading?: number;

  @ApiPropertyOptional({ enum: PaymentMode, default: PaymentMode.CASH })
  @IsOptional()
  @IsEnum(PaymentMode)
  paymentMode?: PaymentMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  billNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
