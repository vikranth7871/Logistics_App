import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  ParseUUIDPipe, UseGuards, UseInterceptors, UploadedFile, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { TripsService } from './trips.service';
import { CreateTripDto, AssignTripDto, StartTripDto, CompleteTripDto, CancelTripDto } from './dto/trip.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Trips')
@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @ApiOperation({ summary: 'List all trips with filters' })
  findAll(
    @Query() query: PaginationDto & { status?: string; search?: string; vehicleId?: string; driverId?: string; customerId?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    // Drivers are auto-scoped to only trips assigned to them
    const scopedQuery = user.role === 'driver' && user.driverId
      ? { ...query, driverId: user.driverId }
      : query;
    return this.tripsService.findAll(scopedQuery, user.companyId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all in-progress trips' })
  getActive(@CurrentUser() user: JwtPayload) {
    return this.tripsService.getActiveTrips(user.companyId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Trips status summary for dashboard' })
  getSummary(@CurrentUser() user: JwtPayload) {
    return this.tripsService.getSummary(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip details by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.tripsService.findOne(id, user.companyId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER, UserRole.DRIVER)
  @ApiOperation({ summary: 'Update trip details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripsService.update(id, dto, user.companyId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Create a new trip (draft status)' })
  create(@Body() dto: CreateTripDto, @CurrentUser() user: JwtPayload) {
    return this.tripsService.create(dto, user.companyId, user.sub);
  }

  @Post(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Assign vehicle and driver to a trip' })
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTripDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripsService.assign(id, dto, user.companyId);
  }

  @Post(':id/start')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER, UserRole.DRIVER)
  @ApiOperation({ summary: 'Start a trip (vehicle/driver set to in_trip)' })
  start(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: StartTripDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripsService.start(id, dto, user.companyId);
  }

  @Post(':id/deliver')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER, UserRole.DRIVER)
  @ApiOperation({ summary: 'Mark trip as delivered' })
  deliver(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.tripsService.deliver(id, user.companyId);
  }

  @Post(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Complete a trip and release vehicle/driver' })
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteTripDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripsService.complete(id, dto, user.companyId);
  }

  @Post(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cancel a trip' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelTripDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripsService.cancel(id, dto, user.companyId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a trip' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.tripsService.remove(id, user.companyId);
  }

  @Post(':id/delivery-proof')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DRIVER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload proof of delivery' })
  uploadDeliveryProof(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripsService.uploadDeliveryProof(id, file, user.companyId);
  }
}
