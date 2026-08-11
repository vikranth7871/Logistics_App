import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FleetService } from './fleet.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleListQueryDto } from './dto/vehicle-list-query.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';

@ApiTags('Fleet')
@Controller('fleet')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  // ── VEHICLES ──────────────────────────────────────────────────

  @Get('vehicles')
  @ApiOperation({ summary: 'List all vehicles with filters and pagination' })
  findAll(@Query() query: VehicleListQueryDto, @CurrentUser() user: JwtPayload) {
    return this.fleetService.findAll(query, user.companyId);
  }

  @Post('vehicles')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new vehicle' })
  create(@Body() dto: CreateVehicleDto, @CurrentUser() user: JwtPayload) {
    return this.fleetService.create(dto, user.companyId, user.sub);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Fleet KPI summary for dashboard' })
  getFleetSummary(@CurrentUser() user: JwtPayload) {
    return this.fleetService.getFleetSummary(user.companyId);
  }

  @Get('documents/expiring')
  @ApiOperation({ summary: 'Documents expiring within N days (default 30)' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getExpiringDocuments(
    @Query('days') days: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fleetService.getExpiringDocuments(user.companyId, days || 30);
  }

  @Get('vehicles/:id')
  @ApiOperation({ summary: 'Get vehicle detail with all documents' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fleetService.findOne(id, user.companyId);
  }

  @Put('vehicles/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update vehicle details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fleetService.update(id, dto, user.companyId);
  }

  @Delete('vehicles/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a vehicle (admin only)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fleetService.remove(id, user.companyId);
  }

  // ── DOCUMENTS ─────────────────────────────────────────────────

  @Get('vehicles/:id/documents')
  @ApiOperation({ summary: 'Get all documents for a vehicle' })
  getDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fleetService.getDocuments(id, user.companyId);
  }

  @Post('vehicles/:id/documents')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document for a vehicle' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string', enum: ['insurance', 'permit', 'fitness', 'rc', 'road_tax', 'pollution', 'other'] },
        expiryDate: { type: 'string', format: 'date' },
        issueDate: { type: 'string', format: 'date' },
        documentNumber: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['file', 'type'],
    },
  })
  uploadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fleetService.uploadDocument(id, file, dto, user.companyId, user.sub);
  }

  @Delete('vehicles/:id/documents/:docId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a vehicle document' })
  deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fleetService.deleteDocument(id, docId, user.companyId);
  }
}
