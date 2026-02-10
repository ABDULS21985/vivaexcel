import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMonitoringTables1739300000000 implements MigrationInterface {
  name = 'CreateMonitoringTables1739300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(
      `CREATE TYPE "service_status_enum" AS ENUM ('UP', 'DEGRADED', 'DOWN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "incident_severity_enum" AS ENUM ('P1', 'P2', 'P3', 'P4')`,
    );
    await queryRunner.query(
      `CREATE TYPE "incident_status_enum" AS ENUM ('INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "alert_condition_enum" AS ENUM ('GT', 'LT', 'EQ', 'GTE', 'LTE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "alert_channel_enum" AS ENUM ('EMAIL', 'WEBHOOK', 'SLACK')`,
    );
    await queryRunner.query(
      `CREATE TYPE "web_vital_metric_enum" AS ENUM ('LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP')`,
    );
    await queryRunner.query(
      `CREATE TYPE "web_vital_rating_enum" AS ENUM ('GOOD', 'NEEDS_IMPROVEMENT', 'POOR')`,
    );

    // Create service_statuses table
    await queryRunner.query(`
      CREATE TABLE "service_statuses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "service_name" varchar NOT NULL,
        "display_name" varchar NOT NULL,
        "status" "service_status_enum" NOT NULL DEFAULT 'UP',
        "latency" integer,
        "last_checked_at" TIMESTAMP,
        "metadata" jsonb,
        "uptime_percentage" decimal(5,2) NOT NULL DEFAULT 100.00,
        CONSTRAINT "PK_service_statuses" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_service_statuses_service_name" UNIQUE ("service_name")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_service_status_service_name" ON "service_statuses" ("service_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_service_status_status" ON "service_statuses" ("status")`,
    );

    // Create incident_logs table
    await queryRunner.query(`
      CREATE TABLE "incident_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "title" varchar NOT NULL,
        "description" text NOT NULL,
        "severity" "incident_severity_enum" NOT NULL,
        "status" "incident_status_enum" NOT NULL DEFAULT 'INVESTIGATING',
        "services_affected" jsonb NOT NULL DEFAULT '[]',
        "timeline" jsonb NOT NULL DEFAULT '[]',
        "started_at" TIMESTAMP NOT NULL DEFAULT now(),
        "resolved_at" TIMESTAMP,
        "postmortem_url" varchar,
        "acknowledged_by" varchar,
        CONSTRAINT "PK_incident_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_incident_severity" ON "incident_logs" ("severity")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_incident_status" ON "incident_logs" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_incident_started_at" ON "incident_logs" ("started_at")`,
    );

    // Create alert_rules table
    await queryRunner.query(`
      CREATE TABLE "alert_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" varchar NOT NULL,
        "description" text,
        "metric" varchar NOT NULL,
        "condition" "alert_condition_enum" NOT NULL,
        "threshold" decimal(12,4) NOT NULL,
        "duration" integer NOT NULL,
        "evaluation_interval" integer NOT NULL DEFAULT 60,
        "channel" "alert_channel_enum" NOT NULL DEFAULT 'EMAIL',
        "recipients" jsonb NOT NULL DEFAULT '[]',
        "is_active" boolean NOT NULL DEFAULT true,
        "cooldown_minutes" integer NOT NULL DEFAULT 30,
        "last_triggered_at" TIMESTAMP,
        "last_value" decimal(12,4),
        "trigger_count" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_alert_rules" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_alert_rule_is_active" ON "alert_rules" ("is_active")`,
    );

    // Create performance_budgets table
    await queryRunner.query(`
      CREATE TABLE "performance_budgets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "route" varchar NOT NULL,
        "metric_name" "web_vital_metric_enum" NOT NULL,
        "budget_value" decimal(8,3) NOT NULL,
        "current_p75" decimal(8,3),
        "current_p99" decimal(8,3),
        "is_compliant" boolean NOT NULL DEFAULT true,
        "sample_count" integer NOT NULL DEFAULT 0,
        "last_reported_at" TIMESTAMP,
        CONSTRAINT "PK_performance_budgets" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_perf_budget_route_metric" ON "performance_budgets" ("route", "metric_name")`,
    );

    // Create web_vital_reports table (no soft delete)
    await queryRunner.query(`
      CREATE TABLE "web_vital_reports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "route" varchar NOT NULL,
        "metric_name" "web_vital_metric_enum" NOT NULL,
        "value" decimal(8,3) NOT NULL,
        "rating" "web_vital_rating_enum" NOT NULL,
        "user_agent" varchar,
        "country" varchar(2),
        "connection_type" varchar,
        CONSTRAINT "PK_web_vital_reports" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_wvr_route" ON "web_vital_reports" ("route")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_wvr_route_metric_created" ON "web_vital_reports" ("route", "metric_name", "created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "web_vital_reports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "performance_budgets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "alert_rules"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "incident_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "service_statuses"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "web_vital_rating_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "web_vital_metric_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "alert_channel_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "alert_condition_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "incident_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "incident_severity_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "service_status_enum"`);
  }
}
