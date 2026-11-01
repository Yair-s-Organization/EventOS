import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  AlcanceEvento,
  EstadoEvento,
  EstadoSubEvento,
  TipoCuentaUsuario,
  type MovimientoBitacoraItem,
} from '@eventos/shared';
import { EventoEntity } from '../entities/evento.entity';
import { UsuarioEntity } from '../../auth/entities/usuario.entity';
import { SubEventoEntity } from '../entities/subevento.entity';
import { FechaEntity } from '../entities/fecha.entity';
import { BitacoraEventoEntity } from '../entities/bitacoraEvento.entity';
import { PonenteEntity } from '../entities/ponente.entity';
import { AsientoEntity } from '../../reservas/entities/asiento.entity';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(EventoEntity)
    private readonly eventoRepository: Repository<EventoEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    @InjectRepository(SubEventoEntity)
    private readonly subEventoRepository: Repository<SubEventoEntity>,
    @InjectRepository(BitacoraEventoEntity)
    private readonly bitacoraEventoRepository: Repository<BitacoraEventoEntity>,
    @InjectRepository(PonenteEntity)
    private readonly ponenteRepository: Repository<PonenteEntity>,
    @InjectRepository(AsientoEntity)
    private readonly asientoRepository: Repository<AsientoEntity>,
    private readonly dataSource: DataSource,
  ) {}

  private obtenerAhoraCDMX(): { fechaHoy: string; horaActual: string } {
    const ahora = new Date();
    const fechaHoy = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(ahora);
    const horaActual = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Mexico_City',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(ahora);
    return { fechaHoy, horaActual };
  }

  async obtenerEventosPublicos(usuarioActual?: {
    sub?: number;
    tipoCuenta?: TipoCuentaUsuario;
  }) {
    const { fechaHoy } = this.obtenerAhoraCDMX();

    const eventos = await this.eventoRepository.find({
      where: { idEstadoEvento: EstadoEvento.ACEPTADO },
      relations: {
        subEventos: {
          fecha: true,
          recinto: true,
        },
      },
      order: { idEvento: 'DESC' },
    });

    const tieneSesion = Boolean(usuarioActual && usuarioActual.sub);
    const esUsuarioInterno =
      tieneSesion &&
      (usuarioActual?.tipoCuenta === TipoCuentaUsuario.INTERNO ||
        usuarioActual?.tipoCuenta === TipoCuentaUsuario.SUBDIRECCION ||
        usuarioActual?.tipoCuenta === TipoCuentaUsuario.ADMINISTRADOR);

    const cartelera = [];

    for (const evento of eventos) {
      if (evento.idAlcance === AlcanceEvento.PRIVADO) {
        continue;
      }

      if (!tieneSesion && evento.idAlcance !== AlcanceEvento.PUBLICO) {
        continue;
      }

      if (evento.idAlcance === AlcanceEvento.INTERNO && !esUsuarioInterno) {
        continue;
      }

      const subeventosVigentes = (evento.subEventos || []).filter((sub) => {
        if (sub.estado === EstadoSubEvento.CANCELADO) return false;
        if (!sub.fecha || sub.fecha.fecha < fechaHoy) return false;

        if (!tieneSesion && sub.accesoQR) {
          return false;
        }
        return true;
      });

      if (subeventosVigentes.length === 0) {
        continue;
      }

      subeventosVigentes.sort((a, b) =>
        a.fecha!.fecha.localeCompare(b.fecha!.fecha),
      );
      const primerSub = subeventosVigentes[0];

      const esAccesoLibre = subeventosVigentes.some((s) => !s.accesoQR);

      cartelera.push({
        idEvento: evento.idEvento,
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        poster: evento.poster,
        idAlcance: evento.idAlcance,
        esAccesoLibre,
        requiereCuenta: !esAccesoLibre,
        fechaProxima: primerSub.fecha?.fecha ?? null,
        horaInicio: primerSub.fecha?.horaInicio ?? null,
        horaFin: primerSub.fecha?.horaFin ?? null,
        recinto: primerSub.recinto
          ? {
              idRecinto: primerSub.recinto.idRecinto,
              nombre: primerSub.recinto.nombre,
              aforo: primerSub.recinto.aforo,
            }
          : null,
        totalSubeventos: subeventosVigentes.length,
      });
    }

    return cartelera;
  }

  async obtenerDetalleEventoPublico(
    idEvento: number,
    usuarioActual?: {
      sub?: number;
      tipoCuenta?: TipoCuentaUsuario;
    },
  ) {
    const evento = await this.eventoRepository.findOne({
      where: { idEvento, idEstadoEvento: EstadoEvento.ACEPTADO },
    });

    if (!evento) {
      throw new NotFoundException(
        'El evento no existe o no se encuentra disponible.',
      );
    }

    const subEventos = await this.subEventoRepository.find({
      where: { idEvento: evento.idEvento },
    });

    const tieneSesion = Boolean(usuarioActual && usuarioActual.sub);
    const esUsuarioInterno =
      tieneSesion &&
      (usuarioActual?.tipoCuenta === TipoCuentaUsuario.INTERNO ||
        usuarioActual?.tipoCuenta === TipoCuentaUsuario.SUBDIRECCION ||
        usuarioActual?.tipoCuenta === TipoCuentaUsuario.ADMINISTRADOR);

    const esAccesoLibre =
      evento.idAlcance === AlcanceEvento.PUBLICO &&
      subEventos.some(
        (sub) => sub.estado !== EstadoSubEvento.CANCELADO && !sub.accesoQR,
      );

    if (!tieneSesion && !esAccesoLibre) {
      throw new ForbiddenException(
        'Debes iniciar sesión o registrarte para consultar eventos que requieren cuenta.',
      );
    }

    if (evento.idAlcance === AlcanceEvento.INTERNO && !esUsuarioInterno) {
      throw new ForbiddenException(
        'Este evento es exclusivo para la comunidad interna del IPN.',
      );
    }

    const subEventosDetallados = [];
    const fechaRepository = this.dataSource.getRepository(FechaEntity);
    const recintoRepository = this.dataSource.getRepository('recinto');

    for (const sub of subEventos) {
      const [fecha, recinto, ponentes, totalAsientosRecinto] =
        await Promise.all([
          fechaRepository.findOne({ where: { idFecha: sub.idFecha } }),
          recintoRepository.findOne({ where: { idRecinto: sub.idRecinto } }),
          this.ponenteRepository.find({
            where: { idSubEvento: sub.idSubEvento },
          }),
          this.asientoRepository.count({ where: { idRecinto: sub.idRecinto } }),
        ]);

      subEventosDetallados.push({
        idSubEvento: sub.idSubEvento,
        nombre: sub.nombre,
        descripcion: sub.descripcion,
        estado: sub.estado,
        accesoQR: sub.accesoQR,
        requiereSeleccionAsiento: totalAsientosRecinto > 0,
        fecha: fecha
          ? {
              idFecha: fecha.idFecha,
              fecha: fecha.fecha,
              horaInicio: fecha.horaInicio,
              horaFin: fecha.horaFin,
            }
          : null,
        recinto: recinto
          ? {
              idRecinto: recinto.idRecinto,
              nombre: recinto['nombre'],
              aforo: recinto['aforo'],
            }
          : null,
        ponentes: ponentes.map((p) => ({
          idPonente: p.idPonente,
          nombre: p.nombre,
          apellidoPa: p.apellidoPa,
          apellidoMa: p.apellidoMa,
        })),
      });
    }

    return {
      idEvento: evento.idEvento,
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      poster: evento.poster,
      idAlcance: evento.idAlcance,
      esAccesoLibre,
      requiereCuenta: !esAccesoLibre,
      subEventos: subEventosDetallados,
    };
  }

  async obtenerBitacoraGeneral(
    buscar?: string,
  ): Promise<MovimientoBitacoraItem[]> {
    const registros = await this.bitacoraEventoRepository.find({
      order: { fechaHoraCambio: 'DESC', idBitacoraEvento: 'DESC' },
    });

    if (registros.length === 0) {
      return [];
    }

    const [eventos, subeventos, usuarios] = await Promise.all([
      this.eventoRepository.find(),
      this.subEventoRepository.find(),
      this.usuarioRepository.find(),
    ]);

    const mapaEventos = new Map(eventos.map((e) => [e.idEvento, e]));
    const mapaSubeventos = new Map(subeventos.map((s) => [s.idSubEvento, s]));
    const mapaUsuarios = new Map(usuarios.map((u) => [u.idUsuario, u]));

    const nombresEstado: Record<number, string> = {
      [EstadoEvento.RECHAZADO]: 'Rechazado',
      [EstadoEvento.ACEPTADO]: 'Aceptado',
      [EstadoEvento.ENPROCESO]: 'En Proceso',
      [EstadoEvento.CANCELADO]: 'Cancelado',
      [EstadoEvento.FINALIZADO]: 'Finalizado',
    };

    let movimientos: MovimientoBitacoraItem[] = registros.map((reg) => {
      const ev = mapaEventos.get(reg.idEvento);
      const sub = mapaSubeventos.get(reg.idSubEvento);
      const idActor = reg.idUsuarioActor ?? ev?.idOrganizador ?? null;
      const usr = idActor ? mapaUsuarios.get(idActor) : undefined;

      const fechaObj = reg.fechaHoraCambio
        ? new Date(reg.fechaHoraCambio)
        : new Date();

      const fecha = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Mexico_City',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(fechaObj);

      const hora = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Mexico_City',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(fechaObj);

      const nombreUsuario = usr
        ? `${usr.nombre} ${usr.apellidoPa} ${usr.apellidoMa || ''}`.trim()
        : 'Sistema';

      return {
        idBitacoraEvento: reg.idBitacoraEvento,
        idEvento: reg.idEvento,
        idSubEvento: reg.idSubEvento,
        evento: ev ? ev.nombre : `Evento #${reg.idEvento}`,
        subEvento: sub ? sub.nombre : `Subevento #${reg.idSubEvento}`,
        idEstadoEvento: reg.idEstadoEvento,
        estado: nombresEstado[reg.idEstadoEvento] ?? 'Desconocido',
        idUsuarioActor: idActor,
        usuario: nombreUsuario,
        correoUsuario: usr?.correo ?? null,
        fecha,
        hora,
        fechaHoraCambio: fechaObj.toISOString(),
      };
    });

    if (buscar && buscar.trim() !== '') {
      const termino = buscar.trim().toLowerCase();
      movimientos = movimientos.filter(
        (m) =>
          m.evento.toLowerCase().includes(termino) ||
          m.subEvento.toLowerCase().includes(termino) ||
          m.estado.toLowerCase().includes(termino) ||
          m.usuario.toLowerCase().includes(termino) ||
          (m.correoUsuario &&
            m.correoUsuario.toLowerCase().includes(termino)) ||
          m.fecha.includes(termino) ||
          m.hora.includes(termino),
      );
    }

    return movimientos;
  }

  async exportarBitacoraGeneral(buscar?: string): Promise<{
    nombreArchivo: string;
    contenidoCsv: string;
    totalRegistros: number;
  }> {
    const movimientos = await this.obtenerBitacoraGeneral(buscar);

    if (!movimientos || movimientos.length === 0) {
      throw new NotFoundException('No hay registros de eventos disponibles.');
    }

    try {
      const escaparCelda = (
        valor: string | number | null | undefined,
      ): string => {
        const texto = String(valor ?? '').replace(/"/g, '""');
        return `"${texto}"`;
      };

      const encabezados = ['Evento', 'Estado', 'Usuario', 'Fecha', 'Hora'];
      const filas = movimientos.map((m) =>
        [
          escaparCelda(m.evento),
          escaparCelda(m.estado),
          escaparCelda(m.usuario),
          escaparCelda(m.fecha),
          escaparCelda(m.hora),
        ].join(','),
      );

      const contenidoCsv =
        '\uFEFF' + [encabezados.join(','), ...filas].join('\r\n');
      const { fechaHoy } = this.obtenerAhoraCDMX();

      return {
        nombreArchivo: `bitacora_general_${fechaHoy}.csv`,
        contenidoCsv,
        totalRegistros: movimientos.length,
      };
    } catch {
      throw new InternalServerErrorException('Error al exportar archivo.');
    }
  }
}
