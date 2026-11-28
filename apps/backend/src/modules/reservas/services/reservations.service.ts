import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException, GoneException, HttpException, Logger } from '@nestjs/common';
import { QrService } from './qr.service';
import { MailService } from './mail.service';
import { CreateReservationDto } from '../dto/createReservation.dto';
import { CrearRetencionDto } from '../dto/crearRetencion.dto';
import { CambiarAsientoRetencionDto } from '../dto/cambiarAsientoRetencion.dto';
import { Repository, In, DataSource, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  DisponibilidadSubEvento,
  AsientoDisponible,
  EstadoAsientoMapa,
  EstadoRecinto,
  EstadoBoleto,
  EstadoSubEvento,
  AlcanceEvento,
  TipoCuentaUsuario,
  esModalidadConQr,
  esModalidadConRegistro,
  esLaboratorioRecinto,
  calcularCapacidadEfectiva,
  ModalidadAcceso,
  DURACION_RETENCION_ASIENTO_MINUTOS,
  RetencionAsientoActiva,
  RetencionAsientoActualRespuesta,
} from '@eventos/shared';

import { BoletoEntity } from '../entities/boleto.entity';
import { AsistenteEventoEntity } from '../entities/asistenteEvento.entity';
import { SubEventoEntity } from '../../eventos/entities/subevento.entity';
import { RecintoEntity } from '../../recintos/entities/recinto.entity';
import { AsientoEntity } from '../entities/asiento.entity';
import { FechaEntity } from '../../eventos/entities/fecha.entity';
import { EventoEntity } from '../../eventos/entities/evento.entity';
import { EventoPersonalLogisticaEntity } from '../../eventos/entities/eventoPersonalLogistica.entity';
import { PonenteEntity } from '../../eventos/entities/ponente.entity';
import { UsuarioEntity } from '../../auth/entities/usuario.entity';
import { StorageService } from '../../../common/storage/storage.service';
import {
    calcularClaveOrdenProximo,
    compararClavesOrdenProximo,
    construirFechaEnCdmx,
    haAlcanzadoFechaHoraCdmx,
    obtenerAhoraCdmx,
} from '../../../common/utils/fecha-cdmx.util';

interface ContextoReservaValidado {
    subEvento: SubEventoEntity;
    eventoPrincipal: EventoEntity;
    fechaEvento: FechaEntity;
    recinto: RecintoEntity;
    requiereAsiento: boolean;
    asientosDelRecinto: AsientoEntity[];
}

function errorRetencion<T extends HttpException>(
    Excepcion: new (body: object) => T,
    codigo: string,
    message: string,
): T {
    const statusCode = new Excepcion({}).getStatus();
    const nombresError: Record<number, string> = {
        400: 'Bad Request',
        403: 'Forbidden',
        404: 'Not Found',
        409: 'Conflict',
        410: 'Gone',
    };
    return new Excepcion({
        statusCode,
        error: nombresError[statusCode] ?? 'Error',
        message,
        codigo,
    });
}

@Injectable()
export class ReservationsService {

    private readonly logger = new Logger(ReservationsService.name);
  
    constructor(
        private dataSource: DataSource,
        private readonly qrService: QrService,
        private readonly mailService : MailService, 
        @InjectRepository(UsuarioEntity) private usuarioRepo: Repository<UsuarioEntity>,
        @InjectRepository(EventoEntity) private eventoRepo: Repository<EventoEntity>,
        @InjectRepository(SubEventoEntity) private subEventoRepo: Repository<SubEventoEntity>,
        @InjectRepository(RecintoEntity) private recintoRepo: Repository<RecintoEntity>,
        @InjectRepository(AsientoEntity) private asientoRepo: Repository<AsientoEntity>,
        @InjectRepository(BoletoEntity) private boletoRepo: Repository<BoletoEntity>,
        @InjectRepository(AsistenteEventoEntity) private asistenteRepo: Repository<AsistenteEventoEntity>,
        @InjectRepository(FechaEntity) private fechaRepo: Repository<FechaEntity>,
        @InjectRepository(EventoPersonalLogisticaEntity) private logisticaRepo: Repository<EventoPersonalLogisticaEntity>,
        private readonly storageService: StorageService,
    ) {}

    private async obtenerAforoRealRecinto(
        manager: EntityManager,
        recinto: RecintoEntity,
    ): Promise<number> {
        if (!esLaboratorioRecinto(recinto.idRecinto)) {
            return recinto.aforo;
        }
        const [{ total }] = await manager.query(
            `SELECT COUNT(*)::int AS total FROM "estadoEquipo" WHERE "idRecinto" = $1 AND estado = true`,
            [recinto.idRecinto],
        );
        return Number(total ?? 0);
    }

    //CONSULTAR DISPONIBILIDAD

