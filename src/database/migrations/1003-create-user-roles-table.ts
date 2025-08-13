import { MigrationInterface, QueryRunner } from 'typeorm';

export class OneRolePerUser1734042000030 implements MigrationInterface {
  name = 'OneRolePerUser1734042000030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure role_type_enum exists
    await queryRunner.query(`DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_type_enum') THEN
        CREATE TYPE role_type_enum AS ENUM ('admin', 'user', 'moderator');
      END IF;
    END$$;`);

    // Create roles table if missing
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id BIGSERIAL PRIMARY KEY,
        type role_type_enum UNIQUE NOT NULL,
        name varchar(255),
        description text,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Add role_id to users
    await queryRunner.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id bigint`);

    // Drop junction table if exists
    await queryRunner.query(`DROP TABLE IF EXISTS user_roles`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS role_id`);
    // keep roles table and enum for compatibility
  }
}
