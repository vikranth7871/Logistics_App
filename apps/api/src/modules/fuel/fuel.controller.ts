import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  ParseUUIDPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FuelService } from './fuel.service';
import { CreateFuelEntryDto } from './dto/create-fuel-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Fuel')
@Controller('fuel')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Get()
  @ApiOperation({ summary: 'List fuel entries' })
  findAll(
    @Query() query: PaginationDto & { vehicleId?: string; tripId?: string; driverId?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    // Drivers are auto-scoped to only their own fuel entries
    const scopedQuery = user.role === 'driver' && user.driverId
      ? { ...query, driverId: user.driverId }
      : query;
    return this.fuelService.findAll(scopedQuery, user.companyId);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Fuel analytics summary' })
  getAnalytics(@CurrentUser() user: JwtPayload, @Query('vehicleId') vehicleId?: string) {
    return this.fuelService.getAnalytics(user.companyId, vehicleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fuel entry details' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.fuelService.findOne(id, user.companyId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.DRIVER)
  @ApiOperation({ summary: 'Record new fuel entry' })
  create(@Body() dto: CreateFuelEntryDto, @CurrentUser() user: JwtPayload) {
    return this.fuelService.create(dto, user.companyId, user.sub);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Update fuel entry' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateFuelEntryDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fuelService.update(id, dto, user.companyId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete fuel entry' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.fuelService.remove(id, user.companyId);
  }
}
