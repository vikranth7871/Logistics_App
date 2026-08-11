import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { TripStateService } from './trip-state.service';
import { Trip } from './entities/trip.entity';
import { Vehicle } from '../fleet/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Customer } from '../customers/entities/customer.entity';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Vehicle, Driver, Customer]),
    StorageModule,
    NotificationsModule,
  ],
  controllers: [TripsController],
  providers: [TripsService, TripStateService],
  exports: [TripsService, TripStateService, TypeOrmModule],
})
export class TripsModule {}
