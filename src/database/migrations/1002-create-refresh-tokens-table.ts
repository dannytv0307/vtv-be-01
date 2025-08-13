import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokensTable1734042000020 implements MigrationInterface {
  name = 'CreateRefreshTokensTable1734042000020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" BIGSERIAL NOT NULL,
        "user_id" bigint NOT NULL,
        "token" character varying(255) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "is_revoked" boolean NOT NULL DEFAULT false,
        "deleted_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_refresh_tokens_token" UNIQUE ("token"),
        CONSTRAINT "UQ_refresh_tokens_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "refresh_tokens" 
      ADD CONSTRAINT "FK_refresh_tokens_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_user_id"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
