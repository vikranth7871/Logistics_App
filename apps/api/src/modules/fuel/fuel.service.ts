import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuelEntry } from './entities/fuel-entry.entity';
import { CreateFuelEntryDto } from './dto/create-fuel-entry.dto';
import { createPaginatedResponse, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class FuelService {
  constructor(
    @InjectRepository(FuelEntry) private fuelRepo: Repository<FuelEntry>,
  ) {}

  async findAll(query: PaginationDto & { vehicleId?: string; tripId?: string; driverId?: string }, companyId: string) {
    const { page = 1, limit = 20, vehicleId, tripId, driverId } = query;

    const qb = this.fuelRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.vehicle', 'vehicle')
      .leftJoinAndSelect('f.trip', 'trip')
      .where('f.companyId = :companyId', { companyId })
      .andWhere('f.deletedAt IS NULL');

    if (vehicleId) qb.andWhere('f.vehicleId = :vehicleId', { vehicleId });
    if (tripId) qb.andWhere('f.tripId = :tripId', { tripId });
    if (driverId) qb.andWhere('f.recordedBy IN (SELECT id FROM users WHERE driver_id = :driverId)', { driverId });

    qb.orderBy('f.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entries, total] = await qb.getManyAndCount();
    return createPaginatedResponse(entries, total, page, limit);
  }

  async findOne(id: string, companyId: string) {
    const entry = await this.fuelRepo.findOne({
      where: { id, companyId },
      relations: ['vehicle', 'trip'],
    });

    if (!entry) throw new NotFoundException('Fuel entry not found');
    return entry;
  }

  async create(dto: CreateFuelEntryDto, companyId: string, userId: string) {
    // Calculate mileage if previous odometer reading exists
    let mileageKmpl: number | undefined;
    if (dto.odometerReading && dto.vehicleId) {
      const prevEntry = await this.fuelRepo.findOne({
        where: { vehicleId: dto.vehicleId, companyId },
        order: { odometerReading: 'DESC' },
      });

      if (prevEntry && prevEntry.odometerReading && dto.odometerReading > Number(prevEntry.odometerReading)) {
        const dist = dto.odometerReading - Number(prevEntry.odometerReading);
        mileageKmpl = parseFloat((dist / dto.fuelQuantityLiters).toFixed(2));
      }
    }

    const entry = this.fuelRepo.create({
      ...dto,
      companyId,
      recordedBy: userId,
      mileageKmpl,
    });

    return this.fuelRepo.save(entry);
  }

  async update(id: string, dto: Partial<CreateFuelEntryDto>, companyId: string) {
    const entry = await this.findOne(id, companyId);
    Object.assign(entry, dto);
    return this.fuelRepo.save(entry);
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    await this.fuelRepo.softDelete(id);
    return { message: 'Fuel entry deleted' };
  }

  async getAnalytics(companyId: string, vehicleId?: string) {
    const qb = this.fuelRepo
      .createQueryBuilder('f')
      .select('SUM(f.fuelQuantityLiters)', 'totalLiters')
      .addSelect('SUM(f.totalAmount)', 'totalCost')
      .addSelect('AVG(f.mileageKmpl)', 'avgMileage')
      .where('f.companyId = :companyId', { companyId })
      .andWhere('f.deletedAt IS NULL');

    if (vehicleId) qb.andWhere('f.vehicleId = :vehicleId', { vehicleId });

    const raw = await qb.getRawOne();
    return {
      totalLiters: parseFloat(raw.totalLiters || 0),
      totalCost: parseFloat(raw.totalCost || 0),
      avgMileage: parseFloat(raw.avgMileage || 0).toFixed(2),
    };
  }
}