    async consultarDisponibilidad(idSubEvento: number): Promise<any> {
        const subEvento = await this.subEventoRepo.findOne({ 
            where: { idSubEvento: idSubEvento } 
        });
        
        if (!subEvento) {
            throw new NotFoundException('El subevento solicitado no existe.');
        }

        const evento = await this.eventoRepo.findOne({
            where: { idEvento: subEvento.idEvento }
        });

        const fechaEvento = await this.fechaRepo.findOne({
            where: { idFecha: subEvento.idFecha }
        });

        const recinto = await this.recintoRepo.findOne({ 
            where: { idRecinto: subEvento.idRecinto } 
        });

        if (!recinto) {
            throw new ConflictException('El subevento no tiene un recinto asignado en la base de datos.');
        }

        if (recinto.idEstadoRecinto !== EstadoRecinto.HABILITADO) {
            throw new ConflictException('El recinto asignado a este evento no se encuentra habilitado.');
        }

        const aforoRealRecinto = await this.obtenerAforoRealRecinto(
            this.dataSource.manager,
            recinto,
        );
        const cupoEfectivo = calcularCapacidadEfectiva(
            subEvento.cupoMaximo,
            aforoRealRecinto,
            subEvento.idModalidadAcceso,
        );

        const { lugaresOcupados, idsAsientosOcupados } = await this.calcularOcupacionSubEvento(this.dataSource.manager, idSubEvento);

        // Verificar si la actividad permite reservaciones (Evento Aceptado = 2, SubEvento Aceptado y Fecha futura en America/Mexico_City)
        const haIniciado = fechaEvento
            ? haAlcanzadoFechaHoraCdmx(String(fechaEvento.fecha), fechaEvento.horaInicio)
            : true;
        const eventoActivo = evento && evento.idEstadoEvento === 2 && subEvento.estado === EstadoSubEvento.ACEPTADO && !haIniciado;

        const permiteRegistro = esModalidadConRegistro(subEvento.idModalidadAcceso);
        const requiereSeleccionAsiento =
            subEvento.idModalidadAcceso === ModalidadAcceso.QR_MAPA;

        const retencionesVigentesRaw = requiereSeleccionAsiento
            ? await this.dataSource.manager.query(
                  `SELECT "idAsiento" FROM "retencionAsiento" WHERE "idSubEvento" = $1 AND "venceEn" > LOCALTIMESTAMP`,
                  [idSubEvento],
              )
            : [];
        const idsAsientosRetenidos = new Set<number>(
            retencionesVigentesRaw.map((r: any) => Number(r.idAsiento)),
        );

        const lugaresDisponibles = eventoActivo
            ? Math.max(0, cupoEfectivo - lugaresOcupados - idsAsientosRetenidos.size)
            : 0;

        const asientosBD = requiereSeleccionAsiento
            ? await this.asientoRepo.find({ where: { idRecinto: recinto.idRecinto } })
            : [];

        const asientos: AsientoDisponible[] = asientosBD.map(a => {
            const estado: EstadoAsientoMapa = !eventoActivo
                ? 'OCUPADO'
                : idsAsientosOcupados.has(a.idAsiento)
                ? 'OCUPADO'
                : idsAsientosRetenidos.has(a.idAsiento)
                ? 'RETENIDO'
                : 'DISPONIBLE';
            return {
                idAsiento: a.idAsiento,
                fila: a.fila,
                numero: a.numero,
                ocupado: estado !== 'DISPONIBLE',
                estado,
            };
        });

        return {
            idSubEvento: subEvento.idSubEvento,
            idModalidadAcceso: subEvento.idModalidadAcceso,
            recinto: {
                ...recinto,
                aforo: aforoRealRecinto,
            },
            cupoMaximo: subEvento.cupoMaximo ?? null,
            cupoEfectivo,
            lugaresDisponibles,
            permiteReservar: Boolean(eventoActivo && permiteRegistro && lugaresDisponibles > 0),
            requiereSeleccionAsiento,
            asientos,
        };
    }


    //CREAR RESERVA

    private async validarElegibilidadReserva(
        manager: EntityManager,
        usuario: UsuarioEntity,
        idSubEvento: number,
    ): Promise<ContextoReservaValidado> {
        const idUsuario = usuario.idUsuario;

        // Verificar existencia y cierre de registro agregando el bloqueo de fila
        const subEvento = await manager.findOne(SubEventoEntity, { 
            where: { idSubEvento: idSubEvento },
            lock: { mode: 'pessimistic_write' } 
        });
        
        if (!subEvento) {
            throw new NotFoundException('El subevento no existe');
        }

        if (subEvento.estado !== EstadoSubEvento.ACEPTADO) {
            throw new ConflictException('El registro para este evento se encuentra cerrado o cancelado');
        }

        if (subEvento.idModalidadAcceso === ModalidadAcceso.ACCESO_LIBRE) {
            throw new BadRequestException('Esta actividad es de acceso libre y no requiere registro previo.');
        }

        const eventoPrincipal = await manager.findOne(EventoEntity, {
            where: { idEvento: subEvento.idEvento }
        });

        if (!eventoPrincipal || eventoPrincipal.idEstadoEvento !== 2) {
            throw new ConflictException('El evento principal no se encuentra autorizado o activo para reservaciones.');
        }

        // Auto-reserva: Validar idOrganizador !== idUsuario al solicitar boletos (HTTP 400)
        if (Number(eventoPrincipal.idOrganizador) === Number(idUsuario)) {
            throw new BadRequestException('El organizador no puede solicitar boletos para su propio evento.');
        }

        if (eventoPrincipal.idAlcance === AlcanceEvento.INTERNO) {
            const esUsuarioInterno =
                usuario.tipoCuenta === TipoCuentaUsuario.INTERNO ||
                usuario.tipoCuenta === TipoCuentaUsuario.SUBDIRECCION ||
                usuario.tipoCuenta === TipoCuentaUsuario.ADMINISTRADOR;

            if (!esUsuarioInterno) {
                throw new ForbiddenException('Este evento es exclusivo para la comunidad interna del IPN.');
            }
        }

        if (eventoPrincipal.idAlcance === AlcanceEvento.PRIVADO) {
            const invitacionRaw = await manager.query(
                `SELECT 1 FROM "invitacionEvento" WHERE "idSubEvento" = $1 AND "idUsuario" = $2 LIMIT 1`,
                [subEvento.idSubEvento, idUsuario],
            );
            const esOrganizador = eventoPrincipal.idOrganizador === idUsuario;
            if (invitacionRaw.length === 0 && !esOrganizador) {
                throw new ForbiddenException('Este evento requiere una invitación válida para reservar.');
            }
        }

        const fechaEvento = await manager.findOne(FechaEntity, { 
            where: { idFecha: subEvento.idFecha } 
        });
        
        if (!fechaEvento) {
            throw new ConflictException('El evento no tiene una fecha asignada en la base de datos.');
        }

        if (haAlcanzadoFechaHoraCdmx(String(fechaEvento.fecha), fechaEvento.horaInicio)) {
            throw new ConflictException('El tiempo límite para registrarse a este evento ha terminado.');
        }

        // Verificar que el usuario no sea Personal de Logística
        const esLogistica = await manager.findOne(EventoPersonalLogisticaEntity, {
            where: { idEvento: subEvento.idEvento, idUsuario: idUsuario }
        });
        
        if (esLogistica) {
            throw new ForbiddenException('El personal de logística asignado no puede reservar boletos como asistente.');
        }

        // Verificar que no exista reserva activa previa 
        const reservasEvento = await manager.find(AsistenteEventoEntity, {
            where: { idSubEvento: idSubEvento, idUsuario: idUsuario }
        });

        for (const reserva of reservasEvento) {
            if (reserva.idBoleto) {
                const boletoAsociado = await manager.findOne(BoletoEntity, { 
                    where: { idBoleto: reserva.idBoleto } 
                });
                
                if (boletoAsociado && (boletoAsociado.idEstadoBoleto === EstadoBoleto.VALIDO || boletoAsociado.idEstadoBoleto === EstadoBoleto.UTILIZADO)) {
                    throw new ConflictException('Ya cuentas con una reserva activa para este evento.');
                }
            }
        }

        // Verificar Aforo y Butaca
        const recinto = await manager.findOne(RecintoEntity, { 
            where: { idRecinto: subEvento.idRecinto } 
        });
        
        if (!recinto || recinto.idEstadoRecinto !== EstadoRecinto.HABILITADO) {
            throw new ConflictException('El recinto del evento no está disponible.');
        }
        
        const requiereAsiento =
            subEvento.idModalidadAcceso === ModalidadAcceso.QR_MAPA;
        const asientosDelRecinto = requiereAsiento
            ? await manager.find(AsientoEntity, {
                  where: { idRecinto: recinto.idRecinto },
              })
            : [];

        return {
            subEvento,
            eventoPrincipal,
            fechaEvento,
            recinto,
            requiereAsiento,
            asientosDelRecinto,
        };
    }

