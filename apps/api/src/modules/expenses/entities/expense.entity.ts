import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Vehicle } from '../../fleet/entities/vehicle.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Trip } from '../../trips/entities/trip.entity';

export enum ExpenseCategory {
  TOLL = 'toll',
  DRIVER_ALLOWANCE = 'driver_allowance',
  REPAIR = 'repair',
  TYRE_REPLACEMENT = 'tyre_replacement',
  SPARE_PARTS = 'spare_parts',
  LOADING_UNLOADING = 'loading_unloading',
  BROKERAGE = 'brokerage',
  RTO_FINE = 'rto_fine',
  WEIGHBRIDGE = 'weighbridge',
  ACCOMMODATION = 'accommodation',
  MISCELLANEOUS = 'miscellaneous',
}

export enum ExpensePaymentMode {
  CASH = 'cash',
  FASTAG = 'fastag',
  CARD = 'card',
  UPI = 'upi',
  BANK_TRANSFER = 'bank_transfer',
}

@Entity('expenses')
export class Expense extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'vehicle_id', type: 'uuid', nullable: true })
  vehicleId: string;

  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'trip_id', type: 'uuid', nullable: true })
  tripId: string;

  @ManyToOne(() => Trip, { nullable: true })
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @Column({ name: 'driver_id', type: 'uuid', nullable: true })
  driverId: string;

  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ type: 'enum', enum: ExpenseCategory })
  category: ExpenseCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'payment_mode',
    type: 'enum',
    enum: ExpensePaymentMode,
    default: ExpensePaymentMode.CASH,
  })
  paymentMode: ExpensePaymentMode;

  @Column({ name: 'receipt_url', type: 'text', nullable: true })
  receiptUrl: string;

  @Column({ name: 'recorded_by', type: 'uuid', nullable: true })
  recordedBy: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;
}
