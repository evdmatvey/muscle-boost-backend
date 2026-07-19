import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorkoutSessionsTables1752200000000 implements MigrationInterface {
  public readonly name = 'CreateWorkoutSessionsTables1752200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "session_status" AS ENUM (
        'PLANNED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "workout_sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "plan_id" uuid,
        "started_at" TIMESTAMPTZ NOT NULL,
        "completed_at" TIMESTAMPTZ,
        "status" "session_status" NOT NULL,
        "workout_type" "workout_type" NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_workout_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_workout_sessions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id"),
        CONSTRAINT "FK_workout_sessions_plan_id" FOREIGN KEY ("plan_id") REFERENCES "workout_plans"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_workout_sessions_user_id" ON "workout_sessions" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_workout_sessions_user_id_started_at"
      ON "workout_sessions" ("user_id", "started_at")
    `);

    await queryRunner.query(`
      CREATE TABLE "session_exercises" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "session_id" uuid NOT NULL,
        "exercise_id" uuid NOT NULL,
        "order_index" integer NOT NULL,
        "is_skipped" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_session_exercises" PRIMARY KEY ("id"),
        CONSTRAINT "FK_session_exercises_session_id" FOREIGN KEY ("session_id") REFERENCES "workout_sessions"("id"),
        CONSTRAINT "FK_session_exercises_exercise_id" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_session_exercises_session_id" ON "session_exercises" ("session_id")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_session_exercises_session_id_order_index_active"
      ON "session_exercises" ("session_id", "order_index")
      WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "set_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "session_exercise_id" uuid NOT NULL,
        "set_number" integer NOT NULL,
        "planned_reps" integer NOT NULL,
        "planned_weight_kg" numeric(6, 2) NOT NULL,
        "actual_reps" integer,
        "actual_weight_kg" numeric(6, 2),
        "rpe" numeric(3, 1),
        "is_warmup" boolean NOT NULL DEFAULT false,
        "completed_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_set_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_set_logs_session_exercise_id" FOREIGN KEY ("session_exercise_id") REFERENCES "session_exercises"("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_set_logs_session_exercise_id" ON "set_logs" ("session_exercise_id")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_set_logs_session_exercise_id_set_number_active"
      ON "set_logs" ("session_exercise_id", "set_number")
      WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_set_logs_session_exercise_id_set_number_active"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_set_logs_session_exercise_id"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "set_logs"`);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_session_exercises_session_id_order_index_active"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_session_exercises_session_id"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "session_exercises"`);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_workout_sessions_user_id_started_at"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_workout_sessions_user_id"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_sessions"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "session_status"`);
  }
}
