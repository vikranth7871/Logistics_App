import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuelController } from './fuel.controller';
import { FuelService } from './fuel.service';
import { FuelEntry } from './entities/fuel-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FuelEntry])],
  controllers: [FuelController],
  providers: [FuelService],
  exports: [FuelService, TypeOrmModule],
})
export class FuelModule {}
