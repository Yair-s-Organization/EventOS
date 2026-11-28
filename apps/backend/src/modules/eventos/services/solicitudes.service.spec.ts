import { describe, expect, it } from 'bun:test';
import {
  AlcanceEvento,
  EstadoEvento,
  EstadoSubEvento,
  ModalidadAcceso,
  RecintoId,
} from '@eventos/shared';
import { SolicitudesService } from './solicitudes.service';

describe('SolicitudesService - Sincronización FIFO de invitados en eventos privados', () => {
  it('al reducir aforo en evento privado retira excedentes FIFO y recorta invitaciones al nuevo aforo', async () => {
    const queriesEjecutadas: Array<{ sql: string; params?: any[] }> = [];

    const recintoDestino = {
      idRecinto: RecintoId.SALA_14,
      nombre: 'Sala 14',
      aforo: 2,
      idEstadoRecinto: 1,
    };

    const qbMock: any = {
      innerJoin: () => qbMock,
      where: () => qbMock,
      andWhere: () => qbMock,
      getOne: async () => null,
    };

    const managerMock = {
      getRepository: () => ({
        findOne: async () => recintoDestino,
        createQueryBuilder: () => qbMock,
      }),
      find: async () => [
        {
          idSubEvento: 100,
          idEvento: 15,
          idRecinto: 1,
          idFecha: 50,
          idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
          estado: EstadoSubEvento.ACEPTADO,
          nombre: 'Charla',
          descripcion: 'Desc',
        },
      ],
      update: async () => {},
      save: async (_entity: any, obj: any) => obj,
      query: async (sql: string, params?: any[]) => {
        queriesEjecutadas.push({ sql, params });
        if (sql.includes('FOR UPDATE OF b')) {
          return [
            {
              idBoleto: 1,
              idUsuario: 11,
              correo: 'u1@ipn.mx',
              nombre: 'Uno',
              apellidoPa: 'A',
            },
            {
              idBoleto: 2,
              idUsuario: 12,
              correo: 'u2@ipn.mx',
              nombre: 'Dos',
              apellidoPa: 'B',
            },
            {
              idBoleto: 3,
              idUsuario: 13,
              correo: 'u3@ipn.mx',
              nombre: 'Tres',
              apellidoPa: 'C',
            },
          ];
        }
        return [];
      },
    };

    const service = new SolicitudesService(
      {
        findOneBy: async () => ({
          idEvento: 15,
          nombre: 'Privado FIFO',
          idAlcance: AlcanceEvento.PRIVADO,
          idEstadoEvento: EstadoEvento.ACEPTADO,
          idOrganizador: 1,
        }),
      } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {
        transaction: async (cb: (m: any) => Promise<void>) => cb(managerMock),
      } as any,
      {
        enviarCorreoACambioRecintoConservado: async () => {},
        enviarCorreoDCancelacionSobrecupoFifo: async () => {},
      } as any,
    );

    const fechaValida = `${new Date().getFullYear()}-12-15`;

    await service.aplicarModificacionLogisticaDirecta(
      15,
      [
        {
          idSubEvento: 100,
          nombre: 'Charla',
          descripcion: 'Desc',
          idRecinto: RecintoId.SALA_14,
          idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
          fecha: fechaValida,
          horaInicio: '10:00',
          horaFin: '12:00',
        },
      ],
      1,
      'Ajuste de recinto',
    );

    const deleteExcedentes = queriesEjecutadas.find((q) =>
      q.sql.includes('DELETE FROM "invitacionEvento" ie'),
    );
    expect(deleteExcedentes).toBeDefined();
    expect(deleteExcedentes?.params?.[0]).toBe(100);
    expect(deleteExcedentes?.params?.[1]).toEqual([13]);

    const trimInvitaciones = queriesEjecutadas.find((q) =>
      q.sql.includes('OFFSET $4'),
    );
    expect(trimInvitaciones).toBeDefined();
    expect(trimInvitaciones?.params?.[0]).toBe(100);
    expect(trimInvitaciones?.params?.[3]).toBe(2);
  });

  it('al reducir cupoMaximo en el mismo recinto y modalidad dispara recorte FIFO y correos correspondientes', async () => {
    const queriesEjecutadas: Array<{ sql: string; params?: any[] }> = [];
    const correosD: any[] = [];
    const correosA: any[] = [];

    const recintoSala14 = {
      idRecinto: RecintoId.SALA_14,
      nombre: 'Sala 14',
      aforo: 100,
      idEstadoRecinto: 1,
    };

    const qbMock: any = {
      innerJoin: () => qbMock,
      where: () => qbMock,
      andWhere: () => qbMock,
      getOne: async () => null,
    };

    const managerMock = {
      getRepository: () => ({
        findOne: async () => recintoSala14,
        createQueryBuilder: () => qbMock,
      }),
      find: async () => [
        {
          idSubEvento: 100,
          idEvento: 15,
          idRecinto: RecintoId.SALA_14,
          idFecha: 50,
          cupoMaximo: 80,
          idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
          estado: EstadoSubEvento.ACEPTADO,
          nombre: 'Taller',
          descripcion: 'Desc',
        },
      ],
      update: async () => {},
      save: async (_entity: any, obj: any) => obj,
      query: async (sql: string, params?: any[]) => {
        queriesEjecutadas.push({ sql, params });
        if (sql.includes('FOR UPDATE OF b')) {
          return [
            {
              idBoleto: 1,
              idUsuario: 11,
              correo: 'u1@ipn.mx',
              nombre: 'Uno',
              apellidoPa: 'A',
            },
            {
              idBoleto: 2,
              idUsuario: 12,
              correo: 'u2@ipn.mx',
              nombre: 'Dos',
              apellidoPa: 'B',
            },
            {
              idBoleto: 3,
              idUsuario: 13,
              correo: 'u3@ipn.mx',
              nombre: 'Tres',
              apellidoPa: 'C',
            },
          ];
        }
        return [];
      },
    };

    const service = new SolicitudesService(
      {
        findOneBy: async () => ({
          idEvento: 15,
          nombre: 'Evento Cupo Reducido',
          idAlcance: AlcanceEvento.PUBLICO,
          idEstadoEvento: EstadoEvento.ACEPTADO,
          idOrganizador: 1,
        }),
      } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {
        transaction: async (cb: (m: any) => Promise<void>) => cb(managerMock),
      } as any,
      {
        enviarCorreoACambioRecintoConservado: async (p: any) => {
          correosA.push(p);
        },
        enviarCorreoDCancelacionSobrecupoFifo: async (p: any) => {
          correosD.push(p);
        },
      } as any,
    );

    const fechaValida = `${new Date().getFullYear()}-12-15`;

    await service.aplicarModificacionLogisticaDirecta(
      15,
      [
        {
          idSubEvento: 100,
          nombre: 'Taller',
          descripcion: 'Desc',
          idRecinto: RecintoId.SALA_14,
          idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
          cupoMaximo: 2,
          fecha: fechaValida,
          horaInicio: '10:00',
          horaFin: '12:00',
        },
      ],
      1,
      'Acotación de cupo',
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    const cancelacionBoletos = queriesEjecutadas.find((q) =>
      q.sql.includes('UPDATE boleto'),
    );
    expect(cancelacionBoletos).toBeDefined();
    expect(cancelacionBoletos?.params?.[1]).toEqual([3]);
    expect(correosD).toHaveLength(1);
    expect(correosD[0].destinatario).toBe('u3@ipn.mx');
    expect(correosA).toHaveLength(2);
  });

  it('validarSubeventos rechaza cupoMaximo mayor al aforo físico del recinto', async () => {
    const recintoSala14 = {
      idRecinto: RecintoId.SALA_14,
      nombre: 'Sala 14',
      aforo: 100,
      idEstadoRecinto: 1,
    };
    const qbMock: any = {
      innerJoin: () => qbMock,
      where: () => qbMock,
      andWhere: () => qbMock,
      getOne: async () => null,
    };
    const managerMock: any = {
      getRepository: () => ({
        findOne: async () => recintoSala14,
        createQueryBuilder: () => qbMock,
      }),
    };
    const service = new SolicitudesService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
    const fechaValida = `${new Date().getFullYear()}-12-15`;

    await expect(
      service.validarSubeventos(
        [
          {
            nombre: 'Taller',
            descripcion: 'Desc',
            idRecinto: RecintoId.SALA_14,
            idModalidadAcceso: ModalidadAcceso.QR_GENERAL,
            cupoMaximo: 101,
            fecha: fechaValida,
            horaInicio: '10:00',
            horaFin: '12:00',
          },
        ],
        undefined,
        managerMock,
      ),
    ).rejects.toThrow(/no puede exceder el aforo físico vigente/);
  });
});
