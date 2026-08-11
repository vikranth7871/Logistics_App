import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Vehicle } from '../../fleet/entities/vehicle.entity';

export enum MaintenanceType {
  ROUTINE_SERVICING = 'servicing',
  REPAIR = 'repair',
  TYRE_REPLACEMENT = 'tyre_replacement',
  INSPECTION = 'inspection',
  BREAKDOWN = 'breakdown',
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('maintenance_records')
export class MaintenanceRecord extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'enum', enum: MaintenanceType, default: MaintenanceType.ROUTINE_SERVICING })
  type: MaintenanceType;

  @Column({ type: 'enum', enum: MaintenanceStatus, default: MaintenanceStatus.SCHEDULED })
  status: MaintenanceStatus;

  @Column({ name: 'service_date', type: 'date' })
  serviceDate: Date;

  @Column({ name: 'odometer_reading', type: 'decimal', precision: 10, scale: 2, nullable: true })
  odometerReading: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cost: number;

  @Column({ name: 'vendor_name', type: 'varchar', nullable: true })
  vendorName: string;

  @Column({ name: 'invoice_number', type: 'varchar', nullable: true })
  invoiceNumber: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'performed_by', type: 'uuid', nullable: true })
  performedBy: string;
}
