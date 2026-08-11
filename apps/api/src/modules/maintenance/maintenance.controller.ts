import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  ParseUUIDPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Maintenance')
@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @ApiOperation({ summary: 'List maintenance records' })
  findAll(
    @Query() query: PaginationDto & { vehicleId?: string; type?: string; status?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.maintenanceService.findAll(query, user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get maintenance record details' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.maintenanceService.findOne(id, user.companyId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create new maintenance record' })
  create(@Body() dto: CreateMaintenanceDto, @CurrentUser() user: JwtPayload) {
    return this.maintenanceService.create(dto, user.companyId, user.sub);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update maintenance record' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateMaintenanceDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.maintenanceService.update(id, dto, user.companyId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete maintenance record' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.maintenanceService.remove(id, user.companyId);
  }
}
