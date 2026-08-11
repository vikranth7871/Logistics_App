import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { createPaginatedResponse, PaginationDto } from '../../common/dto/pagination.dto';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ name: 'user_name', type: 'varchar', nullable: true })
  userName: string;

  @Column({ name: 'user_role', type: 'varchar', nullable: true })
  userRole: string;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ name: 'entity_type', type: 'varchar' })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string;

  @Column({ name: 'before_data', type: 'jsonb', nullable: true })
  beforeData: any;

  @Column({ name: 'after_data', type: 'jsonb', nullable: true })
  afterData: any;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  async findAll(query: PaginationDto & { entityType?: string; action?: string }, companyId?: string) {
    const { page = 1, limit = 25, entityType, action } = query;

    const qb = this.auditRepo.createQueryBuilder('a');

    if (companyId) {
      qb.where('a.companyId = :companyId', { companyId });
    }

    if (entityType) {
      if (companyId) {
        qb.andWhere('a.entityType = :entityType', { entityType });
      } else {
        qb.where('a.entityType = :entityType', { entityType });
      }
    }

    if (action) {
      qb.andWhere('a.action = :action', { action });
    }

    qb.orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [logs, total] = await qb.getManyAndCount();
    return createPaginatedResponse(logs, total, page, limit);
  }

  async log(entry: Partial<AuditLog>) {
    const log = this.auditRepo.create(entry);
    return this.auditRepo.save(log);
  }
}
