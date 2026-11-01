import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  EstadoBoleto,
  type EventoOrganizadorDetalle,
  type EventoOrganizadorDetalleSubevento,
  type MisEventosItem,
  type Ponente,
  type PrimerSubeventoResumen,
} from '@eventos/shared';
import { EventoEntity } from '../entities/evento.entity';
import { PonenteEntity } from '../entities/ponente.entity';
import { StorageService } from '../../../common/storage/storage.service';

@Injectable()
export class OrganizadorService {
  constructor(
    @InjectRepository(EventoEntity)
    private readonly eventoRepository: Repository<EventoEntity>,
    @InjectRepository(PonenteEntity)
    private readonly ponenteRepository: Repository<PonenteEntity>,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
  ) {}

  private obtenerPosterUrl(poster?: string | null): string | null {
    if (!poster) return null;
    return poster.startsWith('http://') || poster.startsWith('https://')
      ? poster
      : this.storageService.publicUrl(poster);
  }

  private async contarBoletosValidosPorSubevento(
    subEventoIds: number[],
  ): Promise<Map<number, number>> {
    const boletosPorSubevento = new Map<number, number>();
    if (subEventoIds.length === 0) {
      return boletosPorSubevento;
    }

    const conteos: { idSubEvento: number; total: string }[] =
      await this.dataSource.query(
        `SELECT ae."idSubEvento", COUNT(b."idBoleto") as total
         FROM "asistenteEvento" ae
         INNER JOIN "boleto" b ON ae."idBoleto" = b."idBoleto"
         WHERE ae."idSubEvento" = ANY($1) AND b."idEstadoBoleto" = $2
         GROUP BY ae."idSubEvento"`,
        [subEventoIds, EstadoBoleto.VALIDO],
      );

    for (const row of conteos) {
      boletosPorSubevento.set(Number(row.idSubEvento), Number(row.total));
    }

    return boletosPorSubevento;
  }

  async obtenerMisEventos(idOrganizador: number): Promise<MisEventosItem[]> {
    const eventos = await this.eventoRepository.find({
      where: { idOrganizador },
      relations: {
        subEventos: {
          fecha: true,
          recinto: true,
        },
      },
      order: { idEvento: 'DESC' },
    });

    if (eventos.length === 0) {
      return [];
    }

    const subEventoIds = eventos
      .flatMap((e) => e.subEventos || [])
      .map((s) => s.idSubEvento);

    const boletosPorSubevento =
      await this.contarBoletosValidosPorSubevento(subEventoIds);

    return eventos.map((evento) => {
      const subeventos = [...(evento.subEventos || [])].sort((a, b) => {
        const fechaA = a.fecha?.fecha
          ? `${a.fecha.fecha}T${a.fecha.horaInicio || '00:00'}`
          : '';
        const fechaB = b.fecha?.fecha
          ? `${b.fecha.fecha}T${b.fecha.horaInicio || '00:00'}`
          : '';
        return fechaA.localeCompare(fechaB);
      });

      const primerSub = subeventos[0] || null;
      const primerSubevento: PrimerSubeventoResumen | null = primerSub
        ? {
            idSubEvento: primerSub.idSubEvento,
            nombre: primerSub.nombre,
            fecha: primerSub.fecha ? primerSub.fecha.fecha : null,
            horaInicio: primerSub.fecha ? primerSub.fecha.horaInicio : null,
            horaFin: primerSub.fecha ? primerSub.fecha.horaFin : null,
            nombreRecinto: primerSub.recinto ? primerSub.recinto.nombre : null,
          }
        : null;

      const cupoMaximo = primerSub?.recinto?.aforo ?? 0;
      const boletosEmitidos = subeventos.reduce(
        (acc, sub) => acc + (boletosPorSubevento.get(sub.idSubEvento) || 0),
        0,
      );

      return {
        idEvento: evento.idEvento,
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        justificacion: evento.justificacion,
        poster: evento.poster,
        posterUrl: this.obtenerPosterUrl(evento.poster),
        idAlcance: evento.idAlcance,
        idEstadoEvento: evento.idEstadoEvento,
        cupoMaximo,
        boletosEmitidos,
        primerSubevento,
      };
    });
  }

