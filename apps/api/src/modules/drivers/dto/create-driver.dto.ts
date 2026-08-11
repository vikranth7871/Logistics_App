import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsEmail,
  IsPhoneNumber, IsDateString, Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LicenseType } from '../entities/driver.entity';

export class CreateDriverDto {
  @ApiProperty({ example: 'Rajan S' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'rajan@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'TN0120200012345' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ example: '2028-05-30' })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @ApiPropertyOptional({ enum: LicenseType, example: LicenseType.HMV })
  @IsOptional()
  @IsEnum(LicenseType)
  licenseType?: LicenseType;

  @ApiPropertyOptional({ example: '2021-03-15' })
  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
