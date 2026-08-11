import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceType, MaintenanceStatus } from '../entities/maintenance-record.entity';

export class CreateMaintenanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty({ enum: MaintenanceType })
  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @ApiPropertyOptional({ enum: MaintenanceStatus, default: MaintenanceStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiProperty({ example: '2026-08-15' })
  @IsDateString()
  serviceDate: string;

  @ApiPropertyOptional({ example: 48500 })
  @IsOptional()
  @IsNumber()
  odometerReading?: number;

  @ApiPropertyOptional({ example: 12500 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  cost?: number;

  @ApiPropertyOptional({ example: 'TVS Automobile Solutions' })
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional({ example: 'INV-SERVICE-9921' })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional({ example: 'Engine oil change, filter replacement, brake pad adjustment' })
  @IsOptional()
  @IsString()
  description?: string;
}
