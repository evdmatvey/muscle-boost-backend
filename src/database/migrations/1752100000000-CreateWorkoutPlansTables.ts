import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorkoutPlansTables1752100000000 implements MigrationInterface {
  public readonly name = 'CreateWorkoutPlansTables1752100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "workout_type" AS ENUM (
        'LEGS',
        'ARMS',
        'CHEST',
        'BACK',
        'SHOULDERS',
        'BICEPS',
        'TRICEPS',
        'ABS',
        'FOREARMS',
        'CALVES',
        'GLUTES',
        'CHEST_BICEPS',
        'BACK_TRICEPS',
        'SHOULDERS_ARMS',
        'LEGS_SHOULDERS',
        'CHEST_BACK',
        'BICEPS_TRICEPS',
        'FULL_BODY',
        'UPPER_BODY',
        'LOWER_BODY',
        'PUSH',
        'PULL'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "workout_plans" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "name" character varying(150) NOT NULL,
        "notes" text,
        "workout_type" "workout_type" NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_workout_plans" PRIMARY KEY ("id"),
        CONSTRAINT "FK_workout_plans_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_workout_plans_user_id" ON "workout_plans" ("user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "plan_exercises" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "plan_id" uuid NOT NULL,
        "exercise_id" uuid NOT NULL,
        "order_index" integer NOT NULL,
        "notes" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_plan_exercises" PRIMARY KEY ("id"),
        CONSTRAINT "FK_plan_exercises_plan_id" FOREIGN KEY ("plan_id") REFERENCES "workout_plans"("id"),
        CONSTRAINT "FK_plan_exercises_exercise_id" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_plan_exercises_plan_id" ON "plan_exercises" ("plan_id")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_plan_exercises_plan_id_order_index_active"
      ON "plan_exercises" ("plan_id", "order_index")
      WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "plan_sets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "plan_exercise_id" uuid NOT NULL,
        "set_number" integer NOT NULL,
        "target_reps" integer NOT NULL,
        "target_weight_kg" numeric(6, 2) NOT NULL,
        "target_rest_sec" integer NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_plan_sets" PRIMARY KEY ("id"),
        CONSTRAINT "FK_plan_sets_plan_exercise_id" FOREIGN KEY ("plan_exercise_id") REFERENCES "plan_exercises"("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_plan_sets_plan_exercise_id" ON "plan_sets" ("plan_exercise_id")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_plan_sets_plan_exercise_id_set_number_active"
      ON "plan_sets" ("plan_exercise_id", "set_number")
      WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_plan_sets_plan_exercise_id_set_number_active"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_plan_sets_plan_exercise_id"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "plan_sets"`);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_plan_exercises_plan_id_order_index_active"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_plan_exercises_plan_id"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "plan_exercises"`);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_workout_plans_user_id"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_plans"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "workout_type"`);
  }
}
