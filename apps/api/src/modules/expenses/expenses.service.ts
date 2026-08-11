import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { StorageService } from '../storage/storage.service';
import { createPaginatedResponse, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
    private storageService: StorageService,
  ) {}

  async findAll(query: PaginationDto & { category?: string; vehicleId?: string; tripId?: string; driverId?: string }, companyId: string) {
    const { page = 1, limit = 20, category, vehicleId, tripId, driverId } = query;

    const qb = this.expenseRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.vehicle', 'vehicle')
      .leftJoinAndSelect('e.driver', 'driver')
      .leftJoinAndSelect('e.trip', 'trip')
      .where('e.companyId = :companyId', { companyId })
      .andWhere('e.deletedAt IS NULL');

    if (category) qb.andWhere('e.category = :category', { category });
    if (vehicleId) qb.andWhere('e.vehicleId = :vehicleId', { vehicleId });
    if (tripId) qb.andWhere('e.tripId = :tripId', { tripId });
    if (driverId) qb.andWhere('e.driverId = :driverId', { driverId });

    qb.orderBy('e.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entries, total] = await qb.getManyAndCount();
    return createPaginatedResponse(entries, total, page, limit);
  }

  async findOne(id: string, companyId: string) {
    const expense = await this.expenseRepo.findOne({
      where: { id, companyId },
      relations: ['vehicle', 'driver', 'trip'],
    });

    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async create(dto: CreateExpenseDto, companyId: string, userId: string) {
    const expense = this.expenseRepo.create({
      ...dto,
      companyId,
      recordedBy: userId,
    });

    return this.expenseRepo.save(expense);
  }

  async update(id: string, dto: Partial<CreateExpenseDto>, companyId: string) {
    const expense = await this.findOne(id, companyId);
    Object.assign(expense, dto);
    return this.expenseRepo.save(expense);
  }

  async approve(id: string, companyId: string, userId: string) {
    const expense = await this.findOne(id, companyId);
    expense.isApproved = true;
    expense.approvedBy = userId;
    return this.expenseRepo.save(expense);
  }

  async uploadReceipt(id: string, file: Express.Multer.File, companyId: string) {
    const expense = await this.findOne(id, companyId);
    const { url } = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      `expenses/${id}/receipts`,
      file.mimetype,
    );

    expense.receiptUrl = url;
    return this.expenseRepo.save(expense);
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    await this.expenseRepo.softDelete(id);
    return { message: 'Expense deleted' };
  }

  async getSummary(companyId: string) {
    const total = await this.expenseRepo
      .createQueryBuilder('e')
      .select('SUM(e.amount)', 'totalAmount')
      .where('e.companyId = :companyId', { companyId })
      .andWhere('e.deletedAt IS NULL')
      .getRawOne();

    const byCategory = await this.expenseRepo
      .createQueryBuilder('e')
      .select('e.category', 'category')
      .addSelect('SUM(e.amount)', 'amount')
      .where('e.companyId = :companyId', { companyId })
      .andWhere('e.deletedAt IS NULL')
      .groupBy('e.category')
      .getRawMany();

    return {
      totalAmount: parseFloat(total.totalAmount || 0),
      byCategory,
    };
  }
}
