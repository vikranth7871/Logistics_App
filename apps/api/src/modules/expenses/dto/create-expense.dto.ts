import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsEnum, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory, ExpensePaymentMode } from '../entities/expense.entity';

export class CreateExpenseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiProperty({ enum: ExpenseCategory, example: ExpenseCategory.TOLL })
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @ApiProperty({ example: 450 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: '2026-08-10' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ExpensePaymentMode, default: ExpensePaymentMode.CASH })
  @IsOptional()
  @IsEnum(ExpensePaymentMode)
  paymentMode?: ExpensePaymentMode;
}