    private async calcularOcupacionSubEvento(
        manager: EntityManager,
        idSubEvento: number,
    ): Promise<{ lugaresOcupados: number; idsAsientosOcupados: Set<number> }> {
        const asistentesAct = await manager.find(AsistenteEventoEntity, { 
            where: { idSubEvento: idSubEvento } 
        });
        
        let lugaresOcupados = 0;
        const idsAsientosOcupados = new Set<number>();
        const idsBoleto = asistentesAct.map(a => a.idBoleto).filter(id => id !== null);

        if (idsBoleto.length > 0) {
            const boletos = await manager.find(BoletoEntity, { 
                where: { idBoleto: In(idsBoleto) } 
            });
            
            for (const b of boletos) {
                if (b.idEstadoBoleto === EstadoBoleto.VALIDO || b.idEstadoBoleto === EstadoBoleto.UTILIZADO) {
                    lugaresOcupados++;
                    if (b.idAsiento !== null) {
                        idsAsientosOcupados.add(b.idAsiento);
                    }
                }
            }
        }

        return { lugaresOcupados, idsAsientosOcupados };
    }

    private async mapearRetencionActiva(
        manager: EntityManager,
        idRetencionAsiento: number,
    ): Promise<RetencionAsientoActiva> {
        const filas = await manager.query(
            `SELECT r."idRetencionAsiento", r."idSubEvento", r."idAsiento", a.fila, a.numero,
                    (r."venceEn" AT TIME ZONE current_setting('TimeZone')) AS "venceEnTz",
                    NOW() AS "serverNow",
                    GREATEST(0, CEIL(EXTRACT(EPOCH FROM (r."venceEn" - LOCALTIMESTAMP))))::int AS "segundosRestantes"
             FROM "retencionAsiento" r
             JOIN asiento a ON a."idAsiento" = r."idAsiento"
             WHERE r."idRetencionAsiento" = $1`,
            [idRetencionAsiento],
        );

        const row = filas[0];
        return {
            idRetencionAsiento: Number(row.idRetencionAsiento),
            idSubEvento: Number(row.idSubEvento),
            idAsiento: Number(row.idAsiento),
            fila: String(row.fila),
            numero: Number(row.numero),
            venceEn: new Date(row.venceEnTz).toISOString(),
            serverNow: new Date(row.serverNow).toISOString(),
            segundosRestantes: Number(row.segundosRestantes),
        };
    }

