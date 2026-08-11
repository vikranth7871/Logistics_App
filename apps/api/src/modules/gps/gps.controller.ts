import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GpsService } from './gps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/decorators/roles.decorator';

@ApiTags('GPS')
@Controller('gps')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class GpsController {
  constructor(private readonly gpsService: GpsService) {}

  @Get('vehicles')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Get live locations of all vehicles' })
  getAllLocations() {
    return this.gpsService.getAllVehicleLocations();
  }

  @Get('vehicles/:deviceId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Get live location for a specific vehicle' })
  getLocation(@Param('deviceId') deviceId: string) {
    return this.gpsService.getVehicleLocation(deviceId);
  }

  @Get('vehicles/:deviceId/history')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get location history for a vehicle' })
  getHistory(
    @Param('deviceId') deviceId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.gpsService.getVehicleHistory(
      deviceId,
      new Date(from),
      new Date(to),
    );
  }

  @Get('health')
  @ApiOperation({ summary: 'Check GPS provider connectivity' })
  healthCheck() {
    return this.gpsService.healthCheck();
  }
}
