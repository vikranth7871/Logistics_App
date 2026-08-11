import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = config.get<string>('DATABASE_URL');
  const useSsl =
    config.get<string>('DATABASE_SSL') === 'true' ||
    Boolean(databaseUrl && databaseUrl.includes('neon.tech')) ||
    config.get('NODE_ENV') === 'production';

  const baseConfig = {
    type: 'postgres' as const,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
    synchronize: config.get<boolean>('DATABASE_SYNC', false),
    logging: config.get<boolean>('DATABASE_LOGGING', false),
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  };

  if (databaseUrl) {
    return {
      ...baseConfig,
      url: databaseUrl,
    } as TypeOrmModuleOptions;
  }

  return {
    ...baseConfig,
    host: config.get('DATABASE_HOST', 'localhost'),
    port: config.get<number>('DATABASE_PORT', 5432),
    database: config.get('DATABASE_NAME', 'lorry_erp'),
    username: config.get('DATABASE_USER', 'erp_user'),
    password: config.get('DATABASE_PASSWORD', 'erp_password'),
  } as TypeOrmModuleOptions;
};
