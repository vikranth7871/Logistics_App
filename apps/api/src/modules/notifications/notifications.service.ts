import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
    private gateway: NotificationsGateway,
  ) {}

  /**
   * Persist a notification to DB and emit via WebSocket.
   */
  async create(dto: CreateNotificationDto): Promise<Notification | null> {
    try {
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
    } catch (err: any) {
      this.logger.warn(`Failed to create notification for user ${dto.userId}: ${err?.message || err}`);
      return null;
    }
  }

  /**
   * Create notifications for multiple recipients at once.
   */
  async createForMany(
    userIds: string[],
    dto: Omit<CreateNotificationDto, 'userId'>,
  ): Promise<void> {
    if (!userIds || userIds.length === 0) return;
    try {
      const uniqueIds = [...new Set(userIds)];
      await Promise.all(uniqueIds.map((userId) => this.create({ ...dto, userId })));
    } catch (err: any) {
      this.logger.warn(`Failed to bulk create notifications: ${err?.message || err}`);
    }
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
    if (!userId) return 0;
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
   * Returns user IDs to notify. Safely constructed via QueryBuilder.
   */
  async getUserIdsByRole(companyId: string, roles: string[]): Promise<string[]> {
    if (!roles || roles.length === 0) return [];
    try {
      const qb = this.notifRepo.manager
        .createQueryBuilder()
        .select('u.id', 'id')
        .from('users', 'u')
        .where('u.is_active = true');

      if (companyId) {
        qb.andWhere('u.company_id = :companyId', { companyId });
      }
      if (roles.length > 0) {
        qb.andWhere('u.role IN (:...roles)', { roles });
      }

      const result = await qb.getRawMany();
      return result.map((r) => r.id);
    } catch (err: any) {
      this.logger.warn(`getUserIdsByRole failed: ${err?.message || err}`);
      return [];
    }
  }
}
