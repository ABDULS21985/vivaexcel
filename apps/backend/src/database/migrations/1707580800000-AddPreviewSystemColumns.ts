import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreviewSystemColumns1707580800000
  implements MigrationInterface
{
  name = 'AddPreviewSystemColumns1707580800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new enum values to the existing digital_product_preview type enum
    await queryRunner.query(
      `ALTER TYPE "digital_product_previews_type_enum" ADD VALUE IF NOT EXISTS 'slide_image'`,
    );
    await queryRunner.query(
      `ALTER TYPE "digital_product_previews_type_enum" ADD VALUE IF NOT EXISTS 'code_snippet'`,
    );
    await queryRunner.query(
      `ALTER TYPE "digital_product_previews_type_enum" ADD VALUE IF NOT EXISTS 'live_screenshot'`,
    );
    await queryRunner.query(
      `ALTER TYPE "digital_product_previews_type_enum" ADD VALUE IF NOT EXISTS 'interactive_demo'`,
    );

    // Add new columns to the digital_product_previews table
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" ADD COLUMN "label" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" ADD COLUMN "width" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" ADD COLUMN "height" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" ADD COLUMN "storage_key" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" ADD COLUMN "thumbnail_storage_key" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" ADD COLUMN "is_watermarked" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" ADD COLUMN "metadata" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" ADD COLUMN "generation_status" character varying(20) NOT NULL DEFAULT 'completed'`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" ADD COLUMN "generation_error" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" ADD COLUMN "generated_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop added columns (reverse order)
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" DROP COLUMN IF EXISTS "generated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" DROP COLUMN IF EXISTS "generation_error"`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" DROP COLUMN IF EXISTS "generation_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" DROP COLUMN IF EXISTS "metadata"`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" DROP COLUMN IF EXISTS "is_watermarked"`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" DROP COLUMN IF EXISTS "thumbnail_storage_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" DROP COLUMN IF EXISTS "storage_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" DROP COLUMN IF EXISTS "height"`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" DROP COLUMN IF EXISTS "width"`,
    );
    await queryRunner.query(
      `ALTER TABLE "digital_product_previews" DROP COLUMN IF EXISTS "label"`,
    );

    // Note: PostgreSQL does not support removing values from an enum type.
    // The enum values (slide_image, code_snippet, live_screenshot, interactive_demo)
    // will remain in the type but are harmless if unused.
  }
}