    async adquirirRetencion(
        idUsuario: number,
        dto: CrearRetencionDto,
    ): Promise<RetencionAsientoActiva> {
        const usuario = await this.usuarioRepo.findOne({ where: { idUsuario } });
        if (!usuario) {
            throw new NotFoundException('El usuario especificado no existe.');
        }

        return await this.dataSource.transaction(async (manager) => {
            const ctx = await this.validarElegibilidadReserva(manager, usuario, dto.idSubEvento);

            if (!ctx.requiereAsiento) {
                throw errorRetencion(
                    BadRequestException,
                    'MODALIDAD_SIN_ASIENTOS',
                    'Esta actividad no utiliza selección de asientos.',
                );
            }

            const asientoValido = ctx.asientosDelRecinto.some(a => a.idAsiento === dto.idAsiento);
            if (!asientoValido) {
                throw errorRetencion(
                    BadRequestException,
                    'ASIENTO_INVALIDO',
                    'El asiento seleccionado no pertenece al recinto asignado a este subevento.',
                );
            }

            await manager.query(
                `DELETE FROM "retencionAsiento" WHERE "idSubEvento" = $1 AND "venceEn" <= LOCALTIMESTAMP`,
                [dto.idSubEvento],
            );

            const retencionesPropias = await manager.query(
                `SELECT "idRetencionAsiento", "idAsiento" FROM "retencionAsiento" WHERE "idSubEvento" = $1 AND "idUsuario" = $2`,
                [dto.idSubEvento, idUsuario],
            );

            if (retencionesPropias.length > 0) {
                const retencionPropia = retencionesPropias[0];
                if (Number(retencionPropia.idAsiento) === Number(dto.idAsiento)) {
                    return await this.mapearRetencionActiva(manager, Number(retencionPropia.idRetencionAsiento));
                }
                throw errorRetencion(
                    ConflictException,
                    'RETENCION_PROPIA_EXISTENTE',
                    'Ya tienes un asiento apartado en esta actividad. Cámbialo o libéralo antes de elegir otro.',
                );
            }

            const ocupacion = await this.calcularOcupacionSubEvento(manager, dto.idSubEvento);
            if (ocupacion.idsAsientosOcupados.has(dto.idAsiento)) {
                throw errorRetencion(
                    ConflictException,
                    'ASIENTO_OCUPADO',
                    'El asiento seleccionado ya se encuentra ocupado en esta actividad.',
                );
            }

            const retencionAjena = await manager.query(
                `SELECT 1 FROM "retencionAsiento" WHERE "idSubEvento" = $1 AND "idAsiento" = $2 AND "idUsuario" <> $3 LIMIT 1`,
                [dto.idSubEvento, dto.idAsiento, idUsuario],
            );
            if (retencionAjena.length > 0) {
                throw errorRetencion(
                    ConflictException,
                    'ASIENTO_RETENIDO',
                    'El asiento seleccionado está apartado temporalmente por otra persona.',
                );
            }

            const conteoRetencionesRaw = await manager.query(
                `SELECT COUNT(*)::int AS total FROM "retencionAsiento" WHERE "idSubEvento" = $1`,
                [dto.idSubEvento],
            );
            const retencionesVigentes = Number(conteoRetencionesRaw[0]?.total ?? 0);
            const aforoRealRecinto = await this.obtenerAforoRealRecinto(manager, ctx.recinto);
            const capacidadEfectiva = calcularCapacidadEfectiva(
                ctx.subEvento.cupoMaximo,
                aforoRealRecinto,
                ctx.subEvento.idModalidadAcceso,
            );
            if (ocupacion.lugaresOcupados + retencionesVigentes >= capacidadEfectiva) {
                throw errorRetencion(
                    ConflictException,
                    'AFORO_AGOTADO',
                    'El aforo para este evento se ha agotado.',
                );
            }

            let idNuevo: number;
            try {
                const insertadas = await manager.query(
                    `INSERT INTO "retencionAsiento" ("idSubEvento", "idAsiento", "idUsuario", "venceEn")
                     VALUES ($1, $2, $3, LOCALTIMESTAMP + make_interval(mins => $4))
                     RETURNING "idRetencionAsiento"`,
                    [dto.idSubEvento, dto.idAsiento, idUsuario, DURACION_RETENCION_ASIENTO_MINUTOS],
                );
                idNuevo = Number(insertadas[0].idRetencionAsiento);
            } catch (error: any) {
                if (error?.code === '23505') {
                    throw errorRetencion(
                        ConflictException,
                        'ASIENTO_RETENIDO',
                        'El asiento seleccionado está apartado temporalmente por otra persona.',
                    );
                }
                throw error;
            }

            return await this.mapearRetencionActiva(manager, idNuevo);
        });
    }

    async cambiarAsientoRetencion(
        idUsuario: number,
        idRetencionAsiento: number,
        dto: CambiarAsientoRetencionDto,
    ): Promise<RetencionAsientoActiva> {
        const usuario = await this.usuarioRepo.findOne({ where: { idUsuario } });
        if (!usuario) {
            throw new NotFoundException('El usuario especificado no existe.');
        }

        return await this.dataSource.transaction(async (manager) => {
            const retencionInicial = await manager.query(
                `SELECT "idSubEvento" FROM "retencionAsiento" WHERE "idRetencionAsiento" = $1 AND "idUsuario" = $2`,
                [idRetencionAsiento, idUsuario],
            );

            if (retencionInicial.length === 0) {
                throw errorRetencion(
                    NotFoundException,
                    'RETENCION_NO_ENCONTRADA',
                    'No se encontró una retención activa a tu nombre.',
                );
            }

            const idSubEvento = Number(retencionInicial[0].idSubEvento);
            const ctx = await this.validarElegibilidadReserva(manager, usuario, idSubEvento);

            const retencionReleida = await manager.query(
                `SELECT "idAsiento", ("venceEn" > LOCALTIMESTAMP) AS vigente FROM "retencionAsiento" WHERE "idRetencionAsiento" = $1 AND "idUsuario" = $2`,
                [idRetencionAsiento, idUsuario],
            );

            if (retencionReleida.length === 0) {
                throw errorRetencion(
                    NotFoundException,
                    'RETENCION_NO_ENCONTRADA',
                    'No se encontró una retención activa a tu nombre.',
                );
            }

            if (!retencionReleida[0].vigente) {
                throw errorRetencion(
                    GoneException,
                    'RETENCION_EXPIRADA',
                    'Tu tiempo para apartar el asiento terminó. Selecciona un asiento de nuevo.',
                );
            }

            const idAsientoActual = Number(retencionReleida[0].idAsiento);
            if (Number(dto.idAsiento) === idAsientoActual) {
                return await this.mapearRetencionActiva(manager, idRetencionAsiento);
            }

            const asientoValido = ctx.asientosDelRecinto.some(a => a.idAsiento === dto.idAsiento);
            if (!asientoValido) {
                throw errorRetencion(
                    BadRequestException,
                    'ASIENTO_INVALIDO',
                    'El asiento seleccionado no pertenece al recinto asignado a este subevento.',
                );
            }

            await manager.query(
                `DELETE FROM "retencionAsiento" WHERE "idSubEvento" = $1 AND "venceEn" <= LOCALTIMESTAMP`,
                [idSubEvento],
            );

            const ocupacion = await this.calcularOcupacionSubEvento(manager, idSubEvento);
            if (ocupacion.idsAsientosOcupados.has(dto.idAsiento)) {
                throw errorRetencion(
                    ConflictException,
                    'ASIENTO_OCUPADO',
                    'El asiento seleccionado ya se encuentra ocupado en esta actividad.',
                );
            }

            const retencionAjena = await manager.query(
                `SELECT 1 FROM "retencionAsiento" WHERE "idSubEvento" = $1 AND "idAsiento" = $2 AND "idUsuario" <> $3 LIMIT 1`,
                [idSubEvento, dto.idAsiento, idUsuario],
            );
            if (retencionAjena.length > 0) {
                throw errorRetencion(
                    ConflictException,
                    'ASIENTO_RETENIDO',
                    'El asiento seleccionado está apartado temporalmente por otra persona.',
                );
            }

            try {
                await manager.query(
                    `UPDATE "retencionAsiento" SET "idAsiento" = $1 WHERE "idRetencionAsiento" = $2 AND "idUsuario" = $3`,
                    [dto.idAsiento, idRetencionAsiento, idUsuario],
                );
            } catch (error: any) {
                if (error?.code === '23505') {
                    throw errorRetencion(
                        ConflictException,
                        'ASIENTO_RETENIDO',
                        'El asiento seleccionado está apartado temporalmente por otra persona.',
                    );
                }
                throw error;
            }

            return await this.mapearRetencionActiva(manager, idRetencionAsiento);
        });
    }

