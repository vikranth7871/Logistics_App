import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  ParseUUIDPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Billing')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices' })
  findAll(
    @Query() query: PaginationDto & { customerId?: string; status?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.billingService.findAll(query, user.companyId);
  }

  @Get('outstanding')
  @ApiOperation({ summary: 'Get all unpaid / outstanding invoices' })
  getOutstanding(@CurrentUser() user: JwtPayload) {
    return this.billingService.getOutstanding(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice details' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.billingService.findOne(id, user.companyId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Create new invoice' })
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: JwtPayload) {
    return this.billingService.create(dto, user.companyId, user.sub);
  }

  @Post(':id/finalize')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Finalize and issue invoice' })
  finalize(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.billingService.finalize(id, user.companyId);
  }

  @Post(':id/payments')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Record payment received for invoice' })
  recordPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('amount') amount: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.billingService.recordPayment(id, amount, user.companyId);
  }
}
