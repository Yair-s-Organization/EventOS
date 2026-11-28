import { describe, expect, it } from 'bun:test';
import {
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  AlcanceEvento,
  calcularCapacidadEfectiva,
  EstadoEvento,
  EstadoSubEvento,
  ModalidadAcceso,
  TipoCuentaUsuario,
} from '@eventos/shared';
import { EventosService } from './eventos.service';

function crearEventosServiceTest(params: {
  idAlcance: AlcanceEvento;
  subEventosInvitadosIds?: number[];
  esLogistica?: boolean;
  tieneBoletoPrevio?: boolean;
  subEventosCustom?: Array<Record<string, any>>;
  subEventoPorToken?: Record<string, any> | null;
  ocupadosReales?: number;
}) {
  const queriesEjecutadas: Array<{ sql: string; params?: any[] }> = [];

  const eventoMock = {
    idEvento: 20,
    nombre: 'Evento Privado o Interno',
    descripcion: 'Descripción del evento',
    idAlcance: params.idAlcance,
    idEstadoEvento: EstadoEvento.ACEPTADO,
    idOrganizador: 99,
    poster: 'poster.jpg',
  };

  const subEventosMock = params.subEventosCustom ?? [
    {
      idSubEvento: 201,
      idEvento: 20,
      nombre: 'Actividad 1',
      descripcion: 'Desc act',
      estado: EstadoSubEvento.ACEPTADO,
      idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
      idFecha: 1,
      idRecinto: 1,
      tokenInvitacion: 'token-sub-201',
      enlaceInvitacionActivo: true,
    },
  ];

  const ejecutarQuery = async (sql: string, queryParams?: any[]) => {
    queriesEjecutadas.push({ sql, params: queryParams });
    if (sql.includes('AS total')) {
      return [{ total: params.ocupadosReales ?? 0 }];
    }
    if (sql.includes('FROM "invitacionEvento"')) {
      return (params.subEventosInvitadosIds ?? []).map((idSubEvento) => ({
        idSubEvento,
      }));
    }
    if (sql.includes('FROM "eventoPersonalLogistica"')) {
      return params.esLogistica ? [{ '?column?': 1 }] : [];
    }
    if (sql.includes('FROM "asistenteEvento"')) {
      return params.tieneBoletoPrevio ? [{ '?column?': 1 }] : [];
    }
    return [];
  };

  const managerMock = {
    findOne: async (entity: any) => {
      if (entity === 'recinto' || entity?.name === 'RecintoEntity') {
        return { idRecinto: 1, nombre: 'Sala 14', aforo: 40 };
      }
      if (entity?.name === 'EventoEntity') {
        return eventoMock;
      }
      return params.subEventoPorToken !== undefined
        ? params.subEventoPorToken
        : { ...subEventosMock[0], evento: eventoMock };
    },
    query: ejecutarQuery,
  };

  const dataSourceMock = {
    query: ejecutarQuery,
    createQueryRunner: () => ({
      connect: async () => {},
      startTransaction: async () => {},
      commitTransaction: async () => {},
      rollbackTransaction: async () => {},
      release: async () => {},
      manager: managerMock,
    }),
    getRepository: (name: string) => ({
      findOne: async () =>
        name === 'recinto'
          ? { idRecinto: 1, nombre: 'Sala 14', aforo: 40 }
          : {
              idFecha: 1,
              fecha: '2026-12-10',
              horaInicio: '10:00:00',
              horaFin: '12:00:00',
            },
    }),
  };

  const service = new EventosService(
    { findOne: async () => eventoMock } as any,
    {} as any,
    {
      find: async () => subEventosMock,
      findOne: async () =>
        params.subEventoPorToken !== undefined
          ? params.subEventoPorToken
          : {
              ...subEventosMock[0],
              evento: eventoMock,
              recinto: { idRecinto: 1, nombre: 'Sala 14', aforo: 40 },
              fecha: {
                idFecha: 1,
                fecha: '2026-12-10',
                horaInicio: '10:00:00',
                horaFin: '12:00:00',
              },
            },
    } as any,
    {} as any,
    { find: async () => [] } as any,
    { count: async () => 0 } as any,
    dataSourceMock as any,
    { resolvePublicUrl: (k: string) => k } as any,
  );

  return Object.assign(service, { queriesEjecutadas });
}

