import { Injectable, NotFoundException, ConflictException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { createPaginatedResponse, PaginationDto } from '../../common/dto/pagination.dto';
import { UserRole } from '../../common/decorators/roles.decorator';

const COMPANY_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Driver) private driverRepo: Repository<Driver>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultAccounts();
  }

  async ensureDefaultAccounts() {
    try {
      // 1. Admin user check
      const adminExists = await this.userRepo.findOne({ where: { email: 'admin@lorryerp.com' } });
      if (!adminExists) {
        const passwordHash = await bcrypt.hash('Admin@123456', 12);
        await this.userRepo.save(
          this.userRepo.create({
            companyId: COMPANY_ID,
            name: 'System Admin',
            email: 'admin@lorryerp.com',
            passwordHash,
            role: UserRole.ADMIN,
            isActive: true,
          }),
        );
        this.logger.log('Created default admin user (admin@lorryerp.com)');
      }

      // 2. Driver accounts check
      const driverAccounts = [
        { name: 'Selvam P', email: 'driver@lorryerp.com', phone: '9876543212' },
        { name: 'Rajan S', email: 'rajan@lorryerp.com', phone: '9876543210' },
        { name: 'Kumar M', email: 'kumar@lorryerp.com', phone: '9876543211' },
        { name: 'Murugan K', email: 'murugan@lorryerp.com', phone: '9876543213' },
        { name: 'Arjun R', email: 'arjun@lorryerp.com', phone: '9876543214' },
      ];

      const driverPasswordHash = await bcrypt.hash('Driver@123456', 12);

      for (const d of driverAccounts) {
        const userExists = await this.userRepo.findOne({ where: { email: d.email } });

        if (!userExists) {
          // Find matching driver entity
          let driverEntity = await this.driverRepo.findOne({ where: { phone: d.phone } });

          if (!driverEntity) {
            driverEntity = await this.driverRepo.save(
              this.driverRepo.create({
                companyId: COMPANY_ID,
                name: d.name,
                phone: d.phone,
                licenseNumber: `TN0${Math.floor(10000000000 + Math.random() * 90000000000)}`,
              }),
            );
          }

          await this.userRepo.save(
            this.userRepo.create({
              companyId: COMPANY_ID,
              name: d.name,
              email: d.email,
              phone: d.phone,
              passwordHash: driverPasswordHash,
              role: UserRole.DRIVER,
              driverId: driverEntity.id,
              isActive: true,
            }),
          );
          this.logger.log(`Created default driver account (${d.email})`);
        }
      }
    } catch (err) {
      this.logger.warn(`Failed to run default user initialization: ${err.message}`);
    }
  }

  async findAll(query: PaginationDto & { search?: string; role?: string }, companyId: string) {
    const { page = 1, limit = 20, search, role } = query;

    const qb = this.userRepo
      .createQueryBuilder('u')
      .where('u.companyId = :companyId', { companyId })
      .andWhere('u.deletedAt IS NULL');

    if (role) qb.andWhere('u.role = :role', { role });
    if (search) {
      qb.andWhere('(u.name ILIKE :search OR u.email ILIKE :search OR u.phone ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await qb.getManyAndCount();
    const sanitized = users.map((u) => {
      const { passwordHash, refreshTokenHash, ...rest } = u;
      return rest;
    });

    return createPaginatedResponse(sanitized, total, page, limit);
  }

  async findOne(id: string, companyId: string) {
    const user = await this.userRepo.findOne({
      where: { id, companyId },
    });

    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, refreshTokenHash, ...sanitized } = user;
    return sanitized;
  }

  async create(data: any, companyId: string) {
    const existing = await this.userRepo.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictException('User email already exists');

    const hashedPassword = await bcrypt.hash(data.password || 'Welcome@123456', 10);
    const user = this.userRepo.create({
      ...data,
      companyId,
      passwordHash: hashedPassword,
    });

    const saved = await this.userRepo.save(user);
    const { passwordHash, refreshTokenHash, ...sanitized } = Array.isArray(saved) ? saved[0] : saved;
    return sanitized;
  }

  async update(id: string, data: any, companyId: string) {
    const user = await this.userRepo.findOne({ where: { id, companyId } });
    if (!user) throw new NotFoundException('User not found');

    if (data.password) {
      user.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    Object.assign(user, data);
    const saved = await this.userRepo.save(user);
    const { passwordHash, refreshTokenHash, ...sanitized } = Array.isArray(saved) ? saved[0] : saved;
    return sanitized;
  }

  async remove(id: string, companyId: string) {
    const user = await this.userRepo.findOne({ where: { id, companyId } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepo.softDelete(id);
    return { message: 'User deleted successfully' };
  }
}
