import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';

export enum VehicleStatus {
  ACTIVE = 'active',
  IN_TRIP = 'in_trip',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
}

export enum FuelType {
  DIESEL = 'diesel',
  PETROL = 'petrol',
  CNG = 'cng',
  ELECTRIC = 'electric',
}

@Entity('vehicles')
@Index(['registrationNumber'], { unique: true })
export class Vehicle extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'registration_number', length: 20, unique: true })
  registrationNumber: string;

  @Column({ nullable: true })
  make: string;

  @Column({ nullable: true })
  model: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ name: 'capacity_tons', type: 'decimal', precision: 8, scale: 2, nullable: true })
  capacityTons: number;

  @Column({ name: 'fuel_type', type: 'enum', enum: FuelType, default: FuelType.DIESEL })
  fuelType: FuelType;

  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.ACTIVE })
  status: VehicleStatus;

  @Column({ name: 'current_odometer', type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentOdometer: number;

  @Column({ name: 'engine_number', nullable: true })
  engineNumber: string;

  @Column({ name: 'chassis_number', nullable: true })
  chassisNumber: string;

  @Column({ name: 'color', nullable: true })
  color: string;

  @Column({ name: 'next_service_odometer', type: 'decimal', precision: 10, scale: 2, nullable: true })
  nextServiceOdometer: number;

  @Column({ name: 'next_service_date', type: 'date', nullable: true })
  nextServiceDate: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;
}
