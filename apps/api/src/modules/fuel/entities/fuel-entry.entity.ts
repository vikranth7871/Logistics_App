import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Vehicle } from '../../fleet/entities/vehicle.entity';
import { Trip } from '../../trips/entities/trip.entity';

export enum PaymentMode {
  CASH = 'cash',
  CARD = 'card',
  FLEET_CARD = 'fleet_card',
  CREDIT = 'credit',
  UPI = 'upi',
}

@Entity('fuel_entries')
export class FuelEntry extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'trip_id', type: 'uuid', nullable: true })
  tripId: string;

  @ManyToOne(() => Trip, { nullable: true })
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'fuel_quantity_liters', type: 'decimal', precision: 8, scale: 2 })
  fuelQuantityLiters: number;

  @Column({ name: 'price_per_liter', type: 'decimal', precision: 8, scale: 2 })
  pricePerLiter: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'odometer_reading', type: 'decimal', precision: 10, scale: 2, nullable: true })
  odometerReading: number;

  @Column({ name: 'mileage_kmpl', type: 'decimal', precision: 6, scale: 2, nullable: true })
  mileageKmpl: number;  // calculated: distance since last fill / quantity

  @Column({ name: 'payment_mode', type: 'enum', enum: PaymentMode, default: PaymentMode.CASH })
  paymentMode: PaymentMode;

  @Column({ name: 'bill_number', nullable: true })
  billNumber: string;

  @Column({ name: 'receipt_url', type: 'text', nullable: true })
  receiptUrl: string;

  @Column({ name: 'recorded_by', type: 'uuid', nullable: true })
  recordedBy: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;
}
