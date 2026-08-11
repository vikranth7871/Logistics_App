import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';

export enum DriverStatus {
  ACTIVE = 'active',
  ON_TRIP = 'on_trip',
  ON_LEAVE = 'on_leave',
  INACTIVE = 'inactive',
}

export enum LicenseType {
  LMV = 'LMV',
  HMV = 'HMV',
  HTV = 'HTV',
  HAZMAT = 'HAZMAT',
}

@Entity('drivers')
export class Driver extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'license_number', nullable: true })
  licenseNumber: string;

  @Column({ name: 'license_expiry', type: 'date', nullable: true })
  licenseExpiry: Date;

  @Column({
    name: 'license_type',
    type: 'enum',
    enum: LicenseType,
    nullable: true,
  })
  licenseType: LicenseType;

  @Column({ type: 'enum', enum: DriverStatus, default: DriverStatus.ACTIVE })
  status: DriverStatus;

  @Column({ name: 'joining_date', type: 'date', nullable: true })
  joiningDate: Date;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string;

  @Column({ name: 'emergency_contact_name', nullable: true })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone: string;

  @Column({ name: 'assigned_vehicle_id', type: 'uuid', nullable: true })
  assignedVehicleId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;
}
