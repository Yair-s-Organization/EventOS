import { describe, expect, it, mock } from 'bun:test';

mock.module('dns/promises', () => ({
  resolveMx: async (domain: string) =>
    domain === 'invalido.invalid'
      ? []
      : [{ exchange: `mx.${domain}`, priority: 10 }],
}));
import {
  AlcanceEvento,
  EstadoBoleto,
  EstadoEvento,
  EstadoSubEvento,
  ModalidadAcceso,
  TipoCuentaUsuario,
} from '@eventos/shared';
import { OrganizadorService } from './organizador.service';

function crearOrganizadorServiceTest(overrides?: {
  evento?: Record<string, any>;
  usuario?: Record<string, any> | null;
  usuariosPorCorreo?: Record<string, Record<string, any>>;
  invitacionesPreviasPorUsuario?: number[];
  invitacion?: Record<string, any> | null;
  invitacionPrevia?: Record<string, any> | null;
  invitacionesCount?: number;
  boletosCancelados?: Array<{ idBoleto: number }>;
  subeventos?: Array<Record<string, any>>;
  subeventoEncontrado?: Record<string, any> | null;
  fallarEnvioParaCorreos?: string[];
}) {
  const queriesEjecutadas: Array<{ sql: string; params?: any[] }> = [];
  const correosEnviados: Array<{ tipo: string; payload: any }> = [];
  const ponentesGuardados: any[] = [];
  const invitacionesGuardadas: any[] = [];
  let transaccionConfirmada = false;
  let transaccionRevertida = false;

  const eventoBase = overrides?.evento ?? {
    idEvento: 10,
    nombre: 'Evento de Prueba',
    descripcion: 'Descripción de prueba',
    justificacion: 'Justificación de prueba',
    idAlcance: AlcanceEvento.PUBLICO,
    idEstadoEvento: EstadoEvento.ACEPTADO,
    idOrganizador: 1,
    poster: 'poster.jpg',
  };

  const subeventoDefault = {
    idSubEvento: 100,
    idEvento: 10,
    nombre: 'Sub 1',
    descripcion: 'Desc',
    estado: EstadoSubEvento.ACEPTADO,
    idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
    tokenInvitacion: 'token-sub-100',
    enlaceInvitacionActivo: false,
    recinto: { idRecinto: 4, nombre: 'Sala 14', aforo: 40 },
    fecha: {
      idFecha: 1,
      fecha: '2026-12-10',
      horaInicio: '10:00:00',
      horaFin: '12:00:00',
    },
  };

  const managerMock = {
    save: async (_entity: any, obj: any) => obj,
    findOne: async () => overrides?.invitacion ?? null,
    delete: async (_entity: any, criteria: any) => {
      queriesEjecutadas.push({ sql: 'MANAGER_DELETE', params: [criteria] });
      return { affected: 1 };
    },
    query: async (sql: string, params?: any[]) => {
      queriesEjecutadas.push({ sql, params });
      if (sql.includes('UPDATE "boleto"')) {
        return overrides?.boletosCancelados ?? [];
      }
      return [];
    },
  };

  const dataSourceMock = {
    query: async (sql: string, params?: any[]) => {
      queriesEjecutadas.push({ sql, params });
      if (sql.includes('COUNT(*)::int AS total')) {
        return [{ total: 0 }];
      }
      return [];
    },
    createQueryRunner: () => ({
      connect: async () => {},
      startTransaction: async () => {},
      commitTransaction: async () => {
        transaccionConfirmada = true;
      },
      rollbackTransaction: async () => {
        transaccionRevertida = true;
      },
      release: async () => {},
      manager: managerMock,
    }),
  };

  const eventoRepositoryMock = {
    findOne: async () => ({ ...eventoBase }),
    findOneBy: async () => ({ ...eventoBase }),
    save: async (e: any) => e,
  };

  const ponenteRepositoryMock = {
    delete: async (criteria: any) => {
      queriesEjecutadas.push({ sql: 'DELETE_PONENTES', params: [criteria] });
    },
    create: (data: any) => data,
    save: async (items: any[]) => {
      ponentesGuardados.push(...items);
      return items;
    },
  };

  const subEventoRepositoryMock = {
    find: async () => overrides?.subeventos ?? [subeventoDefault],
    findOne: async () =>
      overrides?.subeventoEncontrado !== undefined
        ? overrides.subeventoEncontrado
        : subeventoDefault,
    save: async (s: any) => s,
  };

  const invitacionRepositoryMock = {
    find: async () => [],
    findOne: async (opts?: any) => {
      if (overrides?.invitacionPrevia) return overrides.invitacionPrevia;
      const idUsr = opts?.where?.idUsuario;
      if (idUsr && overrides?.invitacionesPreviasPorUsuario?.includes(idUsr)) {
        return { idInvitacionEvento: 999, idSubEvento: 100, idUsuario: idUsr };
      }
      return null;
    },
    count: async () => overrides?.invitacionesCount ?? 0,
    create: (data: any) => data,
    save: async (data: any) => {
      const saved = { idInvitacionEvento: 501 + invitacionesGuardadas.length, ...data };
      invitacionesGuardadas.push(saved);
      return saved;
    },
    delete: async () => {},
  };

  const usuarioRepositoryMock = {
    findOneBy: async () => overrides?.usuario ?? null,
    findOne: async (opts?: any) => {
      const correo = opts?.where?.correo;
      if (correo && overrides?.usuariosPorCorreo) {
        return overrides.usuariosPorCorreo[correo] ?? null;
      }
      return overrides?.usuario ?? null;
    },
  };

  const mailServiceMock = {
    enviarConfirmacionAsignacionLogistica: async (payload: any) => {
      correosEnviados.push({ tipo: 'confirmacion_logistica', payload });
    },
    enviarInvitacionLogistica: async (payload: any) => {
      correosEnviados.push({ tipo: 'invitacion_logistica', payload });
    },
    enviarNotificacionBoletoCanceladoPorRevocacion: async (payload: any) => {
      correosEnviados.push({ tipo: 'cancelacion_revocacion', payload });
    },
    enviarInvitacionEventoPrivado: async (payload: any) => {
      if (overrides?.fallarEnvioParaCorreos?.includes(payload.destinatario)) {
        throw new Error('SMTP error simulado');
      }
      correosEnviados.push({ tipo: 'invitacion_privado', payload });
    },
  };

  const service = new OrganizadorService(
    eventoRepositoryMock as any,
    ponenteRepositoryMock as any,
    subEventoRepositoryMock as any,
    { findOne: async () => null } as any,
    invitacionRepositoryMock as any,
    usuarioRepositoryMock as any,
    {} as any,
    { resolvePublicUrl: (k: string) => k } as any,
    dataSourceMock as any,
    { sign: () => 'jwt-token' } as any,
    mailServiceMock as any,
  );

  return {
    service,
    queriesEjecutadas,
    correosEnviados,
    ponentesGuardados,
    invitacionesGuardadas,
    getTransaccionEstado: () => ({
      transaccionConfirmada,
      transaccionRevertida,
    }),
  };
}

