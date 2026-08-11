import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { UserRole } from '../../../common/decorators/roles.decorator';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string;

  @Column()
  name: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.DRIVER,
  })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  @Column({
    name: 'refresh_token_hash',
    type: 'text',
    nullable: true,
    select: false,
  })
  refreshTokenHash: string;

  @Column({ name: 'driver_id', type: 'uuid', nullable: true })
  driverId: string;
}
