import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Trip } from '../trips/entities/trip.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { FuelEntry } from '../fuel/entities/fuel-entry.entity';
import { Vehicle } from '../fleet/entities/vehicle.entity';
import { MaintenanceRecord } from '../maintenance/entities/maintenance-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, Expense, FuelEntry, Vehicle, MaintenanceRecord])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
