import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceRecord } from './entities/maintenance-record.entity';
import { Vehicle } from '../fleet/entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceRecord, Vehicle])],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService, TypeOrmModule],
})
export class MaintenanceModule {}
