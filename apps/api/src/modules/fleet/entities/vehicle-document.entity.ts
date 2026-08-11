import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Vehicle } from './vehicle.entity';

export enum DocumentType {
  INSURANCE = 'insurance',
  PERMIT = 'permit',
  FITNESS = 'fitness',
  RC = 'rc',
  ROAD_TAX = 'road_tax',
  POLLUTION = 'pollution',
  OTHER = 'other',
}

@Entity('vehicle_documents')
export class VehicleDocument extends BaseEntity {
  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl: string;

  @Column({ name: 'file_name', nullable: true })
  fileName: string;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate: Date;

  @Column({ name: 'document_number', nullable: true })
  documentNumber: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploadedBy: string;
}
