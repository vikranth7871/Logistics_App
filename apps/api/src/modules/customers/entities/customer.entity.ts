import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';

@Entity('customers')
export class Customer extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'gst_number', nullable: true, length: 20 })
  gstNumber: string;

  @Column({ name: 'billing_address', type: 'text', nullable: true })
  billingAddress: string;

  @Column({ name: 'contact_person', nullable: true })
  contactPerson: string;

  @Column({ name: 'credit_limit', type: 'decimal', precision: 12, scale: 2, default: 0 })
  creditLimit: number;

  @Column({ name: 'credit_days', type: 'int', default: 30 })
  creditDays: number;

  @Column({ name: 'outstanding_balance', type: 'decimal', precision: 12, scale: 2, default: 0 })
  outstandingBalance: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;
}
