import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModificacionEquiposyEtiquetas1793484466731 implements MigrationInterface {
  name = 'ModificacionEquiposyEtiquetas1793484466731';

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`DROP TABLE IF EXISTS "eventoEtiqueta" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tipoEtiqueta" CASCADE;`);
    await queryRunner.query(`
      ALTER TABLE "recinto" DROP COLUMN IF EXISTS "computadorasDisponibles";
    `);

    await queryRunner.query(`
      ALTER TABLE "estadoEquipo" 
      ADD COLUMN IF NOT EXISTS "numeroEquipo" integer NOT NULL DEFAULT 1;
    `);
    
    await queryRunner.query(`
      ALTER TABLE "estadoEquipo" 
      ALTER COLUMN estado SET DEFAULT true;
    `);

    const laboratorios = await queryRunner.query(`
      SELECT "idRecinto" FROM "recinto" WHERE nombre ILIKE '%Laboratorio%';
    `);

    for (const lab of laboratorios) {
      const existingCount = await queryRunner.query(`
        SELECT COUNT(*) FROM "estadoEquipo" WHERE "idRecinto" = $1;
      `, [lab.idRecinto]);

      if (parseInt(existingCount[0].count) === 0) {
        for (let i = 1; i <= 36; i++) {
          await queryRunner.query(`
            INSERT INTO "estadoEquipo" ("numeroEquipo", estado, "idRecinto")
            VALUES ($1, true, $2);
          `, [i, lab.idRecinto]);
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "recinto" ADD COLUMN IF NOT EXISTS "computadorasDisponibles" integer;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tipoEtiqueta" (
        "idTipoEtiqueta" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "tipoEtiqueta" varchar(150) NOT NULL
      );
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "eventoEtiqueta" (
        "idEvento" integer NOT NULL,
        "idTipoEtiqueta" integer NOT NULL,
        PRIMARY KEY ("idEvento", "idTipoEtiqueta")
      );
    `);
  }
}