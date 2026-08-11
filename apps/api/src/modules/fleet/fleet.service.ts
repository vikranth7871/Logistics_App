import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { VehicleDocument, DocumentType } from './entities/vehicle-document.entity';
import { StorageService } from '../storage/storage.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleListQueryDto } from './dto/vehicle-list-query.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { createPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class FleetService {
  constructor(
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(VehicleDocument) private docRepo: Repository<VehicleDocument>,
    private storageService: StorageService,
  ) {}

  // ── LIST VEHICLES ─────────────────────────────────────────────
  async findAll(query: VehicleListQueryDto, companyId: string) {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sort = 'createdAt',
      order = 'desc',
    } = query;

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (search) where.registrationNumber = Like(`%${search.toUpperCase()}%`);

    const [vehicles, total] = await this.vehicleRepo.findAndCount({
      where,
      order: { [sort]: order.toUpperCase() as 'ASC' | 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // For each vehicle, attach latest document expiry dates
    const enriched = await Promise.all(
      vehicles.map((v) => this.enrichWithDocumentExpiries(v)),
    );

    return createPaginatedResponse(enriched, total, page, limit);
  }

  // ── GET ONE VEHICLE ──────────────────────────────────────────
  async findOne(id: string, companyId: string) {
    const where: any = { id };
    if (companyId) where.companyId = companyId;

    const vehicle = await this.vehicleRepo.findOne({
      where,
    });

    if (!vehicle) {
      throw new NotFoundException({
        message: `Vehicle not found`,
        code: 'VEHICLE_NOT_FOUND',
        details: { id },
      });
    }

    const documents = await this.docRepo.find({
      where: { vehicleId: id },
      order: { createdAt: 'DESC' },
    });

    return { ...vehicle, documents };
  }

  // ── CREATE VEHICLE ───────────────────────────────────────────
  async create(dto: CreateVehicleDto, companyId: string, userId: string) {
    const existing = await this.vehicleRepo.findOne({
      where: { registrationNumber: dto.registrationNumber.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException({
        message: `Vehicle with registration ${dto.registrationNumber} already exists`,
        code: 'VEHICLE_REG_DUPLICATE',
        details: { registrationNumber: dto.registrationNumber },
      });
    }

    const vehicle = this.vehicleRepo.create({
      ...dto,
      registrationNumber: dto.registrationNumber.toUpperCase(),
      companyId,
    });

    return this.vehicleRepo.save(vehicle);
  }

  // ── UPDATE VEHICLE ───────────────────────────────────────────
  async update(id: string, dto: UpdateVehicleDto, companyId: string) {
    const vehicle = await this.findOne(id, companyId);
    Object.assign(vehicle, dto);
    return this.vehicleRepo.save(vehicle);
  }

  // ── SOFT DELETE ──────────────────────────────────────────────
  async remove(id: string, companyId: string) {
    const vehicle = await this.findOne(id, companyId);

    if (vehicle.status === VehicleStatus.IN_TRIP) {
      throw new BadRequestException({
        message: 'Cannot delete a vehicle that is currently on a trip',
        code: 'VEHICLE_IN_TRIP',
      });
    }

    await this.vehicleRepo.softDelete(id);
    return { message: 'Vehicle deleted successfully' };
  }

  // ── DOCUMENTS ─────────────────────────────────────────────────
  async getDocuments(vehicleId: string, companyId: string) {
    await this.findOne(vehicleId, companyId); // verify ownership

    return this.docRepo.find({
      where: { vehicleId },
      order: { createdAt: 'DESC' },
    });
  }

  async uploadDocument(
    vehicleId: string,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    companyId: string,
    userId: string,
  ) {
    await this.findOne(vehicleId, companyId); // verify ownership

    const { url, key } = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      `documents/vehicles/${vehicleId}`,
      file.mimetype,
    );

    const doc = this.docRepo.create({
      vehicleId,
      type: dto.type as DocumentType,
      fileUrl: url,
      fileName: file.originalname,
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
      documentNumber: dto.documentNumber,
      notes: dto.notes,
      uploadedBy: userId,
    });

    return this.docRepo.save(doc);
  }

  async deleteDocument(vehicleId: string, docId: string, companyId: string) {
    await this.findOne(vehicleId, companyId);
    const doc = await this.docRepo.findOne({ where: { id: docId, vehicleId } });

    if (!doc) {
      throw new NotFoundException({ message: 'Document not found', code: 'DOCUMENT_NOT_FOUND' });
    }

    await this.docRepo.delete(docId);
    return { message: 'Document deleted successfully' };
  }

  // ── EXPIRING DOCUMENTS ───────────────────────────────────────
  async getExpiringDocuments(companyId: string, days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    const docs = await this.docRepo
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.vehicle', 'vehicle')
      .where('vehicle.companyId = :companyId', { companyId })
      .andWhere('doc.expiryDate IS NOT NULL')
      .andWhere('doc.expiryDate <= :cutoff', { cutoff })
      .andWhere('doc.expiryDate >= NOW()')
      .orderBy('doc.expiryDate', 'ASC')
      .getMany();

    return docs;
  }

  // ── FLEET SUMMARY (for dashboard KPIs) ──────────────────────
  async getFleetSummary(companyId: string) {
    const counts = await this.vehicleRepo
      .createQueryBuilder('v')
      .select('v.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('v.companyId = :companyId', { companyId })
      .andWhere('v.deletedAt IS NULL')
      .groupBy('v.status')
      .getRawMany();

    const summary: Record<string, number> = {
      total: 0,
      active: 0,
      in_trip: 0,
      maintenance: 0,
      inactive: 0,
    };

    counts.forEach(({ status, count }) => {
      summary[status] = parseInt(count, 10);
      summary.total += parseInt(count, 10);
    });

    return summary;
  }

  // ── HELPERS ──────────────────────────────────────────────────
  private async enrichWithDocumentExpiries(vehicle: Vehicle) {
    const docs = await this.docRepo.find({ where: { vehicleId: vehicle.id } });
    const getExpiry = (type: DocumentType) =>
      docs.find((d) => d.type === type)?.expiryDate || null;

    return {
      ...vehicle,
      insuranceExpiry: getExpiry(DocumentType.INSURANCE),
      permitExpiry: getExpiry(DocumentType.PERMIT),
      fitnessExpiry: getExpiry(DocumentType.FITNESS),
    };
  }
}
