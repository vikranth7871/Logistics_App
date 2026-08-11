import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Try loading env file from current dir or apps/api/
const possibleEnvPaths = [
  'apps/api/.env.development',
  '.env.development',
  'apps/api/.env',
  '.env',
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const databaseUrl = process.env.DATABASE_URL;
const useSsl =
  process.env.DATABASE_SSL === 'true' ||
  Boolean(databaseUrl && databaseUrl.includes('neon.tech')) ||
  process.env.NODE_ENV === 'production';

const options: DataSourceOptions = databaseUrl
  ? {
      type: 'postgres',
      url: databaseUrl,
      entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
      migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
      synchronize: false,
      logging: true,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    }
  : {
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'lorry_erp',
      username: process.env.DATABASE_USER || 'erp_user',
      password: process.env.DATABASE_PASSWORD || 'erp_password',
      entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
      migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
      synchronize: false,
      logging: true,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    };

export const AppDataSource = new DataSource(options);
