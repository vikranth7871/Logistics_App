import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  companyId: string;
  driverId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Validates credentials. Called by LocalStrategy.
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getOne();

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  /**
   * Generates access + refresh token pair after successful login.
   */
  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const tokens = await this.generateTokens(user);

    // Store hashed refresh token in DB
    const hashedRefresh = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userRepo.update(user.id, {
      refreshTokenHash: hashedRefresh,
      lastLoginAt: new Date(),
    });

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        driverId: user.driverId || null,
      },
    };
  }

  /**
   * Refresh token flow — validates stored refresh token and issues new pair.
   * Implements token rotation: old refresh token is invalidated on each use.
   */
  async refresh(userId: string, refreshToken: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :id', { id: userId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getOne();

    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException({
        message: 'Access denied',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      // Possible token theft — clear all sessions
      await this.userRepo.update(userId, { refreshTokenHash: null });
      throw new ForbiddenException({
        message: 'Invalid refresh token. Please log in again.',
        code: 'REFRESH_TOKEN_REUSE',
      });
    }

    const tokens = await this.generateTokens(user);
    const hashedRefresh = await bcrypt.hash(tokens.refresh_token, 10);
    await this.userRepo.update(user.id, { refreshTokenHash: hashedRefresh });

    return { access_token: tokens.access_token, refresh_token: tokens.refresh_token };
  }

  /**
   * Logout — invalidates the refresh token in DB.
   */
  async logout(userId: string) {
    await this.userRepo.update(userId, { refreshTokenHash: null });
    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) throw new BadRequestException('User not found');

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException({
        message: 'Current password is incorrect',
        code: 'WRONG_CURRENT_PASSWORD',
      });
    }

    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepo.update(userId, { passwordHash: newHash, refreshTokenHash: null });
    return { message: 'Password changed successfully. Please log in again.' };
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException({ code: 'USER_NOT_FOUND' });
    return user;
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      driverId: user.driverId || undefined,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET', 'dev-jwt-refresh-secret-change-in-prod'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { access_token, refresh_token };
  }
}
