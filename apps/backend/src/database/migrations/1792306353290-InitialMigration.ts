import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1792306353290 implements MigrationInterface {
    name = 'InitialMigration1792306353290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fechas" ("idFecha" SERIAL NOT NULL, "fecha" date NOT NULL, "horaInicio" TIME NOT NULL, "horaFin" TIME NOT NULL, CONSTRAINT "PK_690d1a34af1c2b9e6fbfc459220" PRIMARY KEY ("idFecha"))`);
        await queryRunner.query(`CREATE TABLE "recintos" ("idRecinto" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "computadorasDisponibles" integer NOT NULL DEFAULT '0', "idEstadoRecinto" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_150d2cb6ace9b46da01f0c80958" PRIMARY KEY ("idRecinto"))`);
        await queryRunner.query(`CREATE TABLE "subeventos" ("idSubEvento" SERIAL NOT NULL, "idEvento" integer NOT NULL, "idRecinto" integer NOT NULL, "idFecha" integer NOT NULL, "accesoQR" boolean NOT NULL DEFAULT false, "estado" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_9958c5ebda83666dea1b4e0eb5f" PRIMARY KEY ("idSubEvento"))`);
        await queryRunner.query(`CREATE TABLE "eventos" ("idEvento" SERIAL NOT NULL, "nombre" character varying(200) NOT NULL, "descripcion" text NOT NULL, "poster" character varying(500), "justificacion" text, "idOrganizador" integer NOT NULL, "idAlcance" integer NOT NULL DEFAULT '1', "idEstadoEvento" integer NOT NULL DEFAULT '3', CONSTRAINT "PK_5119d2d8e89e5190f5a727013f1" PRIMARY KEY ("idEvento"))`);
        await queryRunner.query(`ALTER TABLE "subeventos" ADD CONSTRAINT "FK_83412ba592129389669e7a9015f" FOREIGN KEY ("idEvento") REFERENCES "eventos"("idEvento") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subeventos" ADD CONSTRAINT "FK_7bf5d9978e455dc306290ca96ce" FOREIGN KEY ("idRecinto") REFERENCES "recintos"("idRecinto") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subeventos" ADD CONSTRAINT "FK_05d44e7fe62db033cf316da5718" FOREIGN KEY ("idFecha") REFERENCES "fechas"("idFecha") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subeventos" DROP CONSTRAINT "FK_05d44e7fe62db033cf316da5718"`);
        await queryRunner.query(`ALTER TABLE "subeventos" DROP CONSTRAINT "FK_7bf5d9978e455dc306290ca96ce"`);
        await queryRunner.query(`ALTER TABLE "subeventos" DROP CONSTRAINT "FK_83412ba592129389669e7a9015f"`);
        await queryRunner.query(`DROP TABLE "eventos"`);
        await queryRunner.query(`DROP TABLE "subeventos"`);
        await queryRunner.query(`DROP TABLE "recintos"`);
        await queryRunner.query(`DROP TABLE "fechas"`);
    }

}
