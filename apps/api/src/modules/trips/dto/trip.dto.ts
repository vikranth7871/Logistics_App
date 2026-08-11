import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTripDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiProperty({ example: 'Chennai Port' })
  @IsString()
  @IsNotEmpty()
  origin: string;

  @ApiProperty({ example: 'Coimbatore Industrial Estate' })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledEnd?: string;

  @ApiPropertyOptional({ example: 45000 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  freightAmount?: number;

  @ApiPropertyOptional({ example: 'Textile Machinery Parts' })
  @IsOptional()
  @IsString()
  loadDescription?: string;

  @ApiPropertyOptional({ example: 22.5 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  loadWeightTons?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignTripDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  driverId: string;
}

export class StartTripDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  odometer?: number;
}

export class CompleteTripDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  endOdometer?: number;
}

export class CancelTripDto {
  @ApiProperty({ example: 'Vehicle breakdown before start' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
