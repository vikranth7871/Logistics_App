import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { Expense } from './entities/expense.entity';
import { Vehicle } from '../fleet/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Trip } from '../trips/entities/trip.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Vehicle, Driver, Trip]), StorageModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService, TypeOrmModule],
})
export class ExpensesModule {}
