import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFechaToVerificacion1793245000000 implements MigrationInterface {
  name = 'AddFechaToVerificacion1793245000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "verificacion" ADD COLUMN IF NOT EXISTS "fecha" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "verificacion" DROP COLUMN IF EXISTS "fecha";`,
    );
  }
}
