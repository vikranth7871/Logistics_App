import { PartialType } from '@nestjs/swagger';
import { CreateDriverDto } from './create-driver.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DriverStatus } from '../entities/driver.entity';

export class UpdateDriverDto extends PartialType(CreateDriverDto) {
  @ApiPropertyOptional({ enum: DriverStatus })
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}
