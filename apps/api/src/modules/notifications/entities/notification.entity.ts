import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';

export enum NotificationType {
  TRIP_ASSIGNED = 'trip_assigned',
  TRIP_STARTED = 'trip_started',
  TRIP_DELIVERED = 'trip_delivered',
  TRIP_COMPLETED = 'trip_completed',
  DOCUMENT_EXPIRING = 'document_expiring',
  LICENSE_EXPIRING = 'license_expiring',
  INVOICE_DUE = 'invoice_due',
  EXPENSE_SUBMITTED = 'expense_submitted',
  MAINTENANCE_DUE = 'maintenance_due',
}

export enum NotificationSeverity {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

@Entity('notifications')
@Index(['userId', 'isRead'])
@Index(['companyId', 'createdAt'])
export class Notification extends BaseEntity {
  /** The user who receives this notification */
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ length: 120 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationSeverity, default: NotificationSeverity.INFO })
  severity: NotificationSeverity;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  /** Optional link to the triggering entity (e.g. trip id) */
  @Column({ name: 'entity_type', nullable: true, length: 50 })
  entityType?: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId?: string;
}
