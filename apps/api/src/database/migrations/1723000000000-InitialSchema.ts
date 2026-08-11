import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema migration — creates all core tables.
 * Run with: pnpm db:migrate
 */
export class InitialSchema1723000000000 implements MigrationInterface {
  name = 'InitialSchema1723000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── USERS ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('admin','manager','accountant','dispatcher','driver');

      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" UUID,
        "name" VARCHAR NOT NULL,
        "email" VARCHAR(100) NOT NULL UNIQUE,
        "password_hash" VARCHAR NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'driver',
        "phone" VARCHAR,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "last_login_at" TIMESTAMPTZ,
        "refresh_token_hash" TEXT,
        "driver_id" UUID,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );
    `);

    // ── VEHICLES ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "vehicle_status_enum" AS ENUM ('active','in_trip','maintenance','inactive');
      CREATE TYPE "fuel_type_enum" AS ENUM ('diesel','petrol','cng','electric');

      CREATE TABLE "vehicles" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" UUID NOT NULL,
        "registration_number" VARCHAR(20) NOT NULL UNIQUE,
        "make" VARCHAR,
        "model" VARCHAR,
        "year" INT,
        "capacity_tons" DECIMAL(8,2),
        "fuel_type" "fuel_type_enum" NOT NULL DEFAULT 'diesel',
        "status" "vehicle_status_enum" NOT NULL DEFAULT 'active',
        "current_odometer" DECIMAL(10,2),
        "engine_number" VARCHAR,
        "chassis_number" VARCHAR,
        "color" VARCHAR,
        "next_service_odometer" DECIMAL(10,2),
        "next_service_date" DATE,
        "notes" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );

      CREATE INDEX "IDX_vehicles_company" ON "vehicles" ("company_id");
      CREATE INDEX "IDX_vehicles_status" ON "vehicles" ("status");
    `);

    // ── VEHICLE DOCUMENTS ─────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "document_type_enum" AS ENUM ('insurance','permit','fitness','rc','road_tax','pollution','other');

      CREATE TABLE "vehicle_documents" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "vehicle_id" UUID NOT NULL REFERENCES "vehicles"("id") ON DELETE CASCADE,
        "type" "document_type_enum" NOT NULL,
        "file_url" TEXT NOT NULL,
        "file_name" VARCHAR,
        "expiry_date" DATE,
        "issue_date" DATE,
        "document_number" VARCHAR,
        "notes" TEXT,
        "uploaded_by" UUID,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );

      CREATE INDEX "IDX_vehicle_documents_vehicle" ON "vehicle_documents" ("vehicle_id");
      CREATE INDEX "IDX_vehicle_documents_expiry" ON "vehicle_documents" ("expiry_date");
    `);

    // ── DRIVERS ───────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "driver_status_enum" AS ENUM ('active','on_trip','on_leave','inactive');
      CREATE TYPE "license_type_enum" AS ENUM ('LMV','HMV','HTV','HAZMAT');

      CREATE TABLE "drivers" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" UUID NOT NULL,
        "name" VARCHAR NOT NULL,
        "phone" VARCHAR NOT NULL,
        "email" VARCHAR,
        "license_number" VARCHAR,
        "license_expiry" DATE,
        "license_type" "license_type_enum",
        "status" "driver_status_enum" NOT NULL DEFAULT 'active',
        "joining_date" DATE,
        "address" TEXT,
        "emergency_contact_name" VARCHAR,
        "emergency_contact_phone" VARCHAR,
        "assigned_vehicle_id" UUID,
        "user_id" UUID,
        "photo_url" TEXT,
        "notes" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );

      CREATE INDEX "IDX_drivers_company" ON "drivers" ("company_id");
      CREATE INDEX "IDX_drivers_status" ON "drivers" ("status");
      CREATE INDEX "IDX_drivers_license_expiry" ON "drivers" ("license_expiry");
    `);

    // ── CUSTOMERS ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" UUID NOT NULL,
        "name" VARCHAR NOT NULL,
        "phone" VARCHAR,
        "email" VARCHAR,
        "gst_number" VARCHAR(20),
        "billing_address" TEXT,
        "contact_person" VARCHAR,
        "credit_limit" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "credit_days" INT NOT NULL DEFAULT 30,
        "outstanding_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "notes" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );

      CREATE INDEX "IDX_customers_company" ON "customers" ("company_id");
    `);

    // ── TRIPS ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "trip_status_enum" AS ENUM ('draft','assigned','in_progress','delivered','completed','cancelled');

      CREATE TABLE "trips" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" UUID NOT NULL,
        "trip_number" VARCHAR(30) NOT NULL UNIQUE,
        "vehicle_id" UUID REFERENCES "vehicles"("id"),
        "driver_id" UUID REFERENCES "drivers"("id"),
        "customer_id" UUID REFERENCES "customers"("id"),
        "origin" VARCHAR(255) NOT NULL,
        "destination" VARCHAR(255) NOT NULL,
        "status" "trip_status_enum" NOT NULL DEFAULT 'draft',
        "scheduled_start" TIMESTAMPTZ,
        "actual_start" TIMESTAMPTZ,
        "scheduled_end" TIMESTAMPTZ,
        "actual_end" TIMESTAMPTZ,
        "start_odometer" DECIMAL(10,2),
        "end_odometer" DECIMAL(10,2),
        "distance_km" DECIMAL(8,2),
        "freight_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "load_description" TEXT,
        "load_weight_tons" DECIMAL(8,2),
        "delivery_proof_url" TEXT,
        "notes" TEXT,
        "created_by" UUID,
        "cancelled_reason" TEXT,
        "pickup_confirmed_at" TIMESTAMPTZ,
        "delivered_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );

      CREATE INDEX "IDX_trips_company" ON "trips" ("company_id");
      CREATE INDEX "IDX_trips_status" ON "trips" ("status");
      CREATE INDEX "IDX_trips_vehicle" ON "trips" ("vehicle_id");
      CREATE INDEX "IDX_trips_driver" ON "trips" ("driver_id");
      CREATE INDEX "IDX_trips_customer" ON "trips" ("customer_id");
      CREATE INDEX "IDX_trips_scheduled_start" ON "trips" ("scheduled_start");
    `);

    // ── FUEL ENTRIES ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "payment_mode_enum" AS ENUM ('cash','card','fleet_card','credit','upi');

      CREATE TABLE "fuel_entries" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" UUID NOT NULL,
        "vehicle_id" UUID NOT NULL REFERENCES "vehicles"("id"),
        "trip_id" UUID REFERENCES "trips"("id"),
        "date" DATE NOT NULL,
        "location" VARCHAR,
        "fuel_quantity_liters" DECIMAL(8,2) NOT NULL,
        "price_per_liter" DECIMAL(8,2) NOT NULL,
        "total_amount" DECIMAL(10,2) NOT NULL,
        "odometer_reading" DECIMAL(10,2),
        "mileage_kmpl" DECIMAL(6,2),
        "payment_mode" "payment_mode_enum" NOT NULL DEFAULT 'cash',
        "bill_number" VARCHAR,
        "receipt_url" TEXT,
        "recorded_by" UUID,
        "notes" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );

      CREATE INDEX "IDX_fuel_vehicle" ON "fuel_entries" ("vehicle_id");
      CREATE INDEX "IDX_fuel_date" ON "fuel_entries" ("date");
    `);

    // ── EXPENSES ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "expense_category_enum" AS ENUM (
        'toll','driver_allowance','repair','tyre_replacement','spare_parts',
        'loading_unloading','brokerage','rto_fine','weighbridge','accommodation','miscellaneous'
      );
      CREATE TYPE "expense_payment_mode_enum" AS ENUM ('cash','fastag','card','upi','bank_transfer');

      CREATE TABLE "expenses" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" UUID NOT NULL,
        "vehicle_id" UUID,
        "trip_id" UUID REFERENCES "trips"("id"),
        "driver_id" UUID,
        "category" "expense_category_enum" NOT NULL,
        "amount" DECIMAL(10,2) NOT NULL,
        "date" DATE NOT NULL,
        "description" TEXT,
        "payment_mode" "expense_payment_mode_enum" NOT NULL DEFAULT 'cash',
        "receipt_url" TEXT,
        "recorded_by" UUID,
        "approved_by" UUID,
        "is_approved" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );

      CREATE INDEX "IDX_expenses_company" ON "expenses" ("company_id");
      CREATE INDEX "IDX_expenses_trip" ON "expenses" ("trip_id");
      CREATE INDEX "IDX_expenses_date" ON "expenses" ("date");
    `);

    // ── INVOICES ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "invoice_status_enum" AS ENUM ('draft','issued','partially_paid','paid','overdue','cancelled');

      CREATE TABLE "invoices" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" UUID NOT NULL,
        "invoice_number" VARCHAR(30) NOT NULL UNIQUE,
        "customer_id" UUID NOT NULL REFERENCES "customers"("id"),
        "status" "invoice_status_enum" NOT NULL DEFAULT 'draft',
        "invoice_date" DATE NOT NULL,
        "due_date" DATE,
        "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "tax_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "grand_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "balance_due" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "is_interstate" BOOLEAN NOT NULL DEFAULT false,
        "customer_gst" VARCHAR,
        "company_gst" VARCHAR,
        "line_items" JSONB NOT NULL DEFAULT '[]',
        "payment_terms" VARCHAR,
        "notes" TEXT,
        "created_by" UUID,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      );

      CREATE INDEX "IDX_invoices_company" ON "invoices" ("company_id");
      CREATE INDEX "IDX_invoices_customer" ON "invoices" ("customer_id");
      CREATE INDEX "IDX_invoices_status" ON "invoices" ("status");
    `);

    // ── NOTIFICATIONS ─────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL,
        "company_id" UUID NOT NULL,
        "type" VARCHAR NOT NULL,
        "title" VARCHAR NOT NULL,
        "message" TEXT NOT NULL,
        "severity" VARCHAR NOT NULL DEFAULT 'info',
        "entity_type" VARCHAR,
        "entity_id" UUID,
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "read_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX "IDX_notifications_user" ON "notifications" ("user_id");
      CREATE INDEX "IDX_notifications_unread" ON "notifications" ("user_id", "is_read");
    `);

    // ── AUDIT LOGS ────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" UUID NOT NULL,
        "user_id" UUID,
        "user_name" VARCHAR,
        "user_role" VARCHAR,
        "action" VARCHAR NOT NULL,
        "entity_type" VARCHAR NOT NULL,
        "entity_id" UUID,
        "before_data" JSONB,
        "after_data" JSONB,
        "ip_address" VARCHAR,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX "IDX_audit_company" ON "audit_logs" ("company_id");
      CREATE INDEX "IDX_audit_entity" ON "audit_logs" ("entity_type", "entity_id");
      CREATE INDEX "IDX_audit_created" ON "audit_logs" ("created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoices" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "expenses" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fuel_entries" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "trips" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drivers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicle_documents" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "invoice_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "expense_category_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "expense_payment_mode_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_mode_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "trip_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "driver_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "license_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "document_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vehicle_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "fuel_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