    async liberarRetencion(idUsuario: number, idRetencionAsiento: number): Promise<void> {
        await this.dataSource.query(
            `DELETE FROM "retencionAsiento" WHERE "idRetencionAsiento" = $1 AND "idUsuario" = $2`,
            [idRetencionAsiento, idUsuario],
        );
    }

    async obtenerRetencionActual(
        idUsuario: number,
        idSubEvento: number,
    ): Promise<RetencionAsientoActualRespuesta> {
        const filas = await this.dataSource.manager.query(
            `SELECT "idRetencionAsiento" FROM "retencionAsiento" WHERE "idSubEvento" = $1 AND "idUsuario" = $2 AND "venceEn" > LOCALTIMESTAMP`,
            [idSubEvento, idUsuario],
        );

        if (filas.length > 0) {
            return {
                retencion: await this.mapearRetencionActiva(
                    this.dataSource.manager,
                    Number(filas[0].idRetencionAsiento),
                ),
            };
        }

        return { retencion: null };
    }

    private get retencionObligatoria(): boolean {
        return process.env.RETENCION_ASIENTO_OBLIGATORIA === 'true';
    }

    //logica de negocio para crear reserva

    async crearReserva(idUsuario: number, dto: CreateReservationDto): Promise<{ mensaje: string, boleto: any, qr?: string }> {
        // Obtener datos del usuario antes de bloquear filas en la BD
        const usuario = await this.usuarioRepo.findOne({ where: { idUsuario } });
        if (!usuario) {
            throw new NotFoundException('El usuario especificado no existe.');
        }

        // Transacción atómica
        const resultado = await this.dataSource.transaction(async (manager) => {
            const ctx = await this.validarElegibilidadReserva(manager, usuario, dto.idSubEvento);
            const { subEvento, eventoPrincipal, fechaEvento, recinto, requiereAsiento } = ctx;

            if (!requiereAsiento) {
                if (dto.idAsiento) {
                    throw new BadRequestException('Esta actividad es de admisión general y no utiliza asientos numerados.');
                }
                if (dto.idRetencionAsiento) {
                    throw errorRetencion(
                        BadRequestException,
                        'MODALIDAD_SIN_ASIENTOS',
                        'Esta actividad no utiliza selección de asientos.',
                    );
                }
            }

            let idAsientoFinal: number | null = null;
            if (requiereAsiento) {
                if (dto.idRetencionAsiento) {
                    const retencionFilas = await manager.query(
                        `SELECT "idAsiento", ("venceEn" > LOCALTIMESTAMP) AS vigente
                         FROM "retencionAsiento"
                         WHERE "idRetencionAsiento" = $1 AND "idUsuario" = $2 AND "idSubEvento" = $3
                         FOR UPDATE`,
                        [dto.idRetencionAsiento, idUsuario, dto.idSubEvento],
                    );

                    if (retencionFilas.length === 0) {
                        throw errorRetencion(
                            NotFoundException,
                            'RETENCION_NO_ENCONTRADA',
                            'No se encontró una retención activa a tu nombre.',
                        );
                    }

                    if (!retencionFilas[0].vigente) {
                        throw errorRetencion(
                            GoneException,
                            'RETENCION_EXPIRADA',
                            'Tu tiempo para apartar el asiento terminó. Selecciona un asiento de nuevo.',
                        );
                    }

                    const idAsientoRetencion = Number(retencionFilas[0].idAsiento);
                    if (dto.idAsiento && Number(dto.idAsiento) !== idAsientoRetencion) {
                        throw errorRetencion(
                            BadRequestException,
                            'RETENCION_ASIENTO_NO_COINCIDE',
                            'El asiento enviado no coincide con el asiento que apartaste.',
                        );
                    }

                    idAsientoFinal = idAsientoRetencion;
                } else {
                    if (this.retencionObligatoria) {
                        throw errorRetencion(
                            BadRequestException,
                            'RETENCION_REQUERIDA',
                            'Debes apartar un asiento antes de confirmar tu reservación.',
                        );
                    }
                    if (!dto.idAsiento) {
                        throw new BadRequestException('Esta actividad requiere que selecciones un asiento.');
                    }
                    idAsientoFinal = dto.idAsiento;
                }
            }

            let asientoSeleccionado = null;
            if (requiereAsiento && idAsientoFinal !== null) {
                asientoSeleccionado = ctx.asientosDelRecinto.find(a => a.idAsiento === idAsientoFinal);
                if (!asientoSeleccionado) {
                    throw new BadRequestException('El asiento seleccionado no pertenece al recinto asignado a este subevento.');
                }
            }

            // Verificar Aforo y Ocupación de Butaca solo en este SubEvento
            const ocupacion = await this.calcularOcupacionSubEvento(manager, dto.idSubEvento);

            if (requiereAsiento && idAsientoFinal !== null && ocupacion.idsAsientosOcupados.has(idAsientoFinal)) {
                throw new ConflictException('El asiento seleccionado ya se encuentra ocupado en esta actividad.');
            }

            let retencionesAjenas = 0;
            if (requiereAsiento) {
                const retencionesAjenasFilas = await manager.query(
                    `SELECT "idAsiento" FROM "retencionAsiento"
                     WHERE "idSubEvento" = $1 AND "idUsuario" <> $2 AND "venceEn" > LOCALTIMESTAMP`,
                    [dto.idSubEvento, idUsuario],
                );
                if (retencionesAjenasFilas.some((r: any) => Number(r.idAsiento) === Number(idAsientoFinal))) {
                    throw errorRetencion(
                        ConflictException,
                        'ASIENTO_RETENIDO',
                        'El asiento seleccionado está apartado temporalmente por otra persona.',
                    );
                }
                retencionesAjenas = retencionesAjenasFilas.length;
            }

            const aforoRealRecinto = await this.obtenerAforoRealRecinto(manager, recinto);
            const capacidadEfectiva = calcularCapacidadEfectiva(
                subEvento.cupoMaximo,
                aforoRealRecinto,
                subEvento.idModalidadAcceso,
            );
            if (ocupacion.lugaresOcupados + retencionesAjenas >= capacidadEfectiva) {
                throw new ConflictException('El aforo para este evento se ha agotado.');
            }

            // GENERACIÓN DE QR Y GUARDADO
            const fechaFinEvento = construirFechaEnCdmx(String(fechaEvento.fecha), fechaEvento.horaFin);

            const boletoNuevoObj = manager.create(BoletoEntity, {
                tokenQr: '', 
                idAsiento: ctx.requiereAsiento ? idAsientoFinal : null,
                idEstadoBoleto: EstadoBoleto.VALIDO
            });
            
            const boletoGuardado = await manager.save(BoletoEntity, boletoNuevoObj);

            // Ajuste insertamos una nueva fila en AsistenteEventoEntity
            const intermedia = manager.create(AsistenteEventoEntity, {
                idSubEvento: dto.idSubEvento,
                idUsuario: idUsuario,
                idBoleto: boletoGuardado.idBoleto,
            });
            await manager.save(AsistenteEventoEntity, intermedia);

            let qrBase64Data: string | undefined = undefined;

            if (esModalidadConQr(subEvento.idModalidadAcceso)) {
                const infoBoleto = {
                    idBoleto: boletoGuardado.idBoleto,
                    idEvento: subEvento.idEvento,
                    idUsuario: idUsuario
                };

                const { token, qrBase64 } = await this.qrService.generateQrCode(infoBoleto, fechaFinEvento);

                boletoGuardado.tokenQr = token;
                await manager.save(BoletoEntity, boletoGuardado);
                qrBase64Data = qrBase64;
            }

            if (ctx.requiereAsiento) {
                await manager.query(
                    `DELETE FROM "retencionAsiento" WHERE "idSubEvento" = $1 AND "idUsuario" = $2`,
                    [dto.idSubEvento, idUsuario],
                );
            }

            return {
                boleto: boletoGuardado,
                qrBase64: qrBase64Data,
                datosCorreo: {
                    idBoleto: boletoGuardado.idBoleto,
                    idModalidadAcceso: subEvento.idModalidadAcceso,
                    nombreEvento: eventoPrincipal.nombre,
                    nombreSubEvento: subEvento.nombre,
                    fecha: String(fechaEvento.fecha),
                    horaInicio: fechaEvento.horaInicio,
                    horaFin: fechaEvento.horaFin,
                    nombreRecinto: recinto.nombre,
                    asiento: asientoSeleccionado ? { fila: asientoSeleccionado.fila, numero: asientoSeleccionado.numero } : null,
                    qrBase64: qrBase64Data
                }
            };
        }); 

        //Envío del correo con QR y PDF
        try {
            const nombreCompleto = `${usuario.nombre} ${usuario.apellidoPa}${usuario.apellidoMa ? ' ' + usuario.apellidoMa : ''}`;
            await this.mailService.enviarCorreoConfirmacionReserva({
                destinatario: usuario.correo,
                nombreAsistente: nombreCompleto,
                ...resultado.datosCorreo
            });
        } catch (error) {
            this.logger.error(`La reserva #${resultado.boleto.idBoleto} se guardó, pero falló el envío del correo:`, error);
        }

        // Retorno HTTP para el Frontend
        if (resultado.qrBase64) {
            return {
                mensaje: 'Reserva creada exitosamente',
                boleto: resultado.boleto,
                qr: resultado.qrBase64 
            };
        }

        return {
            mensaje: 'Reserva creada exitosamente sin necesidad de QR',
            boleto: resultado.boleto,
        };
    }

