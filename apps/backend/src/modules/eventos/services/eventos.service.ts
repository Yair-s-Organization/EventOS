import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  AlcanceEvento,
  calcularCapacidadEfectiva,
  esLaboratorioRecinto,
  EstadoBoleto,
  EstadoEvento,
  EstadoSubEvento,
  ModalidadAcceso,
  TipoCuentaUsuario,
  type DetalleSubEventoPrivadoResponse,
  type MovimientoBitacoraItem,
} from '@eventos/shared';
import { EventoEntity } from '../entities/evento.entity';
import { UsuarioEntity } from '../../auth/entities/usuario.entity';
import { SubEventoEntity } from '../entities/subevento.entity';
import { FechaEntity } from '../entities/fecha.entity';
import { BitacoraEventoEntity } from '../entities/bitacoraEvento.entity';
import { PonenteEntity } from '../entities/ponente.entity';
import { AsientoEntity } from '../../reservas/entities/asiento.entity';
import { RecintoEntity } from '../../recintos/entities/recinto.entity';
import { StorageService } from '../../../common/storage/storage.service';

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
    private readonly storageService: StorageService,
  ) {}

  private async obtenerAforoRealRecinto(
    idRecinto: number,
    aforoBase: number,
    ejecutor?: { query: (sql: string, params?: any[]) => Promise<any[]> },
  ): Promise<number> {
    if (!esLaboratorioRecinto(idRecinto)) {
      return aforoBase;
    }
    const runner = ejecutor ?? this.dataSource;
    const filas = await runner.query(
      `SELECT COUNT(*)::int AS total FROM "estadoEquipo" WHERE "idRecinto" = $1 AND estado = true`,
      [idRecinto],
    );
    return Number(filas[0]?.total ?? 0);
  }

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

    let eventosPrivadosInvitados = new Set<number>();
    if (tieneSesion) {
      const invitadosRaw = await this.dataSource.query(
        `SELECT DISTINCT se."idEvento"
         FROM "invitacionEvento" ie
         INNER JOIN "subEvento" se ON ie."idSubEvento" = se."idSubEvento"
         WHERE ie."idUsuario" = $1
           AND se.estado <> $2`,
        [usuarioActual!.sub, EstadoSubEvento.CANCELADO],
      );
      eventosPrivadosInvitados = new Set(
        invitadosRaw.map((r: any) => Number(r.idEvento)),
      );
    }

    const cartelera = [];

    for (const evento of eventos) {
      if (evento.idAlcance === AlcanceEvento.PRIVADO) {
        if (!tieneSesion) {
          continue;
        }
        const esOrganizador = evento.idOrganizador === usuarioActual?.sub;
        const esDirectivo =
          usuarioActual?.tipoCuenta === TipoCuentaUsuario.SUBDIRECCION ||
          usuarioActual?.tipoCuenta === TipoCuentaUsuario.ADMINISTRADOR;
        const estaInvitado = eventosPrivadosInvitados.has(evento.idEvento);
        if (!esOrganizador && !esDirectivo && !estaInvitado) {
          continue;
        }
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
        return true;
      });

      if (subeventosVigentes.length === 0) {
        continue;
      }

      subeventosVigentes.sort((a, b) =>
        a.fecha!.fecha.localeCompare(b.fecha!.fecha),
      );
      const primerSub = subeventosVigentes[0];

      const esAccesoLibre = subeventosVigentes.some(
        (s) => s.idModalidadAcceso === ModalidadAcceso.ACCESO_LIBRE,
      );
      const posterUrl = this.storageService.resolvePublicUrl(evento.poster);

      cartelera.push({
        idEvento: evento.idEvento,
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        poster: posterUrl,
        posterUrl,
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

    const subEventos = (
      await this.subEventoRepository.find({
        where: { idEvento: evento.idEvento },
      })
    ).filter((s) => s.estado !== EstadoSubEvento.CANCELADO);

    const tieneSesion = Boolean(usuarioActual && usuarioActual.sub);
    const esUsuarioInterno =
      tieneSesion &&
      (usuarioActual?.tipoCuenta === TipoCuentaUsuario.INTERNO ||
        usuarioActual?.tipoCuenta === TipoCuentaUsuario.SUBDIRECCION ||
        usuarioActual?.tipoCuenta === TipoCuentaUsuario.ADMINISTRADOR);

    const esAccesoLibre =
      evento.idAlcance === AlcanceEvento.PUBLICO &&
      subEventos.some(
        (sub) =>
          sub.estado !== EstadoSubEvento.CANCELADO &&
          sub.idModalidadAcceso === ModalidadAcceso.ACCESO_LIBRE,
      );

    let subEventosVisibles = subEventos;

    if (evento.idAlcance === AlcanceEvento.PRIVADO) {
      if (!tieneSesion) {
        throw new ForbiddenException(
          'Debes iniciar sesión con tu cuenta invitada para consultar este evento privado.',
        );
      }
      const esOrganizador = evento.idOrganizador === usuarioActual?.sub;
      const esDirectivo =
        usuarioActual?.tipoCuenta === TipoCuentaUsuario.SUBDIRECCION ||
        usuarioActual?.tipoCuenta === TipoCuentaUsuario.ADMINISTRADOR;

      const invitadoRaw = await this.dataSource.query(
        `SELECT ie."idSubEvento"
         FROM "invitacionEvento" ie
         INNER JOIN "subEvento" se ON ie."idSubEvento" = se."idSubEvento"
         WHERE se."idEvento" = $1
           AND ie."idUsuario" = $2
           AND se.estado <> $3`,
        [evento.idEvento, usuarioActual!.sub, EstadoSubEvento.CANCELADO],
      );
      const subEventosInvitados = new Set<number>(
        invitadoRaw.map((r: any) => Number(r.idSubEvento)),
      );
      const estaInvitado = subEventosInvitados.size > 0;

      const logisticaRaw = await this.dataSource.query(
        `SELECT 1 FROM "eventoPersonalLogistica" WHERE "idEvento" = $1 AND "idUsuario" = $2 LIMIT 1`,
        [evento.idEvento, usuarioActual!.sub],
      );
      const esLogistica = logisticaRaw.length > 0;

      if (!esOrganizador && !esDirectivo && !estaInvitado && !esLogistica) {
        throw new ForbiddenException(
          'No tienes permiso para consultar este evento. Si recibiste una invitación en otra cuenta, inicia sesión con ella.',
        );
      }

      if (!esOrganizador && !esDirectivo && !esLogistica) {
        subEventosVisibles = subEventos.filter((sub) =>
          subEventosInvitados.has(sub.idSubEvento),
        );
      }
    }

    if (!tieneSesion && evento.idAlcance !== AlcanceEvento.PUBLICO) {
      throw new ForbiddenException(
        'Debes iniciar sesión o registrarte para consultar eventos que requieren cuenta.',
      );
    }

    if (evento.idAlcance === AlcanceEvento.INTERNO && !esUsuarioInterno) {
      const tieneBoletoPrevio = await this.dataSource.query(
        `SELECT 1
         FROM "asistenteEvento" ae
         INNER JOIN "subEvento" se ON ae."idSubEvento" = se."idSubEvento"
         INNER JOIN "boleto" b ON ae."idBoleto" = b."idBoleto"
         WHERE se."idEvento" = $1
           AND ae."idUsuario" = $2
           AND b."idEstadoBoleto" IN ($3, $4)
         LIMIT 1`,
        [
          evento.idEvento,
          usuarioActual!.sub,
          EstadoBoleto.VALIDO,
          EstadoBoleto.UTILIZADO,
        ],
      );

      if (tieneBoletoPrevio.length === 0) {
        throw new ForbiddenException(
          'Este evento es exclusivo para la comunidad interna del IPN.',
        );
      }
    }

    const subEventosDetallados = [];
    const fechaRepository = this.dataSource.getRepository(FechaEntity);
    const recintoRepository = this.dataSource.getRepository('recinto');

    for (const sub of subEventosVisibles) {
      const [fecha, recinto, ponentes, totalAsientosRecinto] =
        await Promise.all([
          fechaRepository.findOne({ where: { idFecha: sub.idFecha } }),
          recintoRepository.findOne({ where: { idRecinto: sub.idRecinto } }),
          this.ponenteRepository.find({
            where: { idSubEvento: sub.idSubEvento },
          }),
          this.asientoRepository.count({ where: { idRecinto: sub.idRecinto } }),
        ]);

      const aforoReal = recinto
        ? await this.obtenerAforoRealRecinto(
            recinto.idRecinto,
            Number(recinto['aforo'] ?? 0),
          )
        : 0;
      const cupoEfectivo = recinto
        ? calcularCapacidadEfectiva(
            sub.cupoMaximo,
            aforoReal,
            sub.idModalidadAcceso,
          )
        : 0;

      subEventosDetallados.push({
        idSubEvento: sub.idSubEvento,
        nombre: sub.nombre,
        descripcion: sub.descripcion,
        estado: sub.estado,
        idModalidadAcceso: sub.idModalidadAcceso,
        cupoMaximo: sub.cupoMaximo ?? null,
        cupoEfectivo,
        requiereSeleccionAsiento:
          totalAsientosRecinto > 0 &&
          sub.idModalidadAcceso === ModalidadAcceso.QR_MAPA,
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
              aforo: aforoReal,
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

    const posterUrl = this.storageService.resolvePublicUrl(evento.poster);

    return {
      idEvento: evento.idEvento,
      nombre: evento.nombre,
      descripcion: evento.descripcion,
      poster: posterUrl,
      posterUrl,
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

  private async obtenerOcupadosRealesSubEvento(
    idSubEvento: number,
    queryRunnerOrSource: { query: (sql: string, params?: any[]) => Promise<any[]> } = this.dataSource,
  ): Promise<number> {
    const ocupadosRaw = await queryRunnerOrSource.query(
      `SELECT
         (
           SELECT COUNT(*)::int
           FROM "asistenteEvento" ae
           INNER JOIN "boleto" b ON ae."idBoleto" = b."idBoleto"
           WHERE ae."idSubEvento" = $1
             AND b."idEstadoBoleto" IN ($2, $3)
         ) +
         (
           SELECT COUNT(*)::int
           FROM "retencionAsiento" ra
           WHERE ra."idSubEvento" = $1
             AND ra."venceEn" > NOW()
         ) AS total`,
      [idSubEvento, EstadoBoleto.VALIDO, EstadoBoleto.UTILIZADO],
    );
    return Number(ocupadosRaw[0]?.total ?? 0);
  }

  async obtenerDetalleSubEventoPrivadoPorToken(
    tokenSubEventoRaw: string,
    usuarioActual?: {
      sub?: number;
      tipoCuenta?: TipoCuentaUsuario;
    },
  ): Promise<DetalleSubEventoPrivadoResponse> {
    const tokenSubEvento = tokenSubEventoRaw?.trim();
    if (!tokenSubEvento) {
      throw new NotFoundException(
        'La invitación o actividad solicitada no existe o no se encuentra disponible.',
      );
    }

    const subEvento = await this.subEventoRepository.findOne({
      where: { tokenInvitacion: tokenSubEvento },
      relations: { evento: true, fecha: true, recinto: true },
    });

    if (
      !subEvento ||
      subEvento.estado === EstadoSubEvento.CANCELADO ||
      !subEvento.evento ||
      subEvento.evento.idEstadoEvento !== EstadoEvento.ACEPTADO ||
      subEvento.evento.idAlcance !== AlcanceEvento.PRIVADO
    ) {
      throw new NotFoundException(
        'La invitación o actividad solicitada no existe o no se encuentra disponible.',
      );
    }

    const evento = subEvento.evento;
    const tieneSesion = Boolean(usuarioActual && usuarioActual.sub);
    let yaInvitado = false;
    let esLogistica = false;
    const esOrganizador =
      tieneSesion && evento.idOrganizador === usuarioActual?.sub;
    const esDirectivo =
      tieneSesion &&
      (usuarioActual?.tipoCuenta === TipoCuentaUsuario.SUBDIRECCION ||
        usuarioActual?.tipoCuenta === TipoCuentaUsuario.ADMINISTRADOR);

    if (tieneSesion) {
      const [invRaw, logRaw] = await Promise.all([
        this.dataSource.query(
          `SELECT 1 FROM "invitacionEvento" WHERE "idSubEvento" = $1 AND "idUsuario" = $2 LIMIT 1`,
          [subEvento.idSubEvento, usuarioActual!.sub],
        ),
        this.dataSource.query(
          `SELECT 1 FROM "eventoPersonalLogistica" WHERE "idEvento" = $1 AND "idUsuario" = $2 LIMIT 1`,
          [evento.idEvento, usuarioActual!.sub],
        ),
      ]);
      yaInvitado = invRaw.length > 0;
      esLogistica = logRaw.length > 0;
    }

    const tieneAccesoAutorizado =
      esOrganizador || esDirectivo || esLogistica || yaInvitado;

    if (!subEvento.enlaceInvitacionActivo && !tieneAccesoAutorizado) {
      throw new ForbiddenException(
        'Este enlace de invitación no está habilitado. Solo los usuarios invitados por correo pueden acceder.',
      );
    }

    const ponentes = await this.ponenteRepository.find({
      where: { idSubEvento: subEvento.idSubEvento },
    });

    const esAccesoLibre =
      subEvento.idModalidadAcceso === ModalidadAcceso.ACCESO_LIBRE;
    const aforoReal = await this.obtenerAforoRealRecinto(
      subEvento.idRecinto,
      subEvento.recinto?.aforo ?? 0,
    );
    const aforo = calcularCapacidadEfectiva(
      subEvento.cupoMaximo,
      aforoReal,
      subEvento.idModalidadAcceso,
    );
    const ocupados = esAccesoLibre
      ? 0
      : await this.obtenerOcupadosRealesSubEvento(subEvento.idSubEvento);
    const cupoDisponible = esAccesoLibre
      ? aforo
      : Math.max(0, aforo - ocupados);

    return {
      idEvento: evento.idEvento,
      nombreEvento: evento.nombre,
      descripcionEvento: evento.descripcion,
      posterUrl: this.storageService.resolvePublicUrl(evento.poster),
      idAlcance: evento.idAlcance ?? AlcanceEvento.PRIVADO,
      idSubEvento: subEvento.idSubEvento,
      nombreSubEvento: subEvento.nombre,
      descripcionSubEvento: subEvento.descripcion,
      idModalidadAcceso: subEvento.idModalidadAcceso,
      esAccesoLibre,
      requiereCuenta: !esAccesoLibre,
      enlaceInvitacionActivo: subEvento.enlaceInvitacionActivo,
      usuarioAutenticado: tieneSesion,
      yaAutorizado: tieneAccesoAutorizado,
      cupoDisponible,
      sinCupo: !esAccesoLibre && aforo > 0 && cupoDisponible <= 0,
      fecha: subEvento.fecha
        ? {
            idFecha: subEvento.fecha.idFecha,
            fecha: subEvento.fecha.fecha,
            horaInicio: subEvento.fecha.horaInicio,
            horaFin: subEvento.fecha.horaFin,
          }
        : null,
      recinto: subEvento.recinto
        ? {
            idRecinto: subEvento.recinto.idRecinto,
            nombre: subEvento.recinto.nombre,
            aforo: aforoReal,
          }
        : null,
      ponentes: ponentes.map((p) => ({
        idPonente: p.idPonente,
        nombre: p.nombre,
        apellidoPa: p.apellidoPa,
        apellidoMa: p.apellidoMa ?? null,
      })),
    };
  }

  async aceptarEnlaceSubEventoPrivado(
    tokenSubEventoRaw: string,
    idUsuario: number,
  ) {
    const tokenSubEvento = tokenSubEventoRaw?.trim();
    if (!tokenSubEvento) {
      throw new NotFoundException(
        'La invitación o actividad solicitada no existe o no se encuentra disponible.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const subEvento = await queryRunner.manager.findOne(SubEventoEntity, {
        where: { tokenInvitacion: tokenSubEvento },
        lock: { mode: 'pessimistic_write' },
      });

      if (!subEvento || subEvento.estado === EstadoSubEvento.CANCELADO) {
        throw new NotFoundException(
          'La invitación o actividad solicitada no existe o no se encuentra disponible.',
        );
      }

      const [evento, recinto] = await Promise.all([
        queryRunner.manager.findOne(EventoEntity, {
          where: { idEvento: subEvento.idEvento },
        }),
        queryRunner.manager.findOne(RecintoEntity, {
          where: { idRecinto: subEvento.idRecinto },
        }),
      ]);

      if (
        !evento ||
        evento.idEstadoEvento !== EstadoEvento.ACEPTADO ||
        evento.idAlcance !== AlcanceEvento.PRIVADO
      ) {
        throw new NotFoundException(
          'La invitación o actividad solicitada no existe o no se encuentra disponible.',
        );
      }

      if (subEvento.idModalidadAcceso === ModalidadAcceso.ACCESO_LIBRE) {
        await queryRunner.commitTransaction();
        return {
          autorizado: true,
          yaAutorizado: true,
          esAccesoLibre: true,
          idEvento: evento.idEvento,
          idSubEvento: subEvento.idSubEvento,
          mensaje: 'Este subevento es de acceso libre y no requiere registro.',
        };
      }

      const invitacionExistente = await queryRunner.manager.query(
        `SELECT 1 FROM "invitacionEvento" WHERE "idSubEvento" = $1 AND "idUsuario" = $2 LIMIT 1`,
        [subEvento.idSubEvento, idUsuario],
      );

      if (
        invitacionExistente.length > 0 ||
        evento.idOrganizador === idUsuario
      ) {
        await queryRunner.commitTransaction();
        return {
          autorizado: true,
          yaAutorizado: true,
          esAccesoLibre: false,
          idEvento: evento.idEvento,
          idSubEvento: subEvento.idSubEvento,
          mensaje: 'Tu acceso ya se encuentra autorizado para esta actividad.',
        };
      }

      if (!subEvento.enlaceInvitacionActivo) {
        throw new ForbiddenException(
          'Este enlace de invitación no está habilitado. Solo los usuarios invitados por correo pueden acceder.',
        );
      }

      const aforoReal = await this.obtenerAforoRealRecinto(
        subEvento.idRecinto,
        Number(recinto?.aforo ?? 0),
        queryRunner.manager,
      );
      const aforo = calcularCapacidadEfectiva(
        subEvento.cupoMaximo,
        aforoReal,
        subEvento.idModalidadAcceso,
      );
      if (aforo > 0) {
        const ocupados = await this.obtenerOcupadosRealesSubEvento(
          subEvento.idSubEvento,
          queryRunner.manager,
        );
        if (ocupados >= aforo) {
          throw new ConflictException(
            'El evento ha alcanzado su capacidad máxima.',
          );
        }
      }

      await queryRunner.manager.query(
        `INSERT INTO "invitacionEvento" ("idSubEvento", "idUsuario", "fechaUltimoEnvio")
         VALUES ($1, $2, NOW())
         ON CONFLICT ("idSubEvento", "idUsuario") DO NOTHING`,
        [subEvento.idSubEvento, idUsuario],
      );

      await queryRunner.commitTransaction();

      return {
        autorizado: true,
        yaAutorizado: false,
        esAccesoLibre: false,
        idEvento: evento.idEvento,
        idSubEvento: subEvento.idSubEvento,
        mensaje:
          'Acceso autorizado con éxito. Ya puedes completar tu registro o reserva.',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
