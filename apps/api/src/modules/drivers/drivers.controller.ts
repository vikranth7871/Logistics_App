import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  ParseUUIDPipe, UseGuards, UseInterceptors, UploadedFile,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverListQueryDto } from './dto/driver-list-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';

@ApiTags('Drivers')
@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'List all drivers with filters and pagination' })
  findAll(@Query() query: DriverListQueryDto, @CurrentUser() user: JwtPayload) {
    return this.driversService.findAll(query, user.companyId);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get drivers available for trip assignment' })
  getAvailable(@CurrentUser() user: JwtPayload) {
    return this.driversService.getAvailableDrivers(user.companyId);
  }

  @Get('license-expiring')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Drivers with licenses expiring soon' })
  getLicenseExpiring(@CurrentUser() user: JwtPayload, @Query('days') days: number) {
    return this.driversService.getLicenseExpiringDrivers(user.companyId, days || 60);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get driver detail' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.driversService.findOne(id, user.companyId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new driver' })
  create(@Body() dto: CreateDriverDto, @CurrentUser() user: JwtPayload) {
    return this.driversService.create(dto, user.companyId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update driver details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDriverDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.driversService.update(id, dto, user.companyId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a driver' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.driversService.remove(id, user.companyId);
  }

  @Post(':id/assign-vehicle')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Assign a vehicle to a driver' })
  assignVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('vehicleId') vehicleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.driversService.assignVehicle(id, vehicleId, user.companyId);
  }

  @Post(':id/photo')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload driver profile photo' })
  uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.driversService.uploadPhoto(id, file, user.companyId);
  }
}
