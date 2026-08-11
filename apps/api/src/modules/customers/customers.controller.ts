import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  ParseUUIDPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers' })
  findAll(
    @Query() query: PaginationDto & { search?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.customersService.findAll(query, user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer details' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.customersService.findOne(id, user.companyId);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get customer outstanding balance and credit availability' })
  getBalance(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.customersService.getBalance(id, user.companyId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Create new customer' })
  create(@Body() dto: CreateCustomerDto, @CurrentUser() user: JwtPayload) {
    return this.customersService.create(dto, user.companyId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Update customer' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateCustomerDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.customersService.update(id, dto, user.companyId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete customer' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.customersService.remove(id, user.companyId);
  }
}
