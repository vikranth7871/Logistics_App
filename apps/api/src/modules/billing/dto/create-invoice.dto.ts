import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceLineItemDto {
  @ApiProperty({ example: 'Freight charges for Chennai to Coimbatore' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: '2026-08-10' })
  @IsDateString()
  invoiceDate: string;

  @ApiPropertyOptional({ example: '2026-09-09' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ type: [InvoiceLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems: InvoiceLineItemDto[];

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  gstRatePercent?: number;

  @ApiPropertyOptional({ example: 'Payment due within 30 days' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
