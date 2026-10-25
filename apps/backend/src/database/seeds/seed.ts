import pg from 'pg';
import bcrypt from 'bcrypt';
import {
  AlcanceEvento,
  EstadoEvento,
  EstadoSubEvento,
  EstadoVerificacion,
  RecintoId,
  TipoCuentaUsuario,
} from '@eventos/shared';

const { Client } = pg;

export async function runSeed() {
  const client = new Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '123postgres',
    database: process.env.DB_NAME ?? 'eventos',
  });

  try {
    await client.connect();
    console.log(`🔌 Conectado a PostgreSQL (${client.database}) para sembrar datos de prueba...`);

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('Admin123!', saltRounds);

    console.log('🌱 Creando usuarios de prueba...');

    // 1. Usuarios
    const usuarios = [
      {
        nombre: 'Claudia',
        apellidoPa: 'Mendoza',
        apellidoMa: 'García',
        correo: 'subdireccion@ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.SUBDIRECCION,
        esJefeAcademia: false,
      },
      {
        nombre: 'Carlos',
        apellidoPa: 'Ramírez',
        apellidoMa: 'Hernández',
        correo: 'admin@ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.ADMINISTRADOR,
        esJefeAcademia: false,
      },
      {
        nombre: 'Víctor',
        apellidoPa: 'Pérez',
        apellidoMa: 'López',
        correo: 'organizador@ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.INTERNO,
        esJefeAcademia: false,
      },
    ];

    const idsUsuarios: Record<string, number> = {};

    for (const u of usuarios) {
      const res = await client.query(
        `INSERT INTO usuario (nombre, "apellidoPa", "apellidoMa", correo, contrasena, estatus, "esVerificado", "tipoCuenta", "esJefeAcademia")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (correo) DO UPDATE 
         SET contrasena = EXCLUDED.contrasena, 
             "tipoCuenta" = EXCLUDED."tipoCuenta", 
             "esVerificado" = EXCLUDED."esVerificado",
             estatus = EXCLUDED.estatus
         RETURNING "idUsuario", correo;`,
        [
          u.nombre,
          u.apellidoPa,
          u.apellidoMa,
          u.correo,
          u.contrasena,
          u.estatus,
          u.esVerificado,
          u.tipoCuenta,
          u.esJefeAcademia,
        ],
      );
      idsUsuarios[res.rows[0].correo] = res.rows[0].idUsuario;
      console.log(`   ✓ Usuario listo: ${u.correo} (ID: ${res.rows[0].idUsuario}, Rol: ${u.tipoCuenta})`);
    }

    // 2. Evento de prueba en estado "En Proceso" (Pendiente de evaluación por Subdirección)
    console.log('🌱 Creando solicitud de evento de prueba...');
    const organizadorId = idsUsuarios['organizador@ipn.mx'];

    const resEvento = await client.query(
      `INSERT INTO evento (nombre, descripcion, poster, justificacion, "idAlcance", "idEstadoEvento", "idOrganizador")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING "idEvento";`,
      [
        'Semana de la Inteligencia Artificial 2026',
        'Ciclo de conferencias y talleres sobre IA generativa, redes neuronales y robótica autónoma.',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
        'Acercar las últimas innovaciones tecnológicas en IA a la comunidad estudiantil de la ESCOM.',
        AlcanceEvento.PUBLICO,
        EstadoEvento.ENPROCESO,
        organizadorId,
      ],
    );

    const idEvento = resEvento.rows[0].idEvento;
    console.log(`   ✓ Evento creado con ID: ${idEvento}`);

    // 3. Fecha para el subevento
    const resFecha = await client.query(
      `INSERT INTO fecha (fecha, "horaInicio", "horaFin")
       VALUES ($1, $2, $3)
       RETURNING "idFecha";`,
      ['2026-11-20', '10:00:00', '12:00:00'],
    );
    const idFecha = resFecha.rows[0].idFecha;

    // 4. Subevento
    const resSub = await client.query(
      `INSERT INTO "subEvento" ("accesoQR", estado, nombre, descripcion, "idEvento", "idRecinto", "idFecha")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING "idSubEvento";`,
      [
        true,
        EstadoSubEvento.EN_PROCESO,
        'Conferencia Magistral: Modelos Fundacionales y Agentes Autónomos',
        'Charla de apertura con investigadores invitados de la industria tech.',
        idEvento,
        RecintoId.AUDITORIO,
        idFecha,
      ],
    );
    console.log(`   ✓ Subevento creado con ID: ${resSub.rows[0].idSubEvento}`);

    console.log('\n✨ ¡Semillas de prueba insertadas con éxito!');
  } catch (error) {
    console.error('❌ Error al sembrar datos de prueba:', error);
  } finally {
    await client.end();
  }
}

if (import.meta.main) {
  runSeed();
}
