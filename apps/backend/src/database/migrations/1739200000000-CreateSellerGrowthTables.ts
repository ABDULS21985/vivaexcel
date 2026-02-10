import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSellerGrowthTables1739200000000 implements MigrationInterface {
  name = 'CreateSellerGrowthTables1739200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(
      `CREATE TYPE "seller_insights_insight_type_enum" AS ENUM ('pricing', 'listing_quality', 'marketing', 'performance', 'opportunity')`,
    );
    await queryRunner.query(
      `CREATE TYPE "seller_insights_priority_enum" AS ENUM ('high', 'medium', 'low')`,
    );
    await queryRunner.query(
      `CREATE TYPE "seller_insights_status_enum" AS ENUM ('pending', 'viewed', 'acted_on', 'dismissed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "seller_goals_type_enum" AS ENUM ('revenue', 'sales', 'products', 'rating')`,
    );
    await queryRunner.query(
      `CREATE TYPE "seller_goals_status_enum" AS ENUM ('active', 'achieved', 'missed', 'canceled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "seller_resources_type_enum" AS ENUM ('tutorial', 'guide', 'video', 'best_practice', 'success_story')`,
    );

    // Create seller_insights table
    await queryRunner.query(`
      CREATE TABLE "seller_insights" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "seller_id" uuid NOT NULL,
        "insight_type" "seller_insights_insight_type_enum" NOT NULL,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "action_items" jsonb NOT NULL,
        "priority" "seller_insights_priority_enum" NOT NULL,
        "status" "seller_insights_status_enum" NOT NULL DEFAULT 'pending',
        "metadata" jsonb,
        "generated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_seller_insights" PRIMARY KEY ("id"),
        CONSTRAINT "FK_seller_insights_seller" FOREIGN KEY ("seller_id") REFERENCES "seller_profiles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_seller_insights_seller_id" ON "seller_insights" ("seller_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_seller_insights_seller_status" ON "seller_insights" ("seller_id", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_seller_insights_generated_at" ON "seller_insights" ("generated_at")`);

    // Create seller_goals table
    await queryRunner.query(`
      CREATE TABLE "seller_goals" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "seller_id" uuid NOT NULL,
        "type" "seller_goals_type_enum" NOT NULL,
        "title" character varying,
        "target_value" decimal(12,2) NOT NULL,
        "current_value" decimal(12,2) NOT NULL DEFAULT 0,
        "deadline" TIMESTAMP NOT NULL,
        "status" "seller_goals_status_enum" NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_seller_goals" PRIMARY KEY ("id"),
        CONSTRAINT "FK_seller_goals_seller" FOREIGN KEY ("seller_id") REFERENCES "seller_profiles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_seller_goals_seller_id" ON "seller_goals" ("seller_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_seller_goals_seller_status" ON "seller_goals" ("seller_id", "status")`);

    // Create market_benchmarks table
    await queryRunner.query(`
      CREATE TABLE "market_benchmarks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_type" "digital_products_type_enum" NOT NULL,
        "category_id" uuid,
        "average_price" decimal(12,2) NOT NULL,
        "median_price" decimal(12,2) NOT NULL,
        "price_range" jsonb NOT NULL,
        "average_rating" decimal(3,2) NOT NULL,
        "average_sales_per_month" decimal(12,2) NOT NULL,
        "top_seller_metrics" jsonb NOT NULL,
        "sample_size" integer NOT NULL,
        "calculated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_market_benchmarks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_market_benchmarks_category" FOREIGN KEY ("category_id") REFERENCES "digital_product_categories"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_market_benchmarks_type_category" ON "market_benchmarks" ("product_type", "category_id")`);

    // Create seller_resources table
    await queryRunner.query(`
      CREATE TABLE "seller_resources" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "type" "seller_resources_type_enum" NOT NULL,
        "content" text NOT NULL,
        "excerpt" character varying,
        "video_url" character varying,
        "thumbnail_url" character varying,
        "category" character varying,
        "tags" text,
        "order" integer NOT NULL DEFAULT 0,
        "is_published" boolean NOT NULL DEFAULT false,
        "published_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_seller_resources" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_seller_resources_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_seller_resources_slug" ON "seller_resources" ("slug")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "seller_resources"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "market_benchmarks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "seller_goals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "seller_insights"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "seller_resources_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "seller_goals_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "seller_goals_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "seller_insights_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "seller_insights_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "seller_insights_insight_type_enum"`);
  }
}
