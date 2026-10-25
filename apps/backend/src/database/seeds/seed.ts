import pg from 'pg';
import * as bcrypt from 'bcrypt';
import { TipoCuentaUsuario, EstadoVerificacion } from '@eventos/shared';

const { Client } = pg;

export async function runSeeds() {
  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5433),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'eventos',
  });

  try {
    await client.connect();
    console.log(`🔌 Conectado a PostgreSQL (${client.database}) para insertar semillas...`);

    const saltRounds = 10;
    const passwordHashOrganizador = await bcrypt.hash('Organizador123!', saltRounds);
    const passwordHashSubdireccion = await bcrypt.hash('Subdireccion123!', saltRounds);

    const query = `
      INSERT INTO usuario (
        "idUsuario", nombre, "apellidoPa", "apellidoMa", correo,
        contrasena, estatus, "esVerificado", "tipoCuenta", "esJefeAcademia"
      ) OVERRIDING SYSTEM VALUE VALUES 
      (
        1,
        'Carlos',
        'González',
        'López',
        'carlos.organizador@alumno.ipn.mx',
        $1,
        true,
        $2,
        $3,
        false
      ),
      (
        2,
        'Personal',
        'Subdirección',
        'Académica',
        'subdireccion@escom.ipn.mx',
        $4,
        true,
        $2,
        $5,
        false
      )
      ON CONFLICT (correo) DO UPDATE SET
        contrasena = EXCLUDED.contrasena,
        "tipoCuenta" = EXCLUDED."tipoCuenta",
        "esVerificado" = EXCLUDED."esVerificado",
        estatus = EXCLUDED.estatus;
    `;

    await client.query(query, [
      passwordHashOrganizador,
      EstadoVerificacion.VERIFICADO,
      TipoCuentaUsuario.INTERNO,
      passwordHashSubdireccion,
      TipoCuentaUsuario.SUBDIRECCION,
    ]);

    // Sincronizar secuencia de identity
    await client.query(`
      SELECT setval(pg_get_serial_sequence('"usuario"', 'idUsuario'), COALESCE(MAX("idUsuario"), 1)) FROM "usuario";
    `);

    console.log('✅ Semillas de usuarios insertadas exitosamente:');
    console.log('   - ID 1: carlos.organizador@alumno.ipn.mx (Usuario Interno / Verificado)');
    console.log('   - ID 2: subdireccion@escom.ipn.mx (Subdirección / Verificado)');
  } catch (error) {
    console.error('❌ Error al ejecutar semillas:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (import.meta.main) {
  runSeeds();
}
