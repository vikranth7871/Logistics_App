import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRecord, MaintenanceStatus } from './entities/maintenance-record.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { Vehicle, VehicleStatus } from '../fleet/entities/vehicle.entity';
import { createPaginatedResponse, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRecord) private maintenanceRepo: Repository<MaintenanceRecord>,
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
  ) {}

  async findAll(query: PaginationDto & { vehicleId?: string; type?: string; status?: string }, companyId: string) {
    const { page = 1, limit = 20, vehicleId, type, status } = query;

    const qb = this.maintenanceRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.vehicle', 'vehicle')
      .where('m.companyId = :companyId', { companyId })
      .andWhere('m.deletedAt IS NULL');

    if (vehicleId) qb.andWhere('m.vehicleId = :vehicleId', { vehicleId });
    if (type) qb.andWhere('m.type = :type', { type });
    if (status) qb.andWhere('m.status = :status', { status });

    qb.orderBy('m.serviceDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [records, total] = await qb.getManyAndCount();
    return createPaginatedResponse(records, total, page, limit);
  }

  async findOne(id: string, companyId: string) {
    const record = await this.maintenanceRepo.findOne({
      where: { id, companyId },
      relations: ['vehicle'],
    });

    if (!record) throw new NotFoundException('Maintenance record not found');
    return record;
  }

  async create(dto: CreateMaintenanceDto, companyId: string, userId: string) {
    const record = this.maintenanceRepo.create({
      ...dto,
      companyId,
      performedBy: userId,
    });

    const saved = await this.maintenanceRepo.save(record);

    // If status is in_progress, update vehicle status to maintenance
    if (dto.status === MaintenanceStatus.IN_PROGRESS && dto.vehicleId) {
      await this.vehicleRepo.update(dto.vehicleId, { status: VehicleStatus.MAINTENANCE });
    }

    return saved;
  }

  async update(id: string, dto: Partial<CreateMaintenanceDto>, companyId: string) {
    const record = await this.findOne(id, companyId);
    Object.assign(record, dto);

    const saved = await this.maintenanceRepo.save(record);

    if (dto.status === MaintenanceStatus.COMPLETED && record.vehicleId) {
      await this.vehicleRepo.update(record.vehicleId, { status: VehicleStatus.ACTIVE });
    } else if (dto.status === MaintenanceStatus.IN_PROGRESS && record.vehicleId) {
      await this.vehicleRepo.update(record.vehicleId, { status: VehicleStatus.MAINTENANCE });
    }

    return saved;
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    await this.maintenanceRepo.softDelete(id);
    return { message: 'Maintenance record deleted' };
  }
}