    //CONSULTAR MIS EVENTOS

    async obtenerMisBoletos(idUsuario: number) {
        const reservas = await this.asistenteRepo.find({
            where: { idUsuario: idUsuario }
        });

        const misBoletos = [];

        const mapaAlcance: Record<number, string> = {
            [AlcanceEvento.PUBLICO]: 'Público',
            [AlcanceEvento.INTERNO]: 'Interno',
            [AlcanceEvento.PRIVADO]: 'Privado',
        };

        const mapaEstadoTexto: Record<number, string> = {
            [EstadoBoleto.VALIDO]: 'Válido',
            [EstadoBoleto.UTILIZADO]: 'Utilizado',
            [EstadoBoleto.CANCELADO]: 'Cancelado',
        };

        const mapaEtiquetaUI: Record<number, string> = {
            [EstadoBoleto.VALIDO]: 'Activo',
            [EstadoBoleto.UTILIZADO]: 'Ingresado',
            [EstadoBoleto.CANCELADO]: 'Cancelado',
        };

        for (const reserva of reservas) {
            if (!reserva.idBoleto) continue;

            const boleto = await this.boletoRepo.findOne({ where: { idBoleto: reserva.idBoleto } });
            if (!boleto) continue;

            const subEvento = await this.subEventoRepo.findOne({ where: { idSubEvento: reserva.idSubEvento } });
            if (!subEvento) continue;

            const fechaEvento = await this.fechaRepo.findOne({ where: { idFecha: subEvento.idFecha } });
            if (!fechaEvento) continue;

            const limiteTerminoEvento = construirFechaEnCdmx(String(fechaEvento.fecha), fechaEvento.horaFin);

            if (
                esModalidadConQr(subEvento.idModalidadAcceso) &&
                haAlcanzadoFechaHoraCdmx(String(fechaEvento.fecha), fechaEvento.horaFin) &&
                boleto.idEstadoBoleto === EstadoBoleto.VALIDO
            ) {
                boleto.idEstadoBoleto = EstadoBoleto.CANCELADO;
                await this.boletoRepo.save(boleto);
            }

            const evento = await this.eventoRepo.findOne({ where: { idEvento: subEvento.idEvento } });
            const recinto = await this.recintoRepo.findOne({ where: { idRecinto: subEvento.idRecinto } });

            // Obtener asiento si el boleto tiene uno asignado
            let filaAsiento: string | null = null;
            let numeroAsiento: number | null = null;
            if (boleto.idAsiento) {
                const asiento = await this.asientoRepo.findOne({ where: { idAsiento: boleto.idAsiento } });
                if (asiento) {
                    filaAsiento = asiento.fila;
                    numeroAsiento = asiento.numero;
                }
            }

            // Obtener ponentes 
            const ponentesRaw = await this.dataSource.query(
                `SELECT "idPonente", nombre, "apellidoPa", "apellidoMa", correo
                 FROM ponente
                 WHERE "idSubEvento" = $1`,
                [subEvento.idSubEvento]
            );

            const ponentes = ponentesRaw.map((p: any) => ({
                idPonente: p.idPonente,
                nombreCompleto: `${p.nombre} ${p.apellidoPa}${p.apellidoMa ? ' ' + p.apellidoMa : ''}`.trim(),
                correo: p.correo,
            }));

            
            let qrImagenBase64: string | null = null;
            if (
                esModalidadConQr(subEvento.idModalidadAcceso) &&
                boleto.idEstadoBoleto === EstadoBoleto.VALIDO
            ) {
                const infoBoleto = {
                    idBoleto: boleto.idBoleto,
                    idEvento: subEvento.idEvento,
                    idUsuario: idUsuario,
                };
                const { qrBase64 } = await this.qrService.generateQrCode(infoBoleto, limiteTerminoEvento);
                qrImagenBase64 = qrBase64;
            }

            misBoletos.push({
                // campos solicitados por el miguelon
                idBoleto: boleto.idBoleto,
                idEvento: subEvento.idEvento,
                idSubEvento: subEvento.idSubEvento,
                nombreEvento: evento ? evento.nombre : '',
                nombreSubEvento: subEvento.nombre,
                estadoBoleto: boleto.idEstadoBoleto, // 1 = Válido, 2 = Utilizado, 3 = Cancelado
                fecha: fechaEvento.fecha,
                horaInicio: fechaEvento.horaInicio,
                horaFin: fechaEvento.horaFin,
                recinto: recinto ? recinto.nombre : '',
                fechaGeneracion: boleto.fechaGeneracion,

                // Campos adicionales 
                estadoBoletoTexto: mapaEstadoTexto[boleto.idEstadoBoleto] ?? 'Desconocido',
                etiquetaEstado: mapaEtiquetaUI[boleto.idEstadoBoleto] ?? 'Cancelado',
                poster: evento ? this.storageService.resolvePublicUrl(evento.poster) : null,
                posterUrl: evento ? this.storageService.resolvePublicUrl(evento.poster) : null,
                alcance: evento?.idAlcance ? mapaAlcance[evento.idAlcance] : 'Público',
                idModalidadAcceso: subEvento.idModalidadAcceso,
                filaAsiento,
                numeroAsiento,
                ponentes,
                qrImagenBase64,
            });
        }

        // Ordenar por fecha de evento más próxima de hoy en adelante (pasados al final)
        const ahoraCdmx = obtenerAhoraCdmx();
        const prioridadEstado: Record<number, number> = {
            [EstadoBoleto.VALIDO]: 0,
            [EstadoBoleto.UTILIZADO]: 1,
            [EstadoBoleto.CANCELADO]: 2,
        };

        misBoletos.sort((a, b) => {
            const cmp = compararClavesOrdenProximo(
                calcularClaveOrdenProximo([a], ahoraCdmx),
                calcularClaveOrdenProximo([b], ahoraCdmx),
            );
            if (cmp !== 0) {
                return cmp;
            }
            const prioA = prioridadEstado[a.estadoBoleto] ?? 3;
            const prioB = prioridadEstado[b.estadoBoleto] ?? 3;
            if (prioA !== prioB) {
                return prioA - prioB;
            }
            return b.idBoleto - a.idBoleto;
        });

        return misBoletos;
    }

