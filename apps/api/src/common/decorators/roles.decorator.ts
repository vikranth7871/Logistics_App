import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ACCOUNTANT = 'accountant',
  DISPATCHER = 'dispatcher',
  DRIVER = 'driver',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
