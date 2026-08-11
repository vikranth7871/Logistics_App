import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Driver, DriverStatus } from './entities/driver.entity';
import { StorageService } from '../storage/storage.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverListQueryDto } from './dto/driver-list-query.dto';
import { createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver) private driverRepo: Repository<Driver>,
    private storageService: StorageService,
  ) {}

  async findAll(query: DriverListQueryDto, companyId: string) {
    const { page = 1, limit = 20, status, search, sort = 'name', order = 'asc' } = query;

    const qb = this.driverRepo
      .createQueryBuilder('d')
      .andWhere('d.deletedAt IS NULL');

    if (companyId) qb.andWhere('d.companyId = :companyId', { companyId });
    if (status) qb.andWhere('d.status = :status', { status });
    if (search)
      qb.andWhere('(d.name ILIKE :search OR d.phone ILIKE :search OR d.licenseNumber ILIKE :search)', {
        search: `%${search}%`,
      });

    qb.orderBy(`d.${sort}`, order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [drivers, total] = await qb.getManyAndCount();
    return createPaginatedResponse(drivers, total, page, limit);
  }

  async findOne(id: string, companyId: string) {
    const where: any = { id };
    if (companyId) where.companyId = companyId;

    const driver = await this.driverRepo.findOne({
      where,
    });

    if (!driver) {
      throw new NotFoundException({
        message: 'Driver not found',
        code: 'DRIVER_NOT_FOUND',
        details: { id },
      });
    }

    return driver;
  }

  async create(dto: CreateDriverDto, companyId: string) {
    const existing = await this.driverRepo.findOne({
      where: { phone: dto.phone, companyId },
    });

    if (existing) {
      throw new ConflictException({
        message: `A driver with phone ${dto.phone} already exists`,
        code: 'DRIVER_PHONE_DUPLICATE',
      });
    }

    const driver = this.driverRepo.create({ ...dto, companyId });
    return this.driverRepo.save(driver);
  }

  async update(id: string, dto: UpdateDriverDto, companyId: string) {
    const driver = await this.findOne(id, companyId);
    Object.assign(driver, dto);
    return this.driverRepo.save(driver);
  }

  async remove(id: string, companyId: string) {
    const driver = await this.findOne(id, companyId);

    if (driver.status === DriverStatus.ON_TRIP) {
      throw new BadRequestException({
        message: 'Cannot delete a driver who is currently on a trip',
        code: 'DRIVER_ON_TRIP',
      });
    }

    await this.driverRepo.softDelete(id);
    return { message: 'Driver deleted successfully' };
  }

  async getAvailableDrivers(companyId: string) {
    return this.driverRepo.find({
      where: { companyId, status: DriverStatus.ACTIVE },
      order: { name: 'ASC' },
    });
  }

  async assignVehicle(driverId: string, vehicleId: string, companyId: string) {
    const driver = await this.findOne(driverId, companyId);
    driver.assignedVehicleId = vehicleId;
    return this.driverRepo.save(driver);
  }

  async uploadPhoto(driverId: string, file: Express.Multer.File, companyId: string) {
    const driver = await this.findOne(driverId, companyId);
    const { url } = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      `drivers/${driverId}/photos`,
      file.mimetype,
    );
    driver.photoUrl = url;
    return this.driverRepo.save(driver);
  }

  async getLicenseExpiringDrivers(companyId: string, days = 60) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return this.driverRepo
      .createQueryBuilder('d')
      .where('d.companyId = :companyId', { companyId })
      .andWhere('d.deletedAt IS NULL')
      .andWhere('d.licenseExpiry IS NOT NULL')
      .andWhere('d.licenseExpiry <= :cutoff', { cutoff })
      .orderBy('d.licenseExpiry', 'ASC')
      .getMany();
  }
}
