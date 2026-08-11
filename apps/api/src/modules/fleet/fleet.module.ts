import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FleetController } from './fleet.controller';
import { FleetService } from './fleet.service';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleDocument } from './entities/vehicle-document.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, VehicleDocument]),
    StorageModule,
  ],
  controllers: [FleetController],
  providers: [FleetService],
  exports: [FleetService, TypeOrmModule],
})
export class FleetModule {}
