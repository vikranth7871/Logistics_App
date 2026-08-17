import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { createPaginatedResponse, PaginationDto } from '../../common/dto/pagination.dto';

export { AuditLog };

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  async findAll(query: PaginationDto & { entityType?: string; action?: string }, companyId?: string) {
    const { page = 1, limit = 25, entityType, action } = query;

    const qb = this.auditRepo.createQueryBuilder('a');

    if (companyId) {
      qb.andWhere('a.companyId = :companyId', { companyId });
    }

    if (entityType) {
      qb.andWhere('a.entityType = :entityType', { entityType });
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
