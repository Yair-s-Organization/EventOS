import pg from 'pg';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import {
  AlcanceEvento,
  EstadoBoleto,
  EstadoEvento,
  EstadoSubEvento,
  EstadoVerificacion,
  ModalidadAcceso,
  RecintoId,
  TipoCuentaUsuario,
} from '@eventos/shared';
import {
  construirFechaEnCdmx,
  obtenerAhoraCdmx,
} from '../../common/utils/fecha-cdmx.util';

const { Client } = pg;

function fechaCdmxConOffset(diasDesdeHoy: number): string {
  const { fechaHoy } = obtenerAhoraCdmx();
  const baseUtc = new Date(`${fechaHoy}T12:00:00Z`);
  const objetivo = new Date(
    baseUtc.getTime() + diasDesdeHoy * 24 * 60 * 60 * 1000,
  );
  const iso = objetivo.toISOString().slice(0, 10);
  const finSemestre = `${fechaHoy.slice(0, 4)}-12-19`;
  return iso > finSemestre ? finSemestre : iso;
}

export async function runSeed() {
  const host = process.env.DB_HOST ?? 'localhost';
  const usarSsl = process.env.DB_SSL === 'true' || (host !== 'localhost' && host !== '127.0.0.1');

  const client = new Client({
    host,
    port: Number(process.env.DB_PORT ?? 5433),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'eventos',
    ssl: usarSsl ? { rejectUnauthorized: false } : false,
  }); 

  try {
    await client.connect();
    console.log(`Conectado a PostgreSQL (${client.database}) para sembrar datos de prueba...`);

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('Admin123!', saltRounds);
    const jwtService = new JwtService({
      secret: process.env.JWT_SECRET || 'clave_secreta_desarrollo',
    });

    console.log('Creando usuarios de prueba...');

    // 1. Usuarios del sistema y comunidad ESCOM
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
      {
        nombre: 'Mariana',
        apellidoPa: 'Torres',
        apellidoMa: 'Salazar',
        correo: 'logistica1@ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.INTERNO,
        esJefeAcademia: false,
      },
      {
        nombre: 'Jorge Alberto',
        apellidoPa: 'Rivas',
        apellidoMa: 'Cruz',
        correo: 'logistica2@ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.INTERNO,
        esJefeAcademia: false,
      },
      {
        nombre: 'Ana Paula',
        apellidoPa: 'Gómez',
        apellidoMa: 'Luna',
        correo: 'estudiante@ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.INTERNO,
        esJefeAcademia: false,
        idRolVerificacion: 1,
        infoVerificacion: 'Alumno regular ESCOM - Ingeniería en Sistemas Computacionales',
      },
      {
        nombre: 'Diego',
        apellidoPa: 'Martínez',
        apellidoMa: 'González',
        correo: 'diego.martinezg@alumno.ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.INTERNO,
        esJefeAcademia: false,
        idRolVerificacion: 1,
        infoVerificacion: 'Alumno ESCOM - Licenciatura en Ciencia de Datos',
      },
      {
        nombre: 'Valeria',
        apellidoPa: 'Sánchez',
        apellidoMa: 'Ramírez',
        correo: 'valeria.sanchezr@alumno.ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.INTERNO,
        esJefeAcademia: false,
        idRolVerificacion: 1,
        infoVerificacion: 'Alumna ESCOM - Ingeniería en Inteligencia Artificial',
      },
      {
        nombre: 'Alejandro',
        apellidoPa: 'Herrera',
        apellidoMa: 'Cruz',
        correo: 'alejandro.herrerac@alumno.ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.INTERNO,
        esJefeAcademia: false,
        idRolVerificacion: 1,
        infoVerificacion: 'Alumno ESCOM - Ingeniería en Sistemas Computacionales',
      },
      {
        nombre: 'Fernanda',
        apellidoPa: 'López',
        apellidoMa: 'Morales',
        correo: 'fernanda.lopezm@alumno.ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.INTERNO,
        esJefeAcademia: false,
        idRolVerificacion: 1,
        infoVerificacion: 'Alumna ESCOM - Club de Algoritmia ESCOM',
      },
      {
        nombre: 'Ricardo',
        apellidoPa: 'Navarro',
        apellidoMa: 'Vázquez',
        correo: 'ricardo.navarrov@alumno.ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.INTERNO,
        esJefeAcademia: false,
        idRolVerificacion: 1,
        infoVerificacion: 'Alumno ESCOM - Comunidad Linux ESCOM',
      },
      {
        nombre: 'Sofía',
        apellidoPa: 'Domínguez',
        apellidoMa: 'Torres',
        correo: 'sofia.dominguezt@alumno.ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.INTERNO,
        esJefeAcademia: false,
        idRolVerificacion: 1,
        infoVerificacion: 'Alumna ESCOM - Ingeniería en Sistemas Computacionales',
      },
      {
        nombre: 'Héctor',
        apellidoPa: 'Castañeda',
        apellidoMa: 'Flores',
        correo: 'hector.castaneda@ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.INTERNO,
        esJefeAcademia: true,
        idRolVerificacion: 2,
        infoVerificacion: 'Docente e investigador - Academia de Ciencias de la Computación ESCOM',
      },
      {
        nombre: 'Juan',
        apellidoPa: 'Pérez',
        apellidoMa: 'NoVerificado',
        correo: 'noverificado@ipn.mx',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.NO_VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.INTERNO,
        esJefeAcademia: false,
      },
      {
        nombre: 'Laura Sofía',
        apellidoPa: 'Márquez',
        apellidoMa: 'Castillo',
        correo: 'externo@gmail.com',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.EXTERNO,
        esJefeAcademia: false,
        idRolVerificacion: 3,
        infoVerificacion: 'Asistente externo registrado - Egresada sector tecnológico',
      },
      {
        nombre: 'Paulina',
        apellidoPa: 'Vega',
        apellidoMa: 'Contreras',
        correo: 'paulina.vega@gmail.com',
        contrasena: passwordHash,
        estatus: true,
        esVerificado: EstadoVerificacion.VERIFICADO,
        tipoCuenta: TipoCuentaUsuario.EXTERNO,
        esJefeAcademia: false,
        idRolVerificacion: 3,
        infoVerificacion: 'Asistente externo registrado - Invitada vinculación ESCOM',
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
             "esJefeAcademia" = EXCLUDED."esJefeAcademia",
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
      const idUsuario = Number(res.rows[0].idUsuario);
      idsUsuarios[res.rows[0].correo] = idUsuario;

      if (u.idRolVerificacion && u.infoVerificacion) {
        const verExiste = await client.query(
          `SELECT 1 FROM verificacion WHERE "idUsuario" = $1 LIMIT 1;`,
          [idUsuario],
        );
        if (verExiste.rowCount === 0) {
          await client.query(
            `INSERT INTO verificacion ("informacionAdicional", archivo, "idRol", "idUsuario")
             VALUES ($1, $2, $3, $4);`,
            [
              u.infoVerificacion,
              'verificaciones/comprobante-escom.pdf',
              u.idRolVerificacion,
              idUsuario,
            ],
          );
        }
      }
      console.log(`   Usuario listo: ${u.correo} (ID: ${idUsuario}, Rol: ${u.tipoCuenta})`);
    }

    // 2. Catálogo de modalidades de acceso y Recintos Iniciales de ESCOM
    await client.query(`
      INSERT INTO "modalidadAcceso" ("idModalidadAcceso", modalidad)
      OVERRIDING SYSTEM VALUE
      VALUES
        (1, 'Acceso libre'),
        (2, 'Registro simple sin QR'),
        (3, 'QR Admisión general'),
        (4, 'QR con mapa de asientos')
      ON CONFLICT ("idModalidadAcceso") DO UPDATE
      SET modalidad = EXCLUDED.modalidad;
    `);

    console.log('Creando recintos iniciales...');
    const recintos = [
      { id: 1, nombre: 'Auditorio Principal', aforo: 242, idEstadoRecinto: 1 },
      { id: 2, nombre: 'Laboratorio 2104', aforo: 36, idEstadoRecinto: 1 },
      { id: 3, nombre: 'Laboratorio 2105', aforo: 36, idEstadoRecinto: 1 },
      { id: 4, nombre: 'Sala 14', aforo: 100, idEstadoRecinto: 1 },
      { id: 5, nombre: 'Laboratorio 2106', aforo: 36, idEstadoRecinto: 1 },
      { id: 6, nombre: 'Laboratorio 2107', aforo: 36, idEstadoRecinto: 1 },
    ];

    for (const r of recintos) {
      await client.query(
        `INSERT INTO recinto ("idRecinto", nombre, aforo, "idEstadoRecinto")
         OVERRIDING SYSTEM VALUE
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ("idRecinto") DO UPDATE 
         SET nombre = EXCLUDED.nombre, aforo = EXCLUDED.aforo;`,
        [r.id, r.nombre, r.aforo, r.idEstadoRecinto],
      );
    }

    console.log('Poblando asientos del Auditorio Principal (242 butacas)...');
    await client.query(`
      INSERT INTO asiento (fila, numero, "idRecinto")
      SELECT filas.fila, numeros.numero, 1
      FROM (VALUES ('A'),('B'),('C'),('D'),('E'),('F'),('G'),('H'),('I'),('J'),('K')) AS filas(fila)
      CROSS JOIN generate_series(1, 23) AS numeros(numero)
      WHERE (
        (filas.fila = 'A' AND numeros.numero IN (4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20))
        OR (filas.fila = 'B' AND numeros.numero BETWEEN 2 AND 22)
        OR filas.fila NOT IN ('A', 'B')
      )
      AND NOT EXISTS (
        SELECT 1 FROM asiento a
        WHERE a."idRecinto" = 1 AND a.fila = filas.fila AND a.numero = numeros.numero
      );
    `);

    console.log('Poblando equipos/computadoras en estadoEquipo...');
    const laboratoriosIds = [2, 3, 5, 6];

    for (const recintoId of laboratoriosIds) {
      await client.query(`DELETE FROM "estadoEquipo" WHERE "idRecinto" = $1;`, [recintoId]);

      for (let i = 1; i <= 36; i++) {
        await client.query(
          `INSERT INTO "estadoEquipo" ("numeroEquipo", estado, "idRecinto") VALUES ($1, $2, $3);`,
          [i, true, recintoId],
        );
      }
      console.log(`   36 computadoras agregadas al recinto ID: ${recintoId}`);
    }

    // 3. Limpieza de eventos previos para mantener una semilla limpia e idempotente
    console.log('Limpiando eventos previos...');
    await client.query(`
      DELETE FROM "solicitudModificacion";
      DELETE FROM "invitacionEvento";
      DELETE FROM "eventoPersonalLogistica";
      DELETE FROM ponente;
      DELETE FROM "asistenteEvento";
      DELETE FROM boleto;
      DELETE FROM "bitacoraEvento";
      DELETE FROM "subEvento";
      DELETE FROM fecha;
      DELETE FROM evento;
    `);

    // 4. Creación de Eventos de prueba completos
    console.log('Creando solicitudes y eventos de prueba con datos enriquecidos...');
    const organizadorId = idsUsuarios['organizador@ipn.mx'];
    const subdireccionId = idsUsuarios['subdireccion@ipn.mx'];

    interface PonenteSeed {
      nombre: string;
      apellidoPa: string;
      apellidoMa?: string;
      correo: string;
    }

    interface RegistroSeed {
      correoUsuario: string;
      estadoBoleto: EstadoBoleto;
      asiento?: { fila: string; numero: number };
      horasAntiguedad: number;
    }

    interface SubeventoSeed {
      nombre: string;
      descripcion: string;
      idModalidadAcceso: ModalidadAcceso;
      estado: EstadoSubEvento;
      idRecinto: number;
      fecha: string;
      horaInicio: string;
      horaFin: string;
      ponentes?: PonenteSeed[];
      registros?: RegistroSeed[];
    }

    interface EventoSeed {
      nombre: string;
      descripcion: string;
      poster: string;
      justificacion: string;
      esUrgente: boolean;
      motivoUrgencia: string | null;
      motivoRechazo?: string | null;
      idAlcance: AlcanceEvento;
      idEstadoEvento: EstadoEvento;
      personalLogistica?: string[];
      invitados?: string[];
      solicitudModificacionPendiente?: {
        motivoModificacion: string;
        cambiosEnSubeventoIndice: number;
        nuevoRecinto: number;
        nuevaFecha: string;
        nuevaHoraInicio: string;
        nuevaHoraFin: string;
      };
      subeventos: SubeventoSeed[];
    }

    const eventosSeed: EventoSeed[] = [
      {
        nombre: 'Microsoft Tech Day ESCOM 2026: Cloud Computing y GitHub',
        descripcion:
          'Jornada de vinculación tecnológica organizada por Microsoft y la ESCOM, con conferencias magistrales y talleres sobre desarrollo en la nube con Azure, arquitectura de microservicios y flujos CI/CD con GitHub Enterprise.',
        poster:
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
        justificacion:
          'Capacitar a la comunidad de la ESCOM en herramientas industriales de cómputo en la nube y DevOps demandadas por las principales empresas de tecnología.',
        esUrgente: false,
        motivoUrgencia: null,
        motivoRechazo: null,
        idAlcance: AlcanceEvento.PUBLICO,
        idEstadoEvento: EstadoEvento.ENPROCESO,
        personalLogistica: ['logistica1@ipn.mx', 'logistica2@ipn.mx'],
        subeventos: [
          {
            nombre: 'Conferencia Magistral: Arquitecturas Distribuidas y Cómputo Serverless en Azure',
            descripcion:
              'Diseño de sistemas tolerantes a fallos y patrones de arquitectura en la nube con ingenieros de Microsoft México.',
            idModalidadAcceso: ModalidadAcceso.QR_MAPA,
            estado: EstadoSubEvento.EN_PROCESO,
            idRecinto: RecintoId.AUDITORIO,
            fecha: fechaCdmxConOffset(9),
            horaInicio: '10:00:00',
            horaFin: '12:00:00',
            ponentes: [
              {
                nombre: 'Diana',
                apellidoPa: 'Morales',
                apellidoMa: 'Rangel',
                correo: 'dmorales@microsoft.com',
              },
              {
                nombre: 'Carlos',
                apellidoPa: 'Valdez',
                apellidoMa: 'Ortiz',
                correo: 'cvaldezo@ipn.mx',
              },
            ],
          },
          {
            nombre: 'Taller Práctico: Automatización de Pipelines y Despliegues con GitHub Actions',
            descripcion:
              'Configuración de flujos CI/CD, pruebas automatizadas y contenedores en laboratorio de cómputo.',
            idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
            estado: EstadoSubEvento.EN_PROCESO,
            idRecinto: RecintoId.LABORATORIO_2104,
            fecha: fechaCdmxConOffset(10),
            horaInicio: '12:00:00',
            horaFin: '14:00:00',
            ponentes: [
              {
                nombre: 'Roberto',
                apellidoPa: 'Silva',
                apellidoMa: 'Domínguez',
                correo: 'rsilva@microsoft.com',
              },
            ],
          },
          {
            nombre: 'Mesa de Diálogo: Empleabilidad y Trayectorias Profesionales en la Industria Tech',
            descripcion:
              'Sesión de orientación profesional, preguntas y reclutamiento temprano para alumnos de los últimos semestres de ESCOM.',
            idModalidadAcceso: ModalidadAcceso.REGISTRO_SIMPLE,
            estado: EstadoSubEvento.EN_PROCESO,
            idRecinto: RecintoId.SALA_14,
            fecha: fechaCdmxConOffset(11),
            horaInicio: '15:00:00',
            horaFin: '17:00:00',
            ponentes: [
              {
                nombre: 'Mariana',
                apellidoPa: 'Castellanos',
                apellidoMa: 'Soto',
                correo: 'mcastellanos@microsoft.com',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Oracle Academy Day: Java Moderno y Bases de Datos Empresariales',
        descripcion:
          'Encuentro académico y profesional impartido por ingenieros de Oracle México sobre innovaciones en Java 21+, GraalVM, optimización de consultas SQL y bases de datos autónomas.',
        poster:
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200',
        justificacion:
          'Actualizar a los alumnos y docentes en el ecosistema Java empresarial y gestión de bases de datos relacionales en la nube, con acreditación formal de Oracle Academy.',
        esUrgente: true,
        motivoUrgencia:
          'El equipo de ingeniería y educación de Oracle Academy México confirmó su disponibilidad de gira académica con 5 días de anticipación para las únicas fechas disponibles antes del cierre de semestre.',
        motivoRechazo: null,
        idAlcance: AlcanceEvento.PUBLICO,
        idEstadoEvento: EstadoEvento.ENPROCESO,
        personalLogistica: ['logistica1@ipn.mx'],
        subeventos: [
          {
            nombre: 'Conferencia Magistral: Novedades de Java 21+ y GraalVM para Alto Desempeño',
            descripcion:
              'Análisis de hilos virtuales (Virtual Threads), concurrencia estructurada y compilación nativa en Java.',
            idModalidadAcceso: ModalidadAcceso.QR_MAPA,
            estado: EstadoSubEvento.EN_PROCESO,
            idRecinto: RecintoId.AUDITORIO,
            fecha: fechaCdmxConOffset(3),
            horaInicio: '09:00:00',
            horaFin: '11:00:00',
            ponentes: [
              {
                nombre: 'Gabriela',
                apellidoPa: 'Ortega',
                apellidoMa: 'Paz',
                correo: 'gortega@oracle.com',
              },
            ],
          },
          {
            nombre: 'Taller de Laboratorio: Optimización y Transacciones en Oracle Autonomous DB',
            descripcion:
              'Prácticas de diseño relacional, planes de ejecución e índices avanzados en base de datos en laboratorio.',
            idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
            estado: EstadoSubEvento.EN_PROCESO,
            idRecinto: RecintoId.LABORATORIO_2105,
            fecha: fechaCdmxConOffset(4),
            horaInicio: '11:00:00',
            horaFin: '14:00:00',
            ponentes: [
              {
                nombre: 'Mauricio',
                apellidoPa: 'Zepeda',
                apellidoMa: 'Ortiz',
                correo: 'mzepeda@oracle.com',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Torneo Clasificatorio de Programación Competitiva ICPC - Club de Algoritmia ESCOM',
        descripcion:
          'Competencia interna por equipos bajo el formato oficial del ICPC (International Collegiate Programming Contest), organizada por el Club de Algoritmia de la ESCOM para seleccionar las representaciones politécnicas rumbo a la eliminatoria regional.',
        poster:
          'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200',
        justificacion:
          'Fomentar el pensamiento algorítmico, las estructuras de datos avanzadas y el trabajo cooperativo de alto rendimiento entre la comunidad estudiantil del IPN.',
        esUrgente: false,
        motivoUrgencia: null,
        motivoRechazo: null,
        idAlcance: AlcanceEvento.INTERNO,
        idEstadoEvento: EstadoEvento.ACEPTADO,
        personalLogistica: ['logistica2@ipn.mx'],
        subeventos: [
          {
            nombre: 'Contest Oficial ICPC ESCOM: Sesión de Competencia en Tiempo Real',
            descripcion:
              'Resolución simultánea de 10 a 12 problemas algorítmicos en C++, Java y Python con juez en línea automatizado.',
            idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
            estado: EstadoSubEvento.ACEPTADO,
            idRecinto: RecintoId.LABORATORIO_2104,
            fecha: fechaCdmxConOffset(12),
            horaInicio: '10:00:00',
            horaFin: '15:00:00',
            ponentes: [
              {
                nombre: 'Edgardo Adrián',
                apellidoPa: 'Franco',
                apellidoMa: 'Martínez',
                correo: 'eafrancom@ipn.mx',
              },
            ],
            registros: [
              {
                correoUsuario: 'estudiante@ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 48,
              },
              {
                correoUsuario: 'diego.martinezg@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.UTILIZADO,
                horasAntiguedad: 40,
              },
              {
                correoUsuario: 'valeria.sanchezr@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.UTILIZADO,
                horasAntiguedad: 32,
              },
              {
                correoUsuario: 'alejandro.herrerac@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 24,
              },
              {
                correoUsuario: 'fernanda.lopezm@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 16,
              },
              {
                correoUsuario: 'ricardo.navarrov@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 8,
              },
            ],
          },
        ],
      },
      {
        nombre: 'Foro de Ciencia de Datos e Inteligencia Artificial ESCOM 2026',
        descripcion:
          'Encuentro académico organizado por las academias de Ciencia de Datos e Ingeniería en Inteligencia Artificial de la ESCOM con paneles de egresados y análisis de proyectos aplicados a industria y sector público.',
        poster:
          'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200',
        justificacion:
          'Vincular a los alumnos de las carreras LCD e IIA de ESCOM con casos reales de aprendizaje automático, ciencia de datos y ética algorítmica.',
        esUrgente: false,
        motivoUrgencia: null,
        motivoRechazo: null,
        idAlcance: AlcanceEvento.PUBLICO,
        idEstadoEvento: EstadoEvento.ACEPTADO,
        personalLogistica: ['logistica1@ipn.mx'],
        subeventos: [
          {
            nombre: 'Panel de Egresados y Cuerpos Académicos: Ciencia de Datos e IA Aplicada',
            descripcion:
              'Conversatorio con egresados y profesores investigadores de la ESCOM sobre arquitectura de datos, MLOps y modelos de lenguaje en producción.',
            idModalidadAcceso: ModalidadAcceso.REGISTRO_SIMPLE,
            estado: EstadoSubEvento.ACEPTADO,
            idRecinto: RecintoId.SALA_14,
            fecha: fechaCdmxConOffset(14),
            horaInicio: '13:00:00',
            horaFin: '15:00:00',
            ponentes: [
              {
                nombre: 'Rocío',
                apellidoPa: 'Palacios',
                apellidoMa: 'Solano',
                correo: 'rpalacioss@ipn.mx',
              },
              {
                nombre: 'Roberto',
                apellidoPa: 'Tecla',
                apellidoMa: 'Parra',
                correo: 'rteclap@ipn.mx',
              },
            ],
            registros: [
              {
                correoUsuario: 'estudiante@ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 36,
              },
              {
                correoUsuario: 'externo@gmail.com',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 30,
              },
              {
                correoUsuario: 'diego.martinezg@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 24,
              },
              {
                correoUsuario: 'sofia.dominguezt@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 18,
              },
              {
                correoUsuario: 'paulina.vega@gmail.com',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 10,
              },
            ],
          },
        ],
      },
      {
        nombre: 'Semana de la Computación y Expo ESCOM 2026',
        descripcion:
          'El evento anual más representativo de la ESCOM que integra conferencias de egresados destacados en la industria, feria de proyectos de Trabajo Terminal (TT), exhibición de clubes estudiantiles y foros de innovación tecnológica.',
        poster:
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
        justificacion:
          'Consolidar el sentido de comunidad politécnica y exhibir los prototipos y proyectos de ingeniería informática y ciencias de datos ante evaluadores y reclutadores externos.',
        esUrgente: false,
        motivoUrgencia: null,
        motivoRechazo: null,
        idAlcance: AlcanceEvento.PUBLICO,
        idEstadoEvento: EstadoEvento.ACEPTADO,
        personalLogistica: ['logistica1@ipn.mx', 'logistica2@ipn.mx'],
        subeventos: [
          {
            nombre: 'Ceremonia Inaugural y Conferencia Magistral: Retos del Software en México',
            descripcion:
              'Apertura institucional del ciclo con autoridades del Instituto Politécnico Nacional y ponencia sobre el futuro del desarrollo de software.',
            idModalidadAcceso: ModalidadAcceso.QR_MAPA,
            estado: EstadoSubEvento.ACEPTADO,
            idRecinto: RecintoId.AUDITORIO,
            fecha: fechaCdmxConOffset(16),
            horaInicio: '10:00:00',
            horaFin: '12:00:00',
            ponentes: [
              {
                nombre: 'Andrés',
                apellidoPa: 'Ortigoza',
                apellidoMa: 'Campos',
                correo: 'aortigozac@ipn.mx',
              },
            ],
            registros: [
              {
                correoUsuario: 'estudiante@ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                asiento: { fila: 'A', numero: 4 },
                horasAntiguedad: 72,
              },
              {
                correoUsuario: 'externo@gmail.com',
                estadoBoleto: EstadoBoleto.VALIDO,
                asiento: { fila: 'A', numero: 5 },
                horasAntiguedad: 64,
              },
              {
                correoUsuario: 'diego.martinezg@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.UTILIZADO,
                asiento: { fila: 'A', numero: 6 },
                horasAntiguedad: 56,
              },
              {
                correoUsuario: 'valeria.sanchezr@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.UTILIZADO,
                asiento: { fila: 'B', numero: 3 },
                horasAntiguedad: 48,
              },
              {
                correoUsuario: 'alejandro.herrerac@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                asiento: { fila: 'B', numero: 4 },
                horasAntiguedad: 36,
              },
              {
                correoUsuario: 'hector.castaneda@ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                asiento: { fila: 'C', numero: 10 },
                horasAntiguedad: 24,
              },
              {
                correoUsuario: 'paulina.vega@gmail.com',
                estadoBoleto: EstadoBoleto.VALIDO,
                asiento: { fila: 'C', numero: 11 },
                horasAntiguedad: 12,
              },
            ],
          },
          {
            nombre: 'Taller Práctico: Desarrollo de Sistemas Embebidos y Conectividad IoT',
            descripcion:
              'Laboratorio práctico de programación en microcontroladores y protocolos de red MQTT para domótica e industria.',
            idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
            estado: EstadoSubEvento.ACEPTADO,
            idRecinto: RecintoId.LABORATORIO_2105,
            fecha: fechaCdmxConOffset(17),
            horaInicio: '10:00:00',
            horaFin: '13:00:00',
            ponentes: [
              {
                nombre: 'Karina',
                apellidoPa: 'Viveros',
                apellidoMa: 'Vela',
                correo: 'kviverosv@ipn.mx',
              },
            ],
            registros: [
              {
                correoUsuario: 'estudiante@ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 44,
              },
              {
                correoUsuario: 'fernanda.lopezm@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.UTILIZADO,
                horasAntiguedad: 30,
              },
              {
                correoUsuario: 'ricardo.navarrov@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 20,
              },
              {
                correoUsuario: 'sofia.dominguezt@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 10,
              },
            ],
          },
          {
            nombre: 'Muestra Anual de Proyectos de Trabajo Terminal y Software Libre',
            descripcion:
              'Exhibición de prototipos funcionales desarrollados por egresantes de Ingeniería en Sistemas y Ciencia de Datos.',
            idModalidadAcceso: ModalidadAcceso.ACCESO_LIBRE,
            estado: EstadoSubEvento.ACEPTADO,
            idRecinto: RecintoId.SALA_14,
            fecha: fechaCdmxConOffset(18),
            horaInicio: '14:00:00',
            horaFin: '17:00:00',
            ponentes: [
              {
                nombre: 'Flavio',
                apellidoPa: 'Sánchez',
                apellidoMa: 'García',
                correo: 'fsanchezg@ipn.mx',
              },
            ],
          },
        ],
      },
      {
        nombre: 'Seminario de Ciberseguridad Defensiva y Auditoría de Redes - Club de Ciberseguridad ESCOM',
        descripcion:
          'Sesión técnica cerrada por invitación para integrantes y colaboradores del Club de Ciberseguridad ESCOM enfocada en análisis de tráfico, pruebas de penetración éticas y respuesta ante incidentes.',
        poster:
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200',
        justificacion:
          'Fortalecer las capacidades prácticas en seguridad informática y preparar a los representantes de ESCOM para competencias nacionales CTF.',
        esUrgente: false,
        motivoUrgencia: null,
        motivoRechazo: null,
        idAlcance: AlcanceEvento.PRIVADO,
        idEstadoEvento: EstadoEvento.ACEPTADO,
        personalLogistica: ['logistica2@ipn.mx'],
        invitados: [
          'estudiante@ipn.mx',
          'diego.martinezg@alumno.ipn.mx',
          'valeria.sanchezr@alumno.ipn.mx',
          'alejandro.herrerac@alumno.ipn.mx',
        ],
        subeventos: [
          {
            nombre: 'Laboratorio CTF: Análisis de Vulnerabilidades Web y Hardening en Linux',
            descripcion:
              'Entorno controlado en laboratorio para resolución de retos de seguridad ofensiva y defensiva.',
            idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
            estado: EstadoSubEvento.ACEPTADO,
            idRecinto: RecintoId.LABORATORIO_2106,
            fecha: fechaCdmxConOffset(19),
            horaInicio: '16:00:00',
            horaFin: '18:00:00',
            ponentes: [
              {
                nombre: 'Axel Ernesto',
                apellidoPa: 'Moreno',
                apellidoMa: 'Cervantes',
                correo: 'amorenoc@ipn.mx',
              },
            ],
            registros: [
              {
                correoUsuario: 'diego.martinezg@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 28,
              },
              {
                correoUsuario: 'valeria.sanchezr@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 14,
              },
            ],
          },
        ],
      },
      {
        nombre: 'Jornadas de Software Libre y Redes - Comunidad Linux ESCOM',
        descripcion:
          'Ciclo formativo organizado por la comunidad estudiantil sobre administración de servidores GNU/Linux, contenedores Docker, ciberseguridad defensiva y herramientas de código abierto.',
        poster:
          'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200',
        justificacion:
          'Proveer a los alumnos bases sólidas en sistemas operativos abiertos, infraestructura de telecomunicaciones y cultura open-source dentro del campus politécnico.',
        esUrgente: false,
        motivoUrgencia: null,
        motivoRechazo: null,
        idAlcance: AlcanceEvento.INTERNO,
        idEstadoEvento: EstadoEvento.ACEPTADO,
        personalLogistica: ['logistica1@ipn.mx'],
        solicitudModificacionPendiente: {
          motivoModificacion:
            'Se solicita cambio de horario y reubicación al Auditorio Principal debido al sobrecupo en el pre-registro de alumnos para el Taller de Contenedores y Redes.',
          cambiosEnSubeventoIndice: 1,
          nuevoRecinto: RecintoId.AUDITORIO,
          nuevaFecha: fechaCdmxConOffset(23),
          nuevaHoraInicio: '14:00:00',
          nuevaHoraFin: '17:00:00',
        },
        subeventos: [
          {
            nombre: 'Conferencia: Arquitectura del Kernel Linux y Seguridad en Servidores',
            descripcion:
              'Funcionamiento interno de módulos del núcleo, namespaces, cgroups y hardening de servidores.',
            idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
            estado: EstadoSubEvento.ACEPTADO,
            idRecinto: RecintoId.SALA_14,
            fecha: fechaCdmxConOffset(22),
            horaInicio: '11:00:00',
            horaFin: '13:00:00',
            ponentes: [
              {
                nombre: 'Miguel Ángel',
                apellidoPa: 'Téllez',
                apellidoMa: 'Morales',
                correo: 'mtellezm@ipn.mx',
              },
            ],
            registros: [
              {
                correoUsuario: 'ricardo.navarrov@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 36,
              },
              {
                correoUsuario: 'sofia.dominguezt@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 24,
              },
              {
                correoUsuario: 'hector.castaneda@ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 12,
              },
            ],
          },
          {
            nombre: 'Taller Práctico: Despliegue de Servicios y Redes con Docker y Kubernetes',
            descripcion:
              'Configuración paso a paso de contenedores, volúmenes persistentes y balanceo de carga en clúster.',
            idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
            estado: EstadoSubEvento.ACEPTADO,
            idRecinto: RecintoId.LABORATORIO_2104,
            fecha: fechaCdmxConOffset(23),
            horaInicio: '12:00:00',
            horaFin: '14:00:00',
            ponentes: [
              {
                nombre: 'Salvador',
                apellidoPa: 'García',
                apellidoMa: 'Mendoza',
                correo: 'sgarciam@ipn.mx',
              },
            ],
            registros: [
              {
                correoUsuario: 'estudiante@ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 50,
              },
              {
                correoUsuario: 'alejandro.herrerac@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 38,
              },
              {
                correoUsuario: 'fernanda.lopezm@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 26,
              },
              {
                correoUsuario: 'ricardo.navarrov@alumno.ipn.mx',
                estadoBoleto: EstadoBoleto.VALIDO,
                horasAntiguedad: 14,
              },
            ],
          },
        ],
      },
      {
        nombre: 'Hackathon Interuniversitario de Desarrollo Web y Móvil ESCOM',
        descripcion:
          'Maratón de 24 horas de programación continua en equipos multidisciplinarios de estudiantes de ESCOM, UPIITA y Facultades afines para resolver retos de movilidad y sustentabilidad urbana.',
        poster:
          'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200',
        justificacion:
          'Incentivar la resolución ágil de problemas, el emprendimiento tecnológico y la colaboración interdisciplinaria entre futuros profesionistas del IPN.',
        esUrgente: false,
        motivoUrgencia: null,
        motivoRechazo:
          'Se rechaza la solicitud de espacios debido a que las fechas solicitadas coinciden con el periodo de Evaluaciones Departamentales y la visita de acreditación del Consejo de Acreditación de la Enseñanza de la Ingeniería (CACEI) en el Auditorio Principal y laboratorios.',
        idAlcance: AlcanceEvento.PUBLICO,
        idEstadoEvento: EstadoEvento.RECHAZADO,
        subeventos: [
          {
            nombre: 'Sesión Plenaria: Presentación del Reto de Programación y Reglas del Hackathon',
            descripcion:
              'Ceremonia de inicio con autoridades y asignación de problemáticas a los equipos participantes.',
            idModalidadAcceso: ModalidadAcceso.QR_MAPA,
            estado: EstadoSubEvento.RECHAZADO,
            idRecinto: RecintoId.AUDITORIO,
            fecha: fechaCdmxConOffset(7),
            horaInicio: '09:00:00',
            horaFin: '11:00:00',
            ponentes: [
              {
                nombre: 'Fernando',
                apellidoPa: 'Arámbula',
                apellidoMa: 'Cosío',
                correo: 'farambulac@ipn.mx',
              },
            ],
          },
          {
            nombre: 'Mesa de Mentoría y Evaluación Técnica de Prototipos de Software',
            descripcion:
              'Sesión continua de asesoría con ingenieros mentores para la entrega y dictamen de proyectos.',
            idModalidadAcceso: ModalidadAcceso.ACCESO_LIBRE,
            estado: EstadoSubEvento.RECHAZADO,
            idRecinto: RecintoId.SALA_14,
            fecha: fechaCdmxConOffset(7),
            horaInicio: '12:00:00',
            horaFin: '16:00:00',
          },
        ],
      },
    ];

    for (const ev of eventosSeed) {
      const resEvento = await client.query(
        `INSERT INTO evento (nombre, descripcion, poster, justificacion, "esUrgente", "motivoUrgencia", "motivoRechazo", "idAlcance", "idEstadoEvento", "idOrganizador")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING "idEvento";`,
        [
          ev.nombre,
          ev.descripcion,
          ev.poster,
          ev.justificacion,
          ev.esUrgente,
          ev.motivoUrgencia,
          ev.motivoRechazo ?? null,
          ev.idAlcance,
          ev.idEstadoEvento,
          organizadorId,
        ],
      );

      const idEvento = resEvento.rows[0].idEvento;
      console.log(
        `   Evento creado: "${ev.nombre}" (ID: ${idEvento}, Urgente: ${ev.esUrgente}, Estado: ${ev.idEstadoEvento}, Subeventos: ${ev.subeventos.length})`,
      );

      // Asignar personal de logística al evento
      if (ev.personalLogistica && ev.personalLogistica.length > 0) {
        for (const correoLogistica of ev.personalLogistica) {
          const idPersonal = idsUsuarios[correoLogistica];
          if (idPersonal) {
            await client.query(
              `INSERT INTO "eventoPersonalLogistica" ("idEvento", "idUsuario")
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING;`,
              [idEvento, idPersonal],
            );
            console.log(`      -> Personal de logística asignado: ${correoLogistica} (ID Usuario: ${idPersonal})`);
          }
        }
      }

      const subeventosCreados: {
        idSubEvento: number;
        nombre: string;
        descripcion: string;
        idRecinto: number;
        idModalidadAcceso: ModalidadAcceso;
        fecha: string;
        horaInicio: string;
        horaFin: string;
      }[] = [];

      for (const sub of ev.subeventos) {
        const resFecha = await client.query(
          `INSERT INTO fecha (fecha, "horaInicio", "horaFin")
           VALUES ($1, $2, $3)
           RETURNING "idFecha";`,
          [sub.fecha, sub.horaInicio, sub.horaFin],
        );
        const idFecha = resFecha.rows[0].idFecha;

        const resSub = await client.query(
          `INSERT INTO "subEvento" ("idModalidadAcceso", estado, nombre, descripcion, "tokenInvitacion", "enlaceInvitacionActivo", "idEvento", "idRecinto", "idFecha")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING "idSubEvento";`,
          [
            sub.idModalidadAcceso,
            sub.estado,
            sub.nombre,
            sub.descripcion,
            randomUUID(),
            false,
            idEvento,
            sub.idRecinto,
            idFecha,
          ],
        );
        const idSubEvento = resSub.rows[0].idSubEvento;
        console.log(
          `      -> Subevento creado: "${sub.nombre}" (ID: ${idSubEvento}, Fecha: ${sub.fecha})`,
        );

        subeventosCreados.push({
          idSubEvento,
          nombre: sub.nombre,
          descripcion: sub.descripcion,
          idRecinto: sub.idRecinto,
          idModalidadAcceso: sub.idModalidadAcceso,
          fecha: sub.fecha,
          horaInicio: sub.horaInicio,
          horaFin: sub.horaFin,
        });

        if (ev.invitados && ev.invitados.length > 0 && sub.estado !== EstadoSubEvento.CANCELADO) {
          for (const correoInvitado of ev.invitados) {
            const idInvitado = idsUsuarios[correoInvitado];
            if (idInvitado) {
              await client.query(
                `INSERT INTO "invitacionEvento" ("idSubEvento", "idUsuario")
                 VALUES ($1, $2)
                 ON CONFLICT ("idSubEvento", "idUsuario") DO NOTHING;`,
                [idSubEvento, idInvitado],
              );
              console.log(`      -> Invitado privado en subevento ${idSubEvento}: ${correoInvitado}`);
            }
          }
        }

        // Registrar ponentes si están definidos
        if (sub.ponentes && sub.ponentes.length > 0) {
          for (const ponente of sub.ponentes) {
            await client.query(
              `INSERT INTO ponente (nombre, "apellidoPa", "apellidoMa", correo, "idSubEvento")
               VALUES ($1, $2, $3, $4, $5);`,
              [
                ponente.nombre,
                ponente.apellidoPa,
                ponente.apellidoMa ?? null,
                ponente.correo,
                idSubEvento,
              ],
            );
            console.log(
              `         -> Ponente: ${ponente.nombre} ${ponente.apellidoPa} (${ponente.correo})`,
            );
          }
        }

        // Registrar bitácora histórica para eventos ya dictaminados
        if (
          subdireccionId &&
          (ev.idEstadoEvento === EstadoEvento.ACEPTADO ||
            ev.idEstadoEvento === EstadoEvento.RECHAZADO)
        ) {
          await client.query(
            `INSERT INTO "bitacoraEvento" ("idEvento", "idSubEvento", "idUsuarioActor", "idEstadoEvento")
             VALUES ($1, $2, $3, $4);`,
            [idEvento, idSubEvento, subdireccionId, ev.idEstadoEvento],
          );
        }

        // Sembrar reservas/boletos cuando apliquen y la modalidad admita registro
        if (
          sub.registros &&
          sub.registros.length > 0 &&
          sub.idModalidadAcceso !== ModalidadAcceso.ACCESO_LIBRE
        ) {
          const usaQr =
            sub.idModalidadAcceso === ModalidadAcceso.QR_GENERAL ||
            sub.idModalidadAcceso === ModalidadAcceso.QR_MAPA;
          const fechaFin = construirFechaEnCdmx(sub.fecha, sub.horaFin);
          const expSegundos = Math.max(
            60,
            Math.floor((fechaFin.getTime() - Date.now()) / 1000),
          );

          for (const reg of sub.registros) {
            const idUsuarioAsistente = idsUsuarios[reg.correoUsuario];
            if (!idUsuarioAsistente) continue;

            let idAsiento: number | null = null;
            if (
              sub.idModalidadAcceso === ModalidadAcceso.QR_MAPA &&
              reg.asiento
            ) {
              const resAsiento = await client.query(
                `SELECT "idAsiento"
                 FROM asiento
                 WHERE "idRecinto" = $1 AND fila = $2 AND numero = $3
                 LIMIT 1;`,
                [sub.idRecinto, reg.asiento.fila, reg.asiento.numero],
              );
              if (resAsiento.rows.length > 0) {
                idAsiento = Number(resAsiento.rows[0].idAsiento);
              }
            }

            const fechaGen = new Date(
              Date.now() - reg.horasAntiguedad * 60 * 60 * 1000,
            );
            const resBoleto = await client.query(
              `INSERT INTO boleto ("tokenQR", "fechaGeneracion", "idAsiento", "idEstadoBoleto")
               VALUES ('', $1, $2, $3)
               RETURNING "idBoleto";`,
              [fechaGen, idAsiento, reg.estadoBoleto],
            );
            const idBoleto = Number(resBoleto.rows[0].idBoleto);

            if (usaQr) {
              const token = await jwtService.signAsync(
                { idBoleto, idEvento, idUsuario: idUsuarioAsistente },
                { expiresIn: expSegundos },
              );
              await client.query(
                `UPDATE boleto SET "tokenQR" = $1 WHERE "idBoleto" = $2;`,
                [token, idBoleto],
              );
            }

            await client.query(
              `INSERT INTO "asistenteEvento" ("idSubEvento", "idUsuario", "idBoleto")
               VALUES ($1, $2, $3);`,
              [idSubEvento, idUsuarioAsistente, idBoleto],
            );
          }
          console.log(
            `         -> ${sub.registros.length} registros sembrados para subevento ID ${idSubEvento}`,
          );
        }
      }

      // Crear solicitud de modificación pendiente si fue configurada para el evento
      if (ev.solicitudModificacionPendiente && subeventosCreados.length > 0) {
        const configMod = ev.solicitudModificacionPendiente;
        const subeventosPropuestos = subeventosCreados.map((item, idx) => {
          if (idx === configMod.cambiosEnSubeventoIndice) {
            return {
              ...item,
              idRecinto: configMod.nuevoRecinto,
              fecha: configMod.nuevaFecha,
              horaInicio: configMod.nuevaHoraInicio,
              horaFin: configMod.nuevaHoraFin,
            };
          }
          return item;
        });

        await client.query(
          `INSERT INTO "solicitudModificacion" ("idEvento", "motivoModificacion", "subeventosPropuestos", estado)
           VALUES ($1, $2, $3, 'Pendiente');`,
          [
            idEvento,
            configMod.motivoModificacion,
            JSON.stringify(subeventosPropuestos),
          ],
        );
        console.log(
          `      -> Solicitud de Modificación Pendiente generada para el evento ID: ${idEvento}`,
        );
      }
    }

    console.log('\nSemillas de prueba insertadas con éxito.');
  } catch (error) {
    console.error('Error al sembrar datos de prueba:', error);
  } finally {
    await client.end();
  }
}

if (import.meta.main) {
  runSeed();
}
