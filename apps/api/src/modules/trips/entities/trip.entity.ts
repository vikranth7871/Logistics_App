import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Vehicle } from '../../fleet/entities/vehicle.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum TripStatus {
  DRAFT = 'draft',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Valid state transitions enforced by TripStateService.
 * Keys = current status, Values = allowed next statuses.
 */
export const TRIP_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  [TripStatus.DRAFT]: [TripStatus.ASSIGNED, TripStatus.CANCELLED],
  [TripStatus.ASSIGNED]: [TripStatus.IN_PROGRESS, TripStatus.CANCELLED, TripStatus.DRAFT],
  [TripStatus.IN_PROGRESS]: [TripStatus.DELIVERED, TripStatus.CANCELLED],
  [TripStatus.DELIVERED]: [TripStatus.COMPLETED, TripStatus.CANCELLED],
  [TripStatus.COMPLETED]: [],
  [TripStatus.CANCELLED]: [],
};

@Entity('trips')
@Index(['tripNumber'], { unique: true })
export class Trip extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'trip_number', length: 30, unique: true })
  tripNumber: string;

  @Column({ name: 'vehicle_id', type: 'uuid', nullable: true })
  vehicleId: string;

  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'driver_id', type: 'uuid', nullable: true })
  driverId: string;

  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ length: 255 })
  origin: string;

  @Column({ length: 255 })
  destination: string;

  @Column({ type: 'enum', enum: TripStatus, default: TripStatus.DRAFT })
  status: TripStatus;

  @Column({ name: 'scheduled_start', type: 'timestamptz', nullable: true })
  scheduledStart: Date;

  @Column({ name: 'actual_start', type: 'timestamptz', nullable: true })
  actualStart: Date;

  @Column({ name: 'scheduled_end', type: 'timestamptz', nullable: true })
  scheduledEnd: Date;

  @Column({ name: 'actual_end', type: 'timestamptz', nullable: true })
  actualEnd: Date;

  @Column({ name: 'start_odometer', type: 'decimal', precision: 10, scale: 2, nullable: true })
  startOdometer: number;

  @Column({ name: 'end_odometer', type: 'decimal', precision: 10, scale: 2, nullable: true })
  endOdometer: number;

  @Column({ name: 'distance_km', type: 'decimal', precision: 8, scale: 2, nullable: true })
  distanceKm: number;

  @Column({ name: 'freight_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  freightAmount: number;

  @Column({ name: 'load_description', type: 'text', nullable: true })
  loadDescription: string;

  @Column({ name: 'load_weight_tons', type: 'decimal', precision: 8, scale: 2, nullable: true })
  loadWeightTons: number;

  @Column({ name: 'delivery_proof_url', type: 'text', nullable: true })
  deliveryProofUrl: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'cancelled_reason', type: 'text', nullable: true })
  cancelledReason: string;

  @Column({ name: 'pickup_confirmed_at', type: 'timestamptz', nullable: true })
  pickupConfirmedAt: Date;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date;
}
