import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCupoMaximoAndUpdateSala14Aforo1794100000000
  implements MigrationInterface
{
  name = 'AddCupoMaximoAndUpdateSala14Aforo1794100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "subEvento"
      ADD COLUMN IF NOT EXISTS "cupoMaximo" integer;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'CHK_subEvento_cupoMaximo_positivo'
        ) THEN
          ALTER TABLE "subEvento"
          ADD CONSTRAINT "CHK_subEvento_cupoMaximo_positivo"
          CHECK ("cupoMaximo" IS NULL OR "cupoMaximo" > 0);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      UPDATE recinto
      SET aforo = 100
      WHERE "idRecinto" = 4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE recinto
      SET aforo = 50
      WHERE "idRecinto" = 4;
    `);

    await queryRunner.query(`
      ALTER TABLE "subEvento"
      DROP CONSTRAINT IF EXISTS "CHK_subEvento_cupoMaximo_positivo";
    `);

    await queryRunner.query(`
      ALTER TABLE "subEvento"
      DROP COLUMN IF EXISTS "cupoMaximo";
    `);
  }
}