describe('OrganizadorService - Flujos diferidos, revocación y alcances', () => {
  it('agregarPersonalLogistica con soloVerificar=true NO inserta en BD ni envía correo aunque el usuario exista', async () => {
    const { service, queriesEjecutadas, correosEnviados } =
      crearOrganizadorServiceTest({
        usuario: {
          idUsuario: 42,
          nombre: 'Laura',
          apellidoPa: 'Gómez',
          correo: 'laura@ipn.mx',
        },
      });

    const res = await service.agregarPersonalLogistica(
      10,
      1,
      { correo: 'laura@ipn.mx', soloVerificar: true },
      TipoCuentaUsuario.INTERNO,
    );

    expect(res).toEqual({
      asignadoDirecto: true,
      invitacionEnviada: false,
      mensaje: 'Usuario verificado.',
    });
    expect(
      queriesEjecutadas.some((q) =>
        q.sql.includes('INSERT INTO "eventoPersonalLogistica"'),
      ),
    ).toBe(false);
    expect(correosEnviados).toHaveLength(0);
  });

  it('agregarPersonalLogistica con soloVerificar=false inserta en BD y envía confirmación', async () => {
    const { service, queriesEjecutadas, correosEnviados } =
      crearOrganizadorServiceTest({
        usuario: {
          idUsuario: 42,
          nombre: 'Laura',
          apellidoPa: 'Gómez',
          correo: 'laura@ipn.mx',
        },
      });

    const res = await service.agregarPersonalLogistica(
      10,
      1,
      { correo: 'laura@ipn.mx', soloVerificar: false },
      TipoCuentaUsuario.INTERNO,
    );

    expect(res.asignadoDirecto).toBe(true);
    expect(
      queriesEjecutadas.some((q) =>
        q.sql.includes('INSERT INTO "eventoPersonalLogistica"'),
      ),
    ).toBe(true);
    expect(correosEnviados).toHaveLength(1);
    expect(correosEnviados[0].tipo).toBe('confirmacion_logistica');
  });

  it('revocarInvitacionPrivada cancela boletos activos, limpia retenciones y envía correo si había boleto cancelado', async () => {
    const { service, queriesEjecutadas, correosEnviados, getTransaccionEstado } =
      crearOrganizadorServiceTest({
        invitacion: {
          idInvitacionEvento: 77,
          idSubEvento: 100,
          idUsuario: 55,
          usuario: {
            idUsuario: 55,
            nombre: 'Carlos',
            apellidoPa: 'Pérez',
            correo: 'carlos@ipn.mx',
          },
        },
        boletosCancelados: [{ idBoleto: 901 }],
      });

    const res = await service.revocarInvitacionPrivada(10, 100, 77, 1);

    expect(res.boletosCancelados).toBe(1);
    expect(res.idSubEvento).toBe(100);
    expect(getTransaccionEstado().transaccionConfirmada).toBe(true);
    const updateBoleto = queriesEjecutadas.find((q) =>
      q.sql.includes('UPDATE "boleto"'),
    );
    expect(updateBoleto?.params?.[0]).toBe(EstadoBoleto.CANCELADO);
    expect(updateBoleto?.params?.[1]).toBe(EstadoBoleto.VALIDO);
    expect(
      queriesEjecutadas.some((q) => q.sql.includes('DELETE FROM "retencionAsiento"')),
    ).toBe(true);
    expect(
      queriesEjecutadas.some((q) => q.sql === 'MANAGER_DELETE'),
    ).toBe(true);
    expect(correosEnviados).toHaveLength(1);
    expect(correosEnviados[0].tipo).toBe('cancelacion_revocacion');
    expect(correosEnviados[0].payload.destinatario).toBe('carlos@ipn.mx');
  });

  it('revocarInvitacionPrivada NO envía correo si el invitado no tenía boletos activos', async () => {
    const { service, correosEnviados, getTransaccionEstado } =
      crearOrganizadorServiceTest({
        invitacion: {
          idInvitacionEvento: 78,
          idSubEvento: 100,
          idUsuario: 56,
          usuario: {
            idUsuario: 56,
            nombre: 'Sofía',
            apellidoPa: 'Ruiz',
            correo: 'sofia@ipn.mx',
          },
        },
        boletosCancelados: [],
      });

    const res = await service.revocarInvitacionPrivada(10, 100, 78, 1);

    expect(res.boletosCancelados).toBe(0);
    expect(getTransaccionEstado().transaccionConfirmada).toBe(true);
    expect(correosEnviados).toHaveLength(0);
  });

  it('agregarInvitadoPrivado registra invitación ligada al idSubEvento y envía datos reales de fecha y recinto', async () => {
    const { service, correosEnviados, invitacionesGuardadas } =
      crearOrganizadorServiceTest({
        evento: {
          idEvento: 10,
          nombre: 'Evento Privado',
          descripcion: 'Desc privada',
          idAlcance: AlcanceEvento.PRIVADO,
          idEstadoEvento: EstadoEvento.ACEPTADO,
          idOrganizador: 1,
          poster: 'p.jpg',
        },
        usuario: {
          idUsuario: 88,
          nombre: 'Ana',
          apellidoPa: 'Torres',
          correo: 'ana@ipn.mx',
          estatus: true,
        },
      });

    const res = await service.agregarInvitadoPrivado(10, 100, 1, {
      correo: 'ana@ipn.mx',
    });

    expect(invitacionesGuardadas).toHaveLength(1);
    expect(invitacionesGuardadas[0].idSubEvento).toBe(100);
    expect(res.invitado?.idSubEvento).toBe(100);
    expect(correosEnviados).toHaveLength(1);
    expect(correosEnviados[0].payload.nombreRecinto).toBe('Sala 14');
    expect(correosEnviados[0].payload.fecha).toBe('2026-12-10');
  });

  it('agregarInvitadoPrivado en modalidad Acceso libre para correo sin cuenta envía correo informativo sin enlace de registro', async () => {
    const { service, correosEnviados } = crearOrganizadorServiceTest({
      evento: {
        idEvento: 10,
        nombre: 'Evento Privado Libre',
        descripcion: 'Desc',
        idAlcance: AlcanceEvento.PRIVADO,
        idEstadoEvento: EstadoEvento.ACEPTADO,
        idOrganizador: 1,
        poster: 'p.jpg',
      },
      usuario: null,
      subeventoEncontrado: {
        idSubEvento: 100,
        idEvento: 10,
        nombre: 'Plática Informativa',
        descripcion: 'Desc',
        estado: EstadoSubEvento.ACEPTADO,
        idModalidadAcceso: ModalidadAcceso.ACCESO_LIBRE,
        tokenInvitacion: 'token-libre-100',
        enlaceInvitacionActivo: false,
        recinto: { idRecinto: 4, nombre: 'Sala 14', aforo: 40 },
        fecha: {
          idFecha: 1,
          fecha: '2026-12-10',
          horaInicio: '10:00:00',
          horaFin: '12:00:00',
        },
      },
    });

    const res = await service.agregarInvitadoPrivado(10, 100, 1, {
      correo: 'externo@gmail.com',
    });

    expect(res.invitacionEnviada).toBe(true);
    expect((res as any).esAccesoLibre).toBe(true);
    expect(correosEnviados).toHaveLength(1);
    expect(correosEnviados[0].payload.esAccesoLibre).toBe(true);
    expect(correosEnviados[0].payload.requiereRegistro).toBe(false);
    expect(correosEnviados[0].payload.enlaceEvento).toContain(
      '/eventos/privado/token-libre-100',
    );
  });

  it('actualizarInfoGeneral permite guardar múltiples ponentes distintos sin correo', async () => {
    const { service, ponentesGuardados } = crearOrganizadorServiceTest();

    await service.actualizarInfoGeneral(10, 1, {
      ponentes: [
        { nombre: 'Dr.', apellidoPa: 'Juan', apellidoMa: 'Pérez', correo: '' },
        { nombre: 'Dra.', apellidoPa: 'Ana', apellidoMa: 'López', correo: '' },
      ],
    });

    expect(ponentesGuardados).toHaveLength(2);
    expect(ponentesGuardados[0].correo).toBe('');
    expect(ponentesGuardados[1].correo).toBe('');
  });

  it('actualizarInfoGeneral al cambiar a PRIVADO incorpora asistentes con boleto activo a invitacionEvento', async () => {
    const { service, queriesEjecutadas, getTransaccionEstado } =
      crearOrganizadorServiceTest({
        evento: {
          idEvento: 10,
          nombre: 'Evento',
          descripcion: 'Desc',
          justificacion: 'Just',
          idAlcance: AlcanceEvento.PUBLICO,
          idEstadoEvento: EstadoEvento.ACEPTADO,
          idOrganizador: 1,
          poster: 'p.jpg',
        },
      });

    await service.actualizarInfoGeneral(10, 1, {
      idAlcance: AlcanceEvento.PRIVADO,
    });

    expect(getTransaccionEstado().transaccionConfirmada).toBe(true);
    expect(
      queriesEjecutadas.some((q) =>
        q.sql.includes('INSERT INTO "invitacionEvento"'),
      ),
    ).toBe(true);
  });

  it('actualizarInfoGeneral al pasar de PRIVADO a PUBLICO limpia invitacionEvento', async () => {
    const { service, queriesEjecutadas, getTransaccionEstado } =
      crearOrganizadorServiceTest({
        evento: {
          idEvento: 10,
          nombre: 'Evento',
          descripcion: 'Desc',
          justificacion: 'Just',
          idAlcance: AlcanceEvento.PRIVADO,
          idEstadoEvento: EstadoEvento.ACEPTADO,
          idOrganizador: 1,
          poster: 'p.jpg',
        },
      });

    await service.actualizarInfoGeneral(10, 1, {
      idAlcance: AlcanceEvento.PUBLICO,
    });

    expect(getTransaccionEstado().transaccionConfirmada).toBe(true);
    expect(
      queriesEjecutadas.some((q) =>
        q.sql.includes('DELETE FROM "invitacionEvento"'),
      ),
    ).toBe(true);
  });

  it('agregarInvitadosMasivo procesa lote mixto, respeta aforo del subevento y reporta fallidos exactos', async () => {
    const { service, invitacionesGuardadas, correosEnviados } =
      crearOrganizadorServiceTest({
        evento: {
          idEvento: 10,
          nombre: 'Evento Masivo',
          descripcion: 'Desc',
          idAlcance: AlcanceEvento.PRIVADO,
          idEstadoEvento: EstadoEvento.ACEPTADO,
          idOrganizador: 1,
          poster: 'p.jpg',
        },
        subeventoEncontrado: {
          idSubEvento: 100,
          idEvento: 10,
          nombre: 'Taller Privado',
          descripcion: 'Desc',
          estado: EstadoSubEvento.ACEPTADO,
          idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
          tokenInvitacion: 'token-100',
          enlaceInvitacionActivo: false,
          recinto: { idRecinto: 4, nombre: 'Sala 14', aforo: 3 },
          fecha: {
            idFecha: 1,
            fecha: '2026-12-10',
            horaInicio: '10:00:00',
            horaFin: '12:00:00',
          },
        },
        invitacionesCount: 1,
        invitacionesPreviasPorUsuario: [20],
        usuariosPorCorreo: {
          'registrado@ipn.mx': {
            idUsuario: 21,
            nombre: 'Luis',
            apellidoPa: 'Mora',
            correo: 'registrado@ipn.mx',
            estatus: true,
          },
          'yainvitado@ipn.mx': {
            idUsuario: 20,
            nombre: 'Previo',
            apellidoPa: 'User',
            correo: 'yainvitado@ipn.mx',
            estatus: true,
          },
          'fallasmtp@ipn.mx': {
            idUsuario: 22,
            nombre: 'Falla',
            apellidoPa: 'SMTP',
            correo: 'fallasmtp@ipn.mx',
            estatus: true,
          },
        },
        fallarEnvioParaCorreos: ['fallasmtp@ipn.mx'],
      });

    const res = await service.agregarInvitadosMasivo(
      10,
      100,
      1,
      {
        correos: [
          'correo-invalido',
          'yainvitado@ipn.mx',
          'fallasmtp@ipn.mx',
          'registrado@ipn.mx',
          'nuevo@gmail.com',
          'excedente@gmail.com',
        ],
      },
      0,
    );

    expect(res.totalProcesados).toBe(6);
    expect(res.exitosos.map((e) => e.correo)).toEqual(['registrado@ipn.mx']);
    expect(res.pendientesRegistro).toEqual(['nuevo@gmail.com']);
    expect(res.omitidos.map((o) => o.correo)).toEqual([
      'yainvitado@ipn.mx',
      'excedente@gmail.com',
    ]);
    expect(res.fallidos.map((f) => f.correo)).toEqual([
      'correo-invalido',
      'fallasmtp@ipn.mx',
    ]);
    expect(res.cupoRestante).toBe(0);
    expect(invitacionesGuardadas).toHaveLength(1);
    expect(correosEnviados).toHaveLength(2);
  });

  it('actualizarEnlaceInvitacion y regenerarEnlaceInvitacion actualizan el switch y rotan el token del subevento', async () => {
    const { service } = crearOrganizadorServiceTest({
      evento: {
        idEvento: 10,
        nombre: 'Evento Privado',
        descripcion: 'Desc',
        idAlcance: AlcanceEvento.PRIVADO,
        idEstadoEvento: EstadoEvento.ACEPTADO,
        idOrganizador: 1,
        poster: 'p.jpg',
      },
    });

    const activado = await service.actualizarEnlaceInvitacion(10, 100, 1, true);
    expect(activado.enlaceInvitacionActivo).toBe(true);
    expect(activado.tokenInvitacion).toBe('token-sub-100');

    const regenerado = await service.regenerarEnlaceInvitacion(10, 100, 1);
    expect(regenerado.tokenInvitacion).not.toBe('token-sub-100');
    expect(regenerado.tokenInvitacion.length).toBeGreaterThan(10);
  });

  it('agregarInvitadosMasivo respeta cupoMaximo configurado menor al aforo del recinto', async () => {
    const { service, invitacionesGuardadas } = crearOrganizadorServiceTest({
      evento: {
        idEvento: 10,
        nombre: 'Taller Acotado',
        descripcion: 'Desc',
        idAlcance: AlcanceEvento.PRIVADO,
        idEstadoEvento: EstadoEvento.ACEPTADO,
        idOrganizador: 1,
        poster: 'p.jpg',
      },
      subeventoEncontrado: {
        idSubEvento: 100,
        idEvento: 10,
        nombre: 'Taller Privado',
        descripcion: 'Desc',
        estado: EstadoSubEvento.ACEPTADO,
        idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
        cupoMaximo: 2,
        tokenInvitacion: 'token-100',
        enlaceInvitacionActivo: false,
        recinto: { idRecinto: 4, nombre: 'Sala 14', aforo: 100 },
        fecha: {
          idFecha: 1,
          fecha: '2026-12-10',
          horaInicio: '10:00:00',
          horaFin: '12:00:00',
        },
      },
      invitacionesCount: 1,
      usuariosPorCorreo: {
        'uno@ipn.mx': {
          idUsuario: 21,
          nombre: 'Uno',
          apellidoPa: 'Test',
          correo: 'uno@ipn.mx',
          estatus: true,
        },
        'dos@ipn.mx': {
          idUsuario: 22,
          nombre: 'Dos',
          apellidoPa: 'Test',
          correo: 'dos@ipn.mx',
          estatus: true,
        },
      },
    });

    const res = await service.agregarInvitadosMasivo(
      10,
      100,
      1,
      { correos: ['uno@ipn.mx', 'dos@ipn.mx'] },
      0,
    );

    expect(res.exitosos.map((e) => e.correo)).toEqual(['uno@ipn.mx']);
    expect(res.omitidos.map((o) => o.correo)).toEqual(['dos@ipn.mx']);
    expect(res.cupoRestante).toBe(0);
    expect(invitacionesGuardadas).toHaveLength(1);
  });
});