  async obtenerDetalleOrganizador(
    idEvento: number,
    idOrganizador: number,
  ): Promise<EventoOrganizadorDetalle> {
    const evento = await this.eventoRepository.findOne({
      where: { idEvento },
      relations: {
        subEventos: {
          fecha: true,
          recinto: true,
        },
      },
    });

    if (!evento) {
      throw new NotFoundException('No se encontró el evento solicitado.');
    }

    if (evento.idOrganizador !== idOrganizador) {
      throw new ForbiddenException(
        'No tienes permisos para administrar este evento.',
      );
    }

    const subeventos = [...(evento.subEventos || [])].sort((a, b) => {
      const fechaA = a.fecha?.fecha
        ? `${a.fecha.fecha}T${a.fecha.horaInicio || '00:00'}`
        : '';
      const fechaB = b.fecha?.fecha
        ? `${b.fecha.fecha}T${b.fecha.horaInicio || '00:00'}`
        : '';
      return fechaA.localeCompare(fechaB);
    });

    const subEventoIds = subeventos.map((s) => s.idSubEvento);
    const boletosPorSubevento =
      await this.contarBoletosValidosPorSubevento(subEventoIds);

    const ponentesPorSubevento = new Map<number, Ponente[]>();
    if (subEventoIds.length > 0) {
      const ponentes = await this.ponenteRepository.find({
        where: subEventoIds.map((id) => ({ idSubEvento: id })),
      });
      for (const ponente of ponentes) {
        const lista = ponentesPorSubevento.get(ponente.idSubEvento) || [];
        lista.push({
          idPonente: ponente.idPonente,
          nombre: ponente.nombre,
          apellidoPa: ponente.apellidoPa,
          apellidoMa: ponente.apellidoMa,
          correo: ponente.correo,
          idSubEvento: ponente.idSubEvento,
        });
        ponentesPorSubevento.set(ponente.idSubEvento, lista);
      }
    }

    let boletosActivosCount = 0;
    const subEventosDetallados: EventoOrganizadorDetalleSubevento[] =
      subeventos.map((sub) => {
        const emitidos = boletosPorSubevento.get(sub.idSubEvento) || 0;
        boletosActivosCount += emitidos;

        return {
          idSubEvento: sub.idSubEvento,
          nombre: sub.nombre,
          descripcion: sub.descripcion,
          accesoQR: sub.accesoQR,
          estado: sub.estado,
          fecha: sub.fecha
            ? {
                idFecha: sub.fecha.idFecha,
                fecha: sub.fecha.fecha,
                horaInicio: sub.fecha.horaInicio,
                horaFin: sub.fecha.horaFin,
              }
            : null,
          recinto: sub.recinto
            ? {
                idRecinto: sub.recinto.idRecinto,
                nombre: sub.recinto.nombre,
                aforo: sub.recinto.aforo,
                idEstadoRecinto: sub.recinto.idEstadoRecinto,
              }
            : null,
          ponentes: ponentesPorSubevento.get(sub.idSubEvento) || [],
          boletosEmitidos: emitidos,
        };
      });

    const primerSub = subeventos[0];
    const cupoMaximo = primerSub?.recinto?.aforo ?? 0;

    return {
      idEvento: evento.idEvento,
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      justificacion: evento.justificacion,
      poster: evento.poster,
      posterUrl: this.obtenerPosterUrl(evento.poster),
      idAlcance: evento.idAlcance,
      idEstadoEvento: evento.idEstadoEvento,
      esUrgente: evento.esUrgente,
      idOrganizador: evento.idOrganizador,
      cupoMaximo,
      boletosActivosCount,
      subEventos: subEventosDetallados,
    };
  }
}
