import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserProfilesTable1751900000000 implements MigrationInterface {
  public readonly name = 'CreateUserProfilesTable1751900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "display_name" character varying(100),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_user_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_profiles_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_user_profiles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_user_profiles_user_id" ON "user_profiles" ("user_id")
    `);

    await queryRunner.query(`
      INSERT INTO "user_profiles" ("user_id", "display_name")
      SELECT "id", NULL
      FROM "users"
      WHERE "deleted_at" IS NULL
        AND NOT EXISTS (
          SELECT 1
          FROM "user_profiles" AS "profile"
          WHERE "profile"."user_id" = "users"."id"
            AND "profile"."deleted_at" IS NULL
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_user_profiles_user_id"`);
    await queryRunner.query(`DROP TABLE "user_profiles"`);
  }
}
