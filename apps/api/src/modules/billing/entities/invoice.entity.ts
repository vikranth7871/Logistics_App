import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'invoice_number', length: 30, unique: true })
  invoiceNumber: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ name: 'subtotal', type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'tax_total', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxTotal: number;

  @Column({ name: 'grand_total', type: 'decimal', precision: 12, scale: 2, default: 0 })
  grandTotal: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ name: 'balance_due', type: 'decimal', precision: 12, scale: 2, default: 0 })
  balanceDue: number;

  // GST details
  @Column({ name: 'is_interstate', default: false })
  isInterstate: boolean;  // true = IGST, false = CGST+SGST

  @Column({ name: 'customer_gst', nullable: true })
  customerGst: string;

  @Column({ name: 'company_gst', nullable: true })
  companyGst: string;

  @Column({ name: 'line_items', type: 'jsonb' })
  lineItems: object[];

  @Column({ name: 'payment_terms', nullable: true })
  paymentTerms: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;
}