    //DETALLE DEL BOLETO Y QR

    async obtenerDetalleBoleto(idUsuario: number, idBoleto: number) {
        const reserva = await this.asistenteRepo.findOne({
            where: { idUsuario: idUsuario, idBoleto: idBoleto }
        });

        if (!reserva) {
            throw new NotFoundException('No se encontró una reserva asociada a este boleto para el usuario actual.');
        }

        const boleto = await this.boletoRepo.findOne({ where: { idBoleto: idBoleto } });
        if (!boleto) throw new NotFoundException('Boleto no encontrado.');

        const subEvento = await this.subEventoRepo.findOne({ where: { idSubEvento: reserva.idSubEvento } });
        if (!subEvento) throw new NotFoundException('SubEvento asociado no encontrado.'); 

        const fechaEvento = await this.fechaRepo.findOne({ where: { idFecha: subEvento.idFecha } });
        if (!fechaEvento) throw new NotFoundException('Fecha del evento no encontrada.'); 

        const recinto = await this.recintoRepo.findOne({ where: { idRecinto: subEvento.idRecinto } });
        if (!recinto) throw new NotFoundException('Recinto no encontrado.'); 

        if (
            esModalidadConQr(subEvento.idModalidadAcceso) &&
            haAlcanzadoFechaHoraCdmx(String(fechaEvento.fecha), fechaEvento.horaFin) &&
            boleto.idEstadoBoleto === EstadoBoleto.VALIDO
        ) {
            boleto.idEstadoBoleto = EstadoBoleto.CANCELADO;
            await this.boletoRepo.save(boleto);
        }

        let qrBase64 = null;
        if (
            esModalidadConQr(subEvento.idModalidadAcceso) &&
            boleto.tokenQr &&
            boleto.tokenQr !== ''
        ) {
            qrBase64 = await this.qrService.generateImageFromToken(boleto.tokenQr);
        }

        let asientoDetalle = null;
        if (boleto.idAsiento) {
            const asiento = await this.asientoRepo.findOne({ where: { idAsiento: boleto.idAsiento } });
            if (asiento) {
                asientoDetalle = { fila: asiento.fila, numero: asiento.numero };
            }
        }

        const evento = await this.eventoRepo.findOne({ where: { idEvento: subEvento.idEvento } });

        return {
            idBoleto: boleto.idBoleto,
            estadoBoleto: boleto.idEstadoBoleto,
            qr: qrBase64,
            asiento: asientoDetalle,
            evento: {
                idEvento: subEvento.idEvento,
                nombre: evento ? evento.nombre : '',
            },
            subEvento: {
                idSubEvento: subEvento.idSubEvento,
                idEvento: subEvento.idEvento,
                nombre: subEvento.nombre,
                descripcion: subEvento.descripcion,
                idModalidadAcceso: subEvento.idModalidadAcceso,
                fecha: fechaEvento.fecha,
                horaInicio: fechaEvento.horaInicio,
                horaFin: fechaEvento.horaFin,
            },
            recinto: {
                idRecinto: recinto.idRecinto,
                nombre: recinto.nombre,
            }
        };
    }

