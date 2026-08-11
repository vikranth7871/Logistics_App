import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { createPaginatedResponse, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
  ) {}

  async findAll(query: PaginationDto & { search?: string }, companyId: string) {
    const { page = 1, limit = 20, search } = query;

    const qb = this.customerRepo
      .createQueryBuilder('c')
      .where('c.companyId = :companyId', { companyId })
      .andWhere('c.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(c.name ILIKE :search OR c.phone ILIKE :search OR c.gstNumber ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('c.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [customers, total] = await qb.getManyAndCount();
    return createPaginatedResponse(customers, total, page, limit);
  }

  async findOne(id: string, companyId: string) {
    const customer = await this.customerRepo.findOne({
      where: { id, companyId },
    });

    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(dto: CreateCustomerDto, companyId: string) {
    const customer = this.customerRepo.create({
      ...dto,
      companyId,
    });

    return this.customerRepo.save(customer);
  }

  async update(id: string, dto: Partial<CreateCustomerDto>, companyId: string) {
    const customer = await this.findOne(id, companyId);
    Object.assign(customer, dto);
    return this.customerRepo.save(customer);
  }

  async getBalance(id: string, companyId: string) {
    const customer = await this.findOne(id, companyId);
    return {
      id: customer.id,
      name: customer.name,
      creditLimit: customer.creditLimit,
      outstandingBalance: customer.outstandingBalance,
      availableCredit: Number(customer.creditLimit) - Number(customer.outstandingBalance),
    };
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    await this.customerRepo.softDelete(id);
    return { message: 'Customer deleted' };
  }
}
