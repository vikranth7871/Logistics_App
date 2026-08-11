import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { TripsModule } from './modules/trips/trips.module';
import { FuelModule } from './modules/fuel/fuel.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { CustomersModule } from './modules/customers/customers.module';
import { BillingModule } from './modules/billing/billing.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { StorageModule } from './modules/storage/storage.module';
import { GpsModule } from './modules/gps/gps.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    // Config — load .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),

    // PostgreSQL via TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),

    // Redis-backed job queues (BullMQ)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD') || undefined,
        },
      }),
    }),

    // Cron jobs
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    FleetModule,
    DriversModule,
    TripsModule,
    FuelModule,
    ExpensesModule,
    MaintenanceModule,
    CustomersModule,
    BillingModule,
    ReportsModule,
    NotificationsModule,
    AuditModule,
    StorageModule,
    GpsModule,
  ],
})
export class AppModule {}