describe('EventosService - Acceso a Eventos Privados e Internos con boleto previo', () => {
  it('lanza ForbiddenException (403) al consultar un evento privado sin sesión activa', async () => {
    const service = crearEventosServiceTest({ idAlcance: AlcanceEvento.PRIVADO });

    await expect(service.obtenerDetalleEventoPublico(20)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('lanza ForbiddenException (403) cuando un usuario autenticado sin invitación consulta evento privado', async () => {
    const service = crearEventosServiceTest({
      idAlcance: AlcanceEvento.PRIVADO,
      subEventosInvitadosIds: [],
      esLogistica: false,
    });

    await expect(
      service.obtenerDetalleEventoPublico(20, {
        sub: 50,
        tipoCuenta: TipoCuentaUsuario.INTERNO,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('permite acceso al evento privado cuando el usuario está invitado y filtra solo sus subeventos invitados', async () => {
    const service = crearEventosServiceTest({
      idAlcance: AlcanceEvento.PRIVADO,
      subEventosInvitadosIds: [202],
      subEventosCustom: [
        {
          idSubEvento: 201,
          idEvento: 20,
          nombre: 'Actividad Privada A',
          descripcion: 'Desc A',
          estado: EstadoSubEvento.ACEPTADO,
          idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
          idFecha: 1,
          idRecinto: 1,
        },
        {
          idSubEvento: 202,
          idEvento: 20,
          nombre: 'Actividad Privada B',
          descripcion: 'Desc B',
          estado: EstadoSubEvento.ACEPTADO,
          idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
          idFecha: 1,
          idRecinto: 1,
        },
      ],
    });

    const detalle = await service.obtenerDetalleEventoPublico(20, {
      sub: 50,
      tipoCuenta: TipoCuentaUsuario.EXTERNO,
    });

    expect(detalle.idEvento).toBe(20);
    expect(detalle.subEventos).toHaveLength(1);
    expect(detalle.subEventos[0].idSubEvento).toBe(202);
  });

  it('bloquea a un usuario externo en evento INTERNO si no tiene boleto previo', async () => {
    const service = crearEventosServiceTest({
      idAlcance: AlcanceEvento.INTERNO,
      tieneBoletoPrevio: false,
    });

    await expect(
      service.obtenerDetalleEventoPublico(20, {
        sub: 60,
        tipoCuenta: TipoCuentaUsuario.EXTERNO,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('permite consultar el detalle de un evento INTERNO a un usuario externo que ya tiene boleto previo', async () => {
    const service = crearEventosServiceTest({
      idAlcance: AlcanceEvento.INTERNO,
      tieneBoletoPrevio: true,
    });

    const detalle = await service.obtenerDetalleEventoPublico(20, {
      sub: 60,
      tipoCuenta: TipoCuentaUsuario.EXTERNO,
    });

    expect(detalle.idEvento).toBe(20);
  });

  it('obtenerDetalleSubEventoPrivadoPorToken muestra ficha sin login cuando enlaceInvitacionActivo es true', async () => {
    const service = crearEventosServiceTest({
      idAlcance: AlcanceEvento.PRIVADO,
      ocupadosReales: 5,
    });

    const detalle =
      await service.obtenerDetalleSubEventoPrivadoPorToken('token-sub-201');

    expect(detalle.idSubEvento).toBe(201);
    expect(detalle.usuarioAutenticado).toBe(false);
    expect(detalle.cupoDisponible).toBe(35);
  });

  it('obtenerDetalleSubEventoPrivadoPorToken bloquea (403) cuando enlaceInvitacionActivo es false y usuario no está invitado', async () => {
    const service = crearEventosServiceTest({
      idAlcance: AlcanceEvento.PRIVADO,
      subEventoPorToken: {
        idSubEvento: 201,
        idEvento: 20,
        nombre: 'Actividad Privada',
        descripcion: 'Desc',
        estado: EstadoSubEvento.ACEPTADO,
        idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
        tokenInvitacion: 'token-off',
        enlaceInvitacionActivo: false,
        evento: {
          idEvento: 20,
          nombre: 'Evento Privado',
          descripcion: 'Desc',
          idAlcance: AlcanceEvento.PRIVADO,
          idEstadoEvento: EstadoEvento.ACEPTADO,
          idOrganizador: 99,
          poster: 'p.jpg',
        },
      },
    });

    await expect(
      service.obtenerDetalleSubEventoPrivadoPorToken('token-off'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('aceptarEnlaceSubEventoPrivado en Acceso libre NO inserta en invitacionEvento', async () => {
    const service = crearEventosServiceTest({
      idAlcance: AlcanceEvento.PRIVADO,
      subEventoPorToken: {
        idSubEvento: 201,
        idEvento: 20,
        idRecinto: 1,
        estado: EstadoSubEvento.ACEPTADO,
        idModalidadAcceso: ModalidadAcceso.ACCESO_LIBRE,
        tokenInvitacion: 'token-libre',
        enlaceInvitacionActivo: true,
      },
    });

    const res = await service.aceptarEnlaceSubEventoPrivado('token-libre', 50);

    expect(res.autorizado).toBe(true);
    expect(res.esAccesoLibre).toBe(true);
    expect(
      service.queriesEjecutadas.some((q) =>
        q.sql.includes('INSERT INTO "invitacionEvento"'),
      ),
    ).toBe(false);
  });

  it('aceptarEnlaceSubEventoPrivado autoriza al usuario con sesión activa cuando hay cupo real disponible', async () => {
    const service = crearEventosServiceTest({
      idAlcance: AlcanceEvento.PRIVADO,
      ocupadosReales: 10,
    });

    const res = await service.aceptarEnlaceSubEventoPrivado(
      'token-sub-201',
      50,
    );

    expect(res.autorizado).toBe(true);
    expect(res.yaAutorizado).toBe(false);
    expect(
      service.queriesEjecutadas.some((q) =>
        q.sql.includes('INSERT INTO "invitacionEvento"'),
      ),
    ).toBe(true);
  });

  it('aceptarEnlaceSubEventoPrivado lanza ConflictException (409) cuando el recinto alcanzó su cupo real', async () => {
    const service = crearEventosServiceTest({
      idAlcance: AlcanceEvento.PRIVADO,
      ocupadosReales: 40,
    });

    await expect(
      service.aceptarEnlaceSubEventoPrivado('token-sub-201', 50),
    ).rejects.toThrow(ConflictException);
  });

  it('aceptarEnlaceSubEventoPrivado respeta cupoMaximo configurado menor al aforo del recinto', async () => {
    const service = crearEventosServiceTest({
      idAlcance: AlcanceEvento.PRIVADO,
      ocupadosReales: 15,
      subEventoPorToken: {
        idSubEvento: 201,
        idEvento: 20,
        idRecinto: 1,
        estado: EstadoSubEvento.ACEPTADO,
        idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
        cupoMaximo: 15,
        tokenInvitacion: 'token-cupo-15',
        enlaceInvitacionActivo: true,
      },
    });

    await expect(
      service.aceptarEnlaceSubEventoPrivado('token-cupo-15', 50),
    ).rejects.toThrow(ConflictException);
  });

  it('calcularCapacidadEfectiva aplica min(cupoMaximo, aforoReal) cuando bajan equipos disponibles', () => {
    expect(
      calcularCapacidadEfectiva(36, 34, ModalidadAcceso.QR_GENERAL),
    ).toBe(34);
    expect(
      calcularCapacidadEfectiva(20, 34, ModalidadAcceso.QR_GENERAL),
    ).toBe(20);
    expect(
      calcularCapacidadEfectiva(50, 242, ModalidadAcceso.QR_MAPA),
    ).toBe(242);
  });
});
