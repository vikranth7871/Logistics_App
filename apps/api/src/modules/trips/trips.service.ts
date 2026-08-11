import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip, TripStatus } from './entities/trip.entity';
import { TripStateService } from './trip-state.service';
import { Vehicle, VehicleStatus } from '../fleet/entities/vehicle.entity';
import { Driver, DriverStatus } from '../drivers/entities/driver.entity';
import { StorageService } from '../storage/storage.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { CreateTripDto, AssignTripDto, StartTripDto, CompleteTripDto, CancelTripDto } from './dto/trip.dto';
import { createPaginatedResponse, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip) private tripRepo: Repository<Trip>,
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Driver) private driverRepo: Repository<Driver>,
    private tripStateService: TripStateService,
    private storageService: StorageService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  // ── LIST ─────────────────────────────────────────────────────────
  async findAll(
    query: PaginationDto & {
      status?: string;
      search?: string;
      vehicleId?: string;
      driverId?: string;
      customerId?: string;
    },
    companyId?: string,
  ) {
    const { page = 1, limit = 20, status, search, vehicleId, driverId, customerId } = query;

    const qb = this.tripRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.vehicle', 'vehicle')
      .leftJoinAndSelect('t.driver', 'driver')
      .leftJoinAndSelect('t.customer', 'customer')
      .where('t.deletedAt IS NULL');

    if (companyId) qb.andWhere('t.companyId = :companyId', { companyId });
    if (status) qb.andWhere('t.status = :status', { status });
    if (vehicleId) qb.andWhere('t.vehicleId = :vehicleId', { vehicleId });
    if (driverId) qb.andWhere('t.driverId = :driverId', { driverId });
    if (customerId) qb.andWhere('t.customerId = :customerId', { customerId });
    if (search) {
      qb.andWhere(
        '(t.tripNumber ILIKE :search OR t.origin ILIKE :search OR t.destination ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [trips, total] = await qb.getManyAndCount();
    return createPaginatedResponse(trips, total, page, limit);
  }

  // ── ACTIVE ───────────────────────────────────────────────────────
  async getActiveTrips(companyId?: string) {
    const where: any = { status: TripStatus.IN_PROGRESS };
    if (companyId) where.companyId = companyId;

    return this.tripRepo.find({
      where,
      relations: ['vehicle', 'driver', 'customer'],
      order: { actualStart: 'ASC' },
    });
  }

  // ── SUMMARY ──────────────────────────────────────────────────────
  async getSummary(companyId?: string) {
    const base: any = {};
    if (companyId) base.companyId = companyId;

    const [draft, assigned, inProgress, delivered, completed, cancelled] = await Promise.all([
      this.tripRepo.count({ where: { ...base, status: TripStatus.DRAFT } }),
      this.tripRepo.count({ where: { ...base, status: TripStatus.ASSIGNED } }),
      this.tripRepo.count({ where: { ...base, status: TripStatus.IN_PROGRESS } }),
      this.tripRepo.count({ where: { ...base, status: TripStatus.DELIVERED } }),
      this.tripRepo.count({ where: { ...base, status: TripStatus.COMPLETED } }),
      this.tripRepo.count({ where: { ...base, status: TripStatus.CANCELLED } }),
    ]);

    return { draft, assigned, inProgress, delivered, completed, cancelled, total: draft + assigned + inProgress + delivered + completed + cancelled };
  }

  // ── GET ONE ──────────────────────────────────────────────────────
  async findOne(id: string, companyId?: string) {
    const where: any = { id };
    if (companyId) where.companyId = companyId;

    const trip = await this.tripRepo.findOne({
      where,
      relations: ['vehicle', 'driver', 'customer'],
    });

    if (!trip) {
      throw new NotFoundException({
        message: 'Trip not found',
        code: 'TRIP_NOT_FOUND',
        details: { id },
      });
    }

    return trip;
  }

  // ── CREATE ───────────────────────────────────────────────────────
  async create(dto: CreateTripDto, companyId: string, userId: string) {
    const tripNumber = await this.generateTripNumber(companyId);

    const status = (dto.vehicleId && dto.driverId) ? TripStatus.ASSIGNED : TripStatus.DRAFT;

    const trip = this.tripRepo.create({
      ...dto,
      tripNumber,
      companyId,
      createdBy: userId,
      status,
    });

    return this.tripRepo.save(trip);
  }

  // ── ASSIGN ───────────────────────────────────────────────────────
  async assign(id: string, dto: AssignTripDto, companyId: string) {
    const trip = await this.findOne(id, companyId);
    this.tripStateService.validateTransition(trip.status, TripStatus.ASSIGNED);

    trip.vehicleId = dto.vehicleId;
    trip.driverId = dto.driverId;
    trip.status = TripStatus.ASSIGNED;

    return this.tripRepo.save(trip);
  }

  // ── START ────────────────────────────────────────────────────────
  async start(id: string, dto: StartTripDto, companyId: string) {
    const trip = await this.findOne(id, companyId);
    this.tripStateService.validateTransition(trip.status, TripStatus.IN_PROGRESS);

    if (trip.vehicleId) {
      await this.vehicleRepo.update(trip.vehicleId, { status: VehicleStatus.IN_TRIP });
    }
    if (trip.driverId) {
      await this.driverRepo.update(trip.driverId, { status: DriverStatus.ON_TRIP });
    }

    trip.status = TripStatus.IN_PROGRESS;
    trip.actualStart = new Date();
    if (dto.odometer) trip.startOdometer = dto.odometer;

    const saved = await this.tripRepo.save(trip);
    this.notificationsGateway.emitTripUpdate(saved.id, saved.status, saved.vehicle?.registrationNumber || '');
    return saved;
  }

  // ── DELIVER ──────────────────────────────────────────────────────
  async deliver(id: string, companyId: string) {
    const trip = await this.findOne(id, companyId);
    this.tripStateService.validateTransition(trip.status, TripStatus.DELIVERED);

    trip.status = TripStatus.DELIVERED;
    trip.deliveredAt = new Date();

    const saved = await this.tripRepo.save(trip);
    this.notificationsGateway.emitTripUpdate(saved.id, saved.status, saved.vehicle?.registrationNumber || '');
    return saved;
  }

  // ── COMPLETE ─────────────────────────────────────────────────────
  async complete(id: string, dto: CompleteTripDto, companyId: string) {
    const trip = await this.findOne(id, companyId);
    this.tripStateService.validateTransition(trip.status, TripStatus.COMPLETED);

    if (trip.vehicleId) {
      await this.vehicleRepo.update(trip.vehicleId, { status: VehicleStatus.ACTIVE });
    }
    if (trip.driverId) {
      await this.driverRepo.update(trip.driverId, { status: DriverStatus.ACTIVE });
    }

    trip.status = TripStatus.COMPLETED;
    trip.actualEnd = new Date();
    if (dto.endOdometer) {
      trip.endOdometer = dto.endOdometer;
      if (trip.startOdometer) {
        trip.distanceKm = dto.endOdometer - trip.startOdometer;
      }
    }

    const saved = await this.tripRepo.save(trip);
    this.notificationsGateway.emitTripUpdate(saved.id, saved.status, saved.vehicle?.registrationNumber || '');
    return saved;
  }

  // ── CANCEL ───────────────────────────────────────────────────────
  async cancel(id: string, dto: CancelTripDto, companyId: string) {
    const trip = await this.findOne(id, companyId);
    this.tripStateService.validateTransition(trip.status, TripStatus.CANCELLED);

    // Release vehicle and driver if they were assigned
    if (trip.vehicleId) {
      await this.vehicleRepo.update(trip.vehicleId, { status: VehicleStatus.ACTIVE });
    }
    if (trip.driverId) {
      await this.driverRepo.update(trip.driverId, { status: DriverStatus.ACTIVE });
    }

    trip.status = TripStatus.CANCELLED;
    trip.cancelledReason = dto.reason;

    return this.tripRepo.save(trip);
  }

  // ── UPLOAD PROOF ─────────────────────────────────────────────────
  async uploadDeliveryProof(id: string, file: Express.Multer.File, companyId: string) {
    const trip = await this.findOne(id, companyId);

    const result = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      `trips/${id}/proof`,
      file.mimetype,
    );

    trip.deliveryProofUrl = result.url;
    return this.tripRepo.save(trip);
  }

  // ── PRIVATE ──────────────────────────────────────────────────────
  private async generateTripNumber(companyId: string): Promise<string> {
    const count = await this.tripRepo.count({ where: { companyId } });
    const year = new Date().getFullYear().toString().slice(-2);
    const num = (count + 1).toString().padStart(5, '0');
    return `TRP-${year}-${num}`;
  }
}
