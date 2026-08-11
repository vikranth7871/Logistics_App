import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { Invoice } from './entities/invoice.entity';
import { Customer } from '../customers/entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Customer])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService, TypeOrmModule],
})
export class BillingModule {}
