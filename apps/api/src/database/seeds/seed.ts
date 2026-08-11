/**
 * Database Seed Script
 * Creates: 1 admin user, 5 driver user accounts, 17 demo vehicles, 5 drivers, 3 customers
 *
 * Usage: pnpm db:seed
 * Requires: DATABASE_* env vars set and DB running
 */

import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';

const COMPANY_ID = '00000000-0000-0000-0000-000000000001';

const VEHICLES = [
  { reg: 'TN01AB1234', make: 'Tata', model: 'Prima 5530.S', year: 2021, capacity: 25, odometer: 45230 },
  { reg: 'TN01AB2345', make: 'Tata', model: 'LPT 3118', year: 2020, capacity: 15, odometer: 62100 },
  { reg: 'TN01CD3456', make: 'Ashok Leyland', model: 'Captain 5525', year: 2022, capacity: 25, odometer: 28900 },
  { reg: 'TN01CD4567', make: 'Ashok Leyland', model: 'Boss 1921', year: 2019, capacity: 19, odometer: 89400 },
  { reg: 'TN02EF5678', make: 'Mahindra', model: 'Blazo X 35', year: 2021, capacity: 35, odometer: 41200 },
  { reg: 'TN02EF6789', make: 'Mahindra', model: 'Furio 14', year: 2020, capacity: 14, odometer: 73500 },
  { reg: 'TN03GH7890', make: 'Eicher', model: 'Pro 6035', year: 2022, capacity: 22, odometer: 19800 },
  { reg: 'TN03GH8901', make: 'Eicher', model: 'Pro 3015', year: 2020, capacity: 10, odometer: 55600 },
  { reg: 'TN04IJ9012', make: 'BharatBenz', model: '4228R', year: 2021, capacity: 40, odometer: 38700 },
  { reg: 'TN04IJ0123', make: 'BharatBenz', model: '3523R', year: 2023, capacity: 35, odometer: 12300 },
  { reg: 'TN05KL1234', make: 'Tata', model: 'Ultra T.7', year: 2020, capacity: 7, odometer: 91200 },
  { reg: 'TN05KL2345', make: 'Tata', model: 'Ultra 3518', year: 2021, capacity: 18, odometer: 44100 },
  { reg: 'TN06MN3456', make: 'Ashok Leyland', model: 'Dost Strong', year: 2022, capacity: 1.5, odometer: 31500 },
  { reg: 'TN06MN4567', make: 'Volvo', model: 'FH 440', year: 2020, capacity: 25, odometer: 112000 },
  { reg: 'TN07OP5678', make: 'Mercedes', model: 'Actros 2544', year: 2021, capacity: 25, odometer: 67800 },
  { reg: 'TN07OP6789', make: 'Scania', model: 'G410', year: 2022, capacity: 25, odometer: 22100 },
  { reg: 'TN08QR7890', make: 'Tata', model: 'Signa 5530.S', year: 2023, capacity: 30, odometer: 8900 },
];

const DRIVERS = [
  { name: 'Rajan S', email: 'rajan@lorryerp.com', phone: '9876543210', license: 'TN0120200012345', licenseType: 'HMV' },
  { name: 'Kumar M', email: 'kumar@lorryerp.com', phone: '9876543211', license: 'TN0120190054321', licenseType: 'HMV' },
  { name: 'Selvam P', email: 'driver@lorryerp.com', phone: '9876543212', license: 'TN0220210087654', licenseType: 'HTV' },
  { name: 'Murugan K', email: 'murugan@lorryerp.com', phone: '9876543213', license: 'TN0320180034567', licenseType: 'HMV' },
  { name: 'Arjun R', email: 'arjun@lorryerp.com', phone: '9876543214', license: 'TN0420220011223', licenseType: 'HMV' },
];

const CUSTOMERS = [
  { name: 'ABC Traders Pvt Ltd', phone: '9944112233', gst: '33AABCA1234B1ZP', contact: 'Arun' },
  { name: 'Chennai Auto Parts Co', phone: '9944223344', gst: '33AACCA5678C1ZQ', contact: 'Priya' },
  { name: 'South India Logistics', phone: '9944334455', gst: '33AADSA9012D1ZR', contact: 'Vijay' },
];

async function seed() {
  console.log('🌱 Starting database seed...');

  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Admin user
    const adminPasswordHash = await bcrypt.hash('Admin@123456', 12);
    await queryRunner.query(`
      INSERT INTO users (id, company_id, name, email, password_hash, role)
      VALUES (gen_random_uuid(), $1, 'System Admin', 'admin@lorryerp.com', $2, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [COMPANY_ID, adminPasswordHash]);

    // Vehicles
    for (const v of VEHICLES) {
      await queryRunner.query(`
        INSERT INTO vehicles (id, company_id, registration_number, make, model, year, capacity_tons, current_odometer, fuel_type)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'diesel')
        ON CONFLICT (registration_number) DO NOTHING
      `, [COMPANY_ID, v.reg, v.make, v.model, v.year, v.capacity, v.odometer]);
    }

    // Drivers & Driver User Logins
    const driverPasswordHash = await bcrypt.hash('Driver@123456', 12);

    for (const d of DRIVERS) {
      const result = await queryRunner.query(`
        INSERT INTO drivers (id, company_id, name, phone, license_number, license_type, joining_date)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, '2021-01-01')
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [COMPANY_ID, d.name, d.phone, d.license, d.licenseType]);

      let driverId = result[0]?.id;

      if (!driverId) {
        const existing = await queryRunner.query(
          `SELECT id FROM drivers WHERE phone = $1 OR license_number = $2 LIMIT 1`,
          [d.phone, d.license]
        );
        driverId = existing[0]?.id;
      }

      if (driverId) {
        await queryRunner.query(`
          INSERT INTO users (id, company_id, name, email, password_hash, role, phone, driver_id)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, 'driver', $5, $6)
          ON CONFLICT (email) DO NOTHING
        `, [COMPANY_ID, d.name, d.email, driverPasswordHash, d.phone, driverId]);
      }
    }

    // Customers
    for (const c of CUSTOMERS) {
      await queryRunner.query(`
        INSERT INTO customers (id, company_id, name, phone, gst_number, contact_person, credit_days, credit_limit)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 30, 500000)
        ON CONFLICT DO NOTHING
      `, [COMPANY_ID, c.name, c.phone, c.gst, c.contact]);
    }

    await queryRunner.commitTransaction();

    console.log('✅ Seed complete:');
    console.log(`   👤 Admin: admin@lorryerp.com / Admin@123456`);
    console.log(`   👷 Default Driver: driver@lorryerp.com / Driver@123456`);
    console.log(`   🚛 ${VEHICLES.length} vehicles`);
    console.log(`   👷 ${DRIVERS.length} driver accounts created & linked`);
    console.log(`   🏢 ${CUSTOMERS.length} customers`);

  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

seed();
