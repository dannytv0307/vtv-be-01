import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1734042000010 implements MigrationInterface {
  name = 'CreateUsersTable1734042000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create auth_provider_enum type if not exists
    await queryRunner.query(`DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_provider_enum') THEN
        CREATE TYPE "public"."auth_provider_enum" AS ENUM('local', 'google', 'facebook');
      END IF;
    END$$;`);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" BIGSERIAL NOT NULL,
        "email" character varying(255),
        "password_hash" character varying(255),
        "display_name" character varying(255),
        "role_id" bigint,
        "provider" "public"."auth_provider_enum" NOT NULL DEFAULT 'local',
        "provider_id" character varying(255),
        "avatar_url" text,
        "deleted_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // Create index on email
    await queryRunner.query(`
      CREATE INDEX "IDX_97672ac88f789774dd47f7c8be3" ON "users" ("email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be3"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."auth_provider_enum"`);
  }
}