    //CANCELACION LOGICA Y LIBERACION DEL LUGAR

    async cancelarReserva(idUsuario: number, idBoleto: number) {
    //Validar que la reserva existe y le pertenece al usuario
    const reserva = await this.asistenteRepo.findOne({
        where: { idUsuario: idUsuario, idBoleto: idBoleto }
    });

    if (!reserva) {
        throw new NotFoundException('No se encontró la reserva o no pertenece al usuario actual.');
    }

    const boleto = await this.boletoRepo.findOne({ where: { idBoleto: idBoleto } });
    if (!boleto) {
        throw new NotFoundException('El boleto no existe.');
    }

    //Validar que el boleto sea elegible para cancelacion
    if (boleto.idEstadoBoleto === EstadoBoleto.CANCELADO) {
        throw new ConflictException('Esta reserva ya se encontraba cancelada.');
    }
    if (boleto.idEstadoBoleto === EstadoBoleto.UTILIZADO) {
        throw new ConflictException('No puedes cancelar un boleto que ya fue escaneado en la entrada.');
    }

    //Esta parte es por si se usa el estado de boleto Expirado

    // if (boleto.idEstadoBoleto === EstadoBoleto.EXPIRADO) {
    //     throw new ConflictException('No puedes cancelar un boleto de un evento que ya terminó.');
    // }

    //Validar que el evento no haya comenzado
    const subEvento = await this.subEventoRepo.findOne({ where: { idSubEvento: reserva.idSubEvento } });
    if (subEvento) {
        const fechaEvento = await this.fechaRepo.findOne({ where: { idFecha: subEvento.idFecha } });
        if (fechaEvento) {
            if (haAlcanzadoFechaHoraCdmx(String(fechaEvento.fecha), fechaEvento.horaInicio)) {
                throw new ConflictException('El evento ya comenzó, el periodo de cancelación ha finalizado.');
            }
        }
    }

    // Aplicar Cancelacion Logica
    boleto.idEstadoBoleto = EstadoBoleto.CANCELADO;
    await this.boletoRepo.save(boleto); //boleto cancelado

    return {
      mensaje: 'Reserva cancelada exitosamente. Tu lugar ha sido liberado.',
      boleto: boleto
    };
  }
}