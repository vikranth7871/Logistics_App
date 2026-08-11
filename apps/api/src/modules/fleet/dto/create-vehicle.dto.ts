import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
  Length,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FuelType } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @ApiProperty({ example: 'TN01AB1234' })
  @IsString()
  @IsNotEmpty()
  @Length(5, 20)
  registrationNumber: string;

  @ApiPropertyOptional({ example: 'Tata' })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ example: 'Prima 5530.S' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 2021 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1990)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @ApiPropertyOptional({ example: 20.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  capacityTons?: number;

  @ApiPropertyOptional({ enum: FuelType, default: FuelType.DIESEL })
  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @ApiPropertyOptional({ example: 'EN123456' })
  @IsOptional()
  @IsString()
  engineNumber?: string;

  @ApiPropertyOptional({ example: 'CH789012' })
  @IsOptional()
  @IsString()
  chassisNumber?: string;

  @ApiPropertyOptional({ example: 'White' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
