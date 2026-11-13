import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { QrService } from './qr.service';
import { MailService } from './mail.service';
import { CreateReservationDto } from '../dto/createReservation.dto';
import { Repository, In, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { DisponibilidadSubEvento, AsientoDisponible, EstadoRecinto, EstadoBoleto, EstadoSubEvento, AlcanceEvento } from '@eventos/shared';

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
    obtenerAhoraCdmx,
} from '../../../common/utils/fecha-cdmx.util';

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

    private resolverPosterUrl(poster?: string | null): string | null {
        if (!poster) return null;
        return poster.startsWith('http://') || poster.startsWith('https://')
            ? poster
            : this.storageService.publicUrl(poster);
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

        const asistentes = await this.asistenteRepo.find({ 
            where: { idSubEvento: idSubEvento } 
        });
        
        const idsBoleto = asistentes.map(a => a.idBoleto).filter(id => id !== null);

        let lugaresOcupados = 0;
        const idsAsientosOcupados = new Set<number>();

        if (idsBoleto.length > 0) {
            const boletos = await this.boletoRepo.findBy({ idBoleto: In(idsBoleto) });

            for (const boleto of boletos) {
                if (boleto.idEstadoBoleto === EstadoBoleto.VALIDO || boleto.idEstadoBoleto === EstadoBoleto.UTILIZADO) {
                    lugaresOcupados++;
                    if (boleto.idAsiento !== null) {
                        idsAsientosOcupados.add(boleto.idAsiento);
                    }
                }
            }
        }

        // Verificar si la actividad permite reservaciones (Evento Aceptado = 2, SubEvento Aceptado y Fecha futura)
        const limiteReserva = fechaEvento ? new Date(`${fechaEvento.fecha}T${fechaEvento.horaInicio}`) : new Date(0);
        const eventoActivo = evento && evento.idEstadoEvento === 2 && subEvento.estado === EstadoSubEvento.ACEPTADO && new Date() <= limiteReserva;

        const lugaresDisponibles = eventoActivo ? Math.max(0, recinto.aforo - lugaresOcupados) : 0;

        const asientosBD = await this.asientoRepo.find({ 
            where: { idRecinto: recinto.idRecinto } 
        });

        const asientos: AsientoDisponible[] = asientosBD.map(a => ({
            idAsiento: a.idAsiento,
            fila: a.fila,
            numero: a.numero,
            ocupado: !eventoActivo ? true : idsAsientosOcupados.has(a.idAsiento),
        }));

        return {
            idSubEvento: subEvento.idSubEvento,
            recinto: recinto,
            lugaresDisponibles,
            permiteReservar: Boolean(eventoActivo && lugaresDisponibles > 0),
            requiereSeleccionAsiento: asientos.length > 0,
            asientos,
        };
    }


    //CREAR RESERVA

    //logica de negocio para crear reserva

    async crearReserva(idUsuario: number, dto: CreateReservationDto): Promise<{ mensaje: string, boleto: any, qr?: string }> {
        // Obtener datos del usuario antes de bloquear filas en la BD
        const usuario = await this.usuarioRepo.findOne({ where: { idUsuario } });
        if (!usuario) {
            throw new NotFoundException('El usuario especificado no existe.');
        }

        // Transacción atómica
        const resultado = await this.dataSource.transaction(async (manager) => {
            
            // Verificar existencia y cierre de registro agregando el bloqueo de fila
            const subEvento = await manager.findOne(SubEventoEntity, { 
                where: { idSubEvento: dto.idSubEvento },
                lock: { mode: 'pessimistic_write' } 
            });
            
            if (!subEvento) {
                throw new NotFoundException('El subevento no existe');
            }

            if (subEvento.estado !== EstadoSubEvento.ACEPTADO) {
                throw new ConflictException('El registro para este evento se encuentra cerrado o cancelado');
            }

            const eventoPrincipal = await manager.findOne(EventoEntity, {
                where: { idEvento: subEvento.idEvento }
            });

            if (!eventoPrincipal || eventoPrincipal.idEstadoEvento !== 2) {
                throw new ConflictException('El evento principal no se encuentra autorizado o activo para reservaciones.');
            }

            if (eventoPrincipal.idAlcance === AlcanceEvento.PRIVADO) {
                const invitacionRaw = await manager.query(
                    `SELECT 1 FROM "invitacionEvento" WHERE "idEvento" = $1 AND "idUsuario" = $2 LIMIT 1`,
                    [eventoPrincipal.idEvento, idUsuario],
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

            const limiteReserva = new Date(`${fechaEvento.fecha}T${fechaEvento.horaInicio}`);
            
            if (new Date() > limiteReserva) {
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
                where: { idSubEvento: dto.idSubEvento, idUsuario: idUsuario }
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
            
            const asientosDelRecinto = await manager.find(AsientoEntity, {
                where: { idRecinto: recinto.idRecinto }
            });
            const requiereAsiento = asientosDelRecinto.length > 0;

            if (requiereAsiento && !dto.idAsiento) {
                throw new BadRequestException('Esta actividad requiere que selecciones un asiento.');
            }

            if (!requiereAsiento && dto.idAsiento) {
                throw new BadRequestException('Esta actividad es de entrada general y no utiliza asientos numerados.');
            }

            let asientoSeleccionado = null;
            if (dto.idAsiento) {
                asientoSeleccionado = asientosDelRecinto.find(a => a.idAsiento === dto.idAsiento);
                if (!asientoSeleccionado) {
                    throw new BadRequestException('El asiento seleccionado no pertenece al recinto asignado a este subevento.');
                }
            }

            // Verificar Aforo y Ocupación de Butaca solo en este SubEvento
            const asistentesAct = await manager.find(AsistenteEventoEntity, { 
                where: { idSubEvento: dto.idSubEvento } 
            });
            
            let lugaresOcupados = 0;
            const idsBoleto = asistentesAct.map(a => a.idBoleto).filter(id => id !== null);

            if (idsBoleto.length > 0) {
                const boletos = await manager.find(BoletoEntity, { 
                    where: { idBoleto: In(idsBoleto) } 
                });
                
                for (const b of boletos) {
                    if (b.idEstadoBoleto === EstadoBoleto.VALIDO || b.idEstadoBoleto === EstadoBoleto.UTILIZADO) {
                        lugaresOcupados++;
                        if (dto.idAsiento && b.idAsiento === dto.idAsiento) {
                            throw new ConflictException('El asiento seleccionado ya se encuentra ocupado en esta actividad.');
                        }
                    }
                }
            }

            if (lugaresOcupados >= recinto.aforo) {
                throw new ConflictException('El aforo para este evento se ha agotado.');
            }

            // GENERACIÓN DE QR Y GUARDADO
            const fechaFinEvento = new Date(`${fechaEvento.fecha}T${fechaEvento.horaFin}`);

            const boletoNuevoObj = manager.create(BoletoEntity, {
                tokenQr: '', 
                idAsiento: dto.idAsiento || null,
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

            if (subEvento.accesoQR) {
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

            return {
                boleto: boletoGuardado,
                qrBase64: qrBase64Data,
                datosCorreo: {
                    idBoleto: boletoGuardado.idBoleto,
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

            const limiteTerminoEvento = new Date(`${fechaEvento.fecha}T${fechaEvento.horaFin}`);

            // Si el evento ya terminó y el boleto seguía válido (no asistió), pasa a Cancelado
            if (new Date() > limiteTerminoEvento && boleto.idEstadoBoleto === EstadoBoleto.VALIDO) {
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
            if (subEvento.accesoQR && boleto.idEstadoBoleto === EstadoBoleto.VALIDO) {
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
                poster: evento ? this.resolverPosterUrl(evento.poster) : null,
                posterUrl: evento ? this.resolverPosterUrl(evento.poster) : null,
                alcance: evento?.idAlcance ? mapaAlcance[evento.idAlcance] : 'Público',
                accesoQR: subEvento.accesoQR,
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

        const limiteTerminoEvento = new Date(`${fechaEvento.fecha}T${fechaEvento.horaFin}`);
        if (new Date() > limiteTerminoEvento && boleto.idEstadoBoleto === EstadoBoleto.VALIDO) {
            boleto.idEstadoBoleto = EstadoBoleto.CANCELADO;
            await this.boletoRepo.save(boleto);
        }

        let qrBase64 = null;
        if (boleto.tokenQr && boleto.tokenQr !== '') {
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
                accesoQR: subEvento.accesoQR,
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
            const limiteCancelacion = new Date(`${fechaEvento.fecha}T${fechaEvento.horaInicio}`);
            if (new Date() > limiteCancelacion) {
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
