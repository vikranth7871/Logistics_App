import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationSeverity } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { createPaginatedResponse } from '../../common/dto/pagination.dto';

export interface CreateNotificationDto {
  userId: string;
  companyId: string;
  type: NotificationType;
  title: string;
  message: string;
  severity?: NotificationSeverity;
  entityType?: string;
  entityId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
    private gateway: NotificationsGateway,
  ) {}

  /**
   * Persist a notification to DB and emit via WebSocket.
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notif = this.notifRepo.create({
      ...dto,
      severity: dto.severity ?? NotificationSeverity.INFO,
      isRead: false,
    });
    const saved = await this.notifRepo.save(notif);

    // Push real-time event to the user's socket room
    this.gateway.sendToUser(dto.userId, {
      id: saved.id,
      type: saved.type,
      title: saved.title,
      message: saved.message,
      severity: saved.severity,
      entityType: saved.entityType,
      entityId: saved.entityId,
      createdAt: saved.createdAt,
    });

    return saved;
  }

  /**
   * Create notifications for multiple recipients at once.
   */
  async createForMany(
    userIds: string[],
    dto: Omit<CreateNotificationDto, 'userId'>,
  ): Promise<void> {
    await Promise.all(userIds.map((userId) => this.create({ ...dto, userId })));
  }

  /**
   * Fetch paginated notifications for a user.
   */
  async findAll(userId: string, companyId: string, page = 1, limit = 20) {
    const [items, total] = await this.notifRepo.findAndCount({
      where: { userId, companyId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return createPaginatedResponse(items, total, page, limit);
  }

  /**
   * Count unread notifications for a user.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({ where: { userId, isRead: false } });
  }

  /**
   * Mark a single notification as read.
   */
  async markRead(id: string, userId: string): Promise<void> {
    await this.notifRepo.update({ id, userId }, { isRead: true });
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllRead(userId: string): Promise<void> {
    await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
  }

  /**
   * Fetch users with a given role in a company (used by triggers).
   * Returns user IDs to notify.
   */
  async getUserIdsByRole(companyId: string, roles: string[]): Promise<string[]> {
    // We query users table directly
    const result = await this.notifRepo.query(
      `SELECT id FROM users WHERE company_id = $1 AND role = ANY($2::text[]) AND is_active = true`,
      [companyId, roles],
    );
    return result.map((r: { id: string }) => r.id);
  }
}
