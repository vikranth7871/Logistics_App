import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { createPaginatedResponse, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
  ) {}

  async findAll(query: PaginationDto & { customerId?: string; status?: string }, companyId: string) {
    const { page = 1, limit = 20, customerId, status } = query;

    const qb = this.invoiceRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.customer', 'customer')
      .where('i.companyId = :companyId', { companyId })
      .andWhere('i.deletedAt IS NULL');

    if (customerId) qb.andWhere('i.customerId = :customerId', { customerId });
    if (status) qb.andWhere('i.status = :status', { status });

    qb.orderBy('i.invoiceDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [invoices, total] = await qb.getManyAndCount();
    return createPaginatedResponse(invoices, total, page, limit);
  }

  async findOne(id: string, companyId: string) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id, companyId },
      relations: ['customer'],
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(dto: CreateInvoiceDto, companyId: string, userId: string) {
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const subtotal = dto.lineItems.reduce((acc, item) => acc + item.amount, 0);
    const taxTotal = dto.gstRatePercent ? (subtotal * dto.gstRatePercent) / 100 : 0;
    const grandTotal = subtotal + taxTotal;

    const invoice = this.invoiceRepo.create({
      ...dto,
      companyId,
      invoiceNumber,
      status: InvoiceStatus.DRAFT,
      subtotal,
      taxTotal,
      grandTotal,
      paidAmount: 0,
      balanceDue: grandTotal,
      createdBy: userId,
    });

    return this.invoiceRepo.save(invoice);
  }

  async finalize(id: string, companyId: string) {
    const invoice = await this.findOne(id, companyId);
    invoice.status = InvoiceStatus.ISSUED;
    return this.invoiceRepo.save(invoice);
  }

  async recordPayment(id: string, amount: number, companyId: string) {
    const invoice = await this.findOne(id, companyId);

    const newPaid = Number(invoice.paidAmount) + amount;
    const newBalance = Number(invoice.grandTotal) - newPaid;

    invoice.paidAmount = newPaid;
    invoice.balanceDue = newBalance <= 0 ? 0 : newBalance;
    invoice.status = newBalance <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

    return this.invoiceRepo.save(invoice);
  }

  async getOutstanding(companyId: string) {
    return this.invoiceRepo.find({
      where: { companyId },
      relations: ['customer'],
      order: { dueDate: 'ASC' },
    });
  }
}
