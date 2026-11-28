//interfaces
export interface Evento {
  idEvento: number;
  nombre: string;
  descripcion: string;
  poster: string;
  idAlcance?: AlcanceEvento;
  idEstadoEvento?: EstadoEvento;
  esUrgente?: boolean;
  motivoUrgencia?: string | null;
  motivoRechazo?: string | null;
  etiquetas?: TipoEtiqueta[];
  subEventos?: SubEvento[];
  justificacion?: string | null;
  idOrganizador: number;
}

export interface SubEvento {
  idSubEvento: number;
  idEvento: number;
  idRecinto: number;
  idFecha: number;
  nombre: string;
  descripcion: string;
  cupoMaximo?: number | null;
  idModalidadAcceso: ModalidadAcceso;
  estado: EstadoSubEvento;
  tokenInvitacion?: string;
  enlaceInvitacionActivo?: boolean;
}

export interface Fecha {
  idFecha: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export interface Recinto {
  idRecinto: number;
  nombre: string;
  aforo: number;
  idEstadoRecinto?: EstadoRecinto;
}

export interface Asiento {
  idAsiento: number;
  fila: string;
  numero: number;
  idRecinto: number;
}

export interface Boleto {
  idBoleto: number;
  tokenQr: string;
  fechaGeneracion: string;
  idAsiento: number | null;
  idEstadoBoleto: EstadoBoleto;
}

export interface AsistenteEvento {
  idAsistenteEvento?: number;
  idSubEvento: number;
  idUsuario: number;
  idBoleto?: number | null;
}

export type EstadoAsientoMapa = 'DISPONIBLE' | 'RETENIDO' | 'OCUPADO';

export interface AsientoDisponible {
  idAsiento: number;
  fila: string;
  numero: number;
  ocupado: boolean; // true si NO se puede seleccionar (boleto válido/utilizado, retención vigente o actividad no reservable)
  estado?: EstadoAsientoMapa;
}

export interface DisponibilidadSubEvento {
  idSubEvento: number;
  idModalidadAcceso?: ModalidadAcceso;
  recinto: Recinto;
  cupoMaximo?: number | null;
  cupoEfectivo?: number;
  lugaresDisponibles: number; //<- calculado por el back
  asientos: AsientoDisponible[]; // <- lista de asientos disponibles
}

export const DURACION_RETENCION_ASIENTO_MINUTOS = 5;

export interface RetencionAsientoActiva {
  idRetencionAsiento: number;
  idSubEvento: number;
  idAsiento: number;
  fila: string;
  numero: number;
  venceEn: string;          // ISO 8601 en UTC, calculado por el servidor
  serverNow: string;        // ISO 8601 en UTC, hora del servidor/BD al responder
  segundosRestantes: number;
}

export interface RetencionAsientoActualRespuesta {
  retencion: RetencionAsientoActiva | null;
}

export interface CrearReservaPayload {
  idSubEvento: number;
  idAsiento: number | null;
  idRetencionAsiento?: number | null;
}

export interface DetalleBoletoUsuario {
  idBoleto: number;
  fechaGeneracion: string;
  idEstadoBoleto: EstadoBoleto;
  qrImagenBase64: string; //<-la crea back
  idEvento: number;
  idSubEvento: number;
  nombreEvento: string;
  poster?: string | null;
  idModalidadAcceso: ModalidadAcceso;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  nombreRecinto: string;
  filaAsiento?: string | null;
  numeroAsiento?: number | null;
}

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellidoPa: string;
  apellidoMa?: string | null;
  correo: string;
  contrasena?: string;
  estatus?: boolean;
  esVerificado?: EstadoVerificacion;
  tipoCuenta?: TipoCuentaUsuario;
  esJefeAcademia?: boolean;
  intentosFallidos?: number;
  bloqueadoHasta?: string | Date | null;
}

export interface Ponente {
  idPonente: number;
  nombre: string;
  apellidoPa: string;
  apellidoMa?: string | null;
  correo: string;
  idSubEvento: number;
}

export interface Verificacion {
  idVerificacion: number;
  informacionAdicional: string | null; //Los externos pueden no mandar estos datos
  archivo: string;
  fecha: Date | string;
  idRol: number;
  idUsuario: number;
}

export interface Rol {
  idRol: number;
  rol: number;
}

export interface BitacoraEvento {
  idBitacoraEvento: number;
  idEvento: number;
  idSubEvento: number;
  idUsuarioActor?: number | null;
  idEstadoEvento: EstadoEvento;
  fechaHoraCambio: string;
}

export interface EstadoEquipo {
  idEstadoEquipo: number;
  numeroEquipo: number;
  estado: boolean;
  idRecinto: number;
}

export interface EventoPersonalLogistica {
  idEvento: number;
  idUsuario: number;
}

export interface EventoEtiqueta {
  idEvento: number;
  idTipoEtiqueta: number;
}

export interface SubeventoPayload {
  nombre: string;
  descripcion: string;
  idRecinto: number;
  idModalidadAcceso?: ModalidadAcceso;
  cupoMaximo?: number | null;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export interface SubEventoResumen {
  idSubEvento: number;
  nombre: string;
  fecha: string | null;
  horaInicio: string | null;
  horaFin: string | null;
  nombreRecinto: string | null;
}

export interface MisEventosItem {
  idEvento: number;
  nombre: string;
  descripcion: string;
  justificacion?: string | null;
  poster: string;
  posterUrl: string | null;
  idAlcance?: AlcanceEvento;
  idEstadoEvento?: EstadoEvento;
  cupoMaximo: number;
  boletosEmitidos: number;
  inscritosCount?: number;
  ingresadosCount?: number | null;
  subeventos: SubEventoResumen[];
}

export interface EventoOrganizadorDetalleSubevento {
  idSubEvento: number;
  nombre: string;
  descripcion: string;
  idModalidadAcceso: ModalidadAcceso;
  cupoMaximo?: number | null;
  cupoEfectivo?: number;
  estado: EstadoSubEvento;
  tokenInvitacion?: string;
  enlaceInvitacionActivo?: boolean;
  fecha: Fecha | null;
  recinto: Recinto | null;
  ponentes: Ponente[];
  boletosEmitidos: number;
  inscritosCount?: number;
  ingresadosCount?: number | null;
  invitados?: InvitadoEventoItem[];
}

export interface EventoOrganizadorDetalle {
  idEvento: number;
  nombre: string;
  descripcion: string;
  justificacion?: string | null;
  poster: string;
  posterUrl: string | null;
  idAlcance?: AlcanceEvento;
  idEstadoEvento?: EstadoEvento;
  esUrgente: boolean;
  motivoUrgencia?: string | null;
  motivoRechazo?: string | null;
  idOrganizador: number;
  cupoMaximo: number;
  boletosActivosCount: number;
  inscritosCount?: number;
  ingresadosCount?: number | null;
  subEventos: EventoOrganizadorDetalleSubevento[];
  solicitudModificacionPendiente?: {
    idSolicitudModificacion: number;
    motivoModificacion: string;
    subeventosPropuestos: SubEventoLogisticaPayload[];
    estado: string;
  } | null;
  invitados?: InvitadoEventoItem[];
  personalLogistica?: PersonalLogisticaItem[];
  logisticaCount?: number;
}

export interface PersonalLogisticaItem {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  tipoCuenta: string;
}

export interface AgregarPersonalLogisticaPayload {
  correo: string;
}

export interface ActivarCuentaLogisticaPayload {
  token: string;
  nombre: string;
  apellidoPa: string;
  apellidoMa?: string;
  contrasena: string;
}

export interface InvitadoEventoItem {
  idInvitacionEvento: number;
  idSubEvento?: number;
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  fechaUltimoEnvio: string;
  puedeReenviar: boolean;
  horasRestantesCooldown: number;
}

export interface AgregarInvitadoPayload {
  correo: string;
}

export interface AgregarInvitadosMasivoPayload {
  correos: string[];
}

export interface FalloEnvioInvitacionItem {
  correo: string;
  motivo: string;
}

export interface OmitidoInvitacionItem {
  correo: string;
  motivo: string;
}

export interface ResultadoCargaMasivaInvitados {
  mensaje: string;
  totalProcesados: number;
  cupoRestante: number;
  exitosos: InvitadoEventoItem[];
  pendientesRegistro: string[];
  omitidos: OmitidoInvitacionItem[];
  fallidos: FalloEnvioInvitacionItem[];
}

export interface ActualizarEnlaceInvitacionPayload {
  activo: boolean;
}

export interface DetalleSubEventoPrivadoResponse {
  idEvento: number;
  nombreEvento: string;
  descripcionEvento: string;
  posterUrl: string | null;
  idAlcance: AlcanceEvento;
  idSubEvento: number;
  nombreSubEvento: string;
  descripcionSubEvento: string;
  idModalidadAcceso: ModalidadAcceso;
  esAccesoLibre: boolean;
  requiereCuenta: boolean;
  enlaceInvitacionActivo: boolean;
  usuarioAutenticado: boolean;
  yaAutorizado: boolean;
  cupoDisponible: number;
  sinCupo: boolean;
  fecha: Fecha | null;
  recinto: Recinto | null;
  ponentes: Array<{
    idPonente: number;
    nombre: string;
    apellidoPa: string;
    apellidoMa: string | null;
  }>;
}

export interface SubEventoLogisticaPayload extends SubeventoPayload {
  idSubEvento?: number;
}

export interface ModificarLogisticaPayload {
  subeventos: SubEventoLogisticaPayload[];
  motivoModificacion?: string;
}

export interface PonentePayload {
  idPonente?: number;
  nombre: string;
  apellidoPa: string;
  apellidoMa?: string | null;
  correo?: string;
  idSubEvento?: number;
}

export interface ActualizarInfoGeneralPayload {
  idSubEvento?: number;
  nombre?: string;
  descripcion?: string;
  justificacion?: string;
  poster?: string;
  idAlcance?: AlcanceEvento;
  ponentes?: PonentePayload[];
}

export interface CancelarSolicitudPayload {
  motivo: string;
  motivoCancelacion?: string;
}

// Enums
export enum TipoEtiqueta {
  IA = 1,
  TECNOLOGIA = 2,
  SALUD = 3,
  CIENCIA = 4,
  SISTEMAS = 5,
}

export enum AlcanceEvento {
  PUBLICO = 1,
  INTERNO = 2,
  PRIVADO = 3,
}

export enum EstadoEvento {
  RECHAZADO = 1,
  ACEPTADO = 2,
  ENPROCESO = 3,
  CANCELADO = 4,
  FINALIZADO = 5,
}

export enum EstadoSubEvento {
  RECHAZADO = 'Rechazado',
  ACEPTADO = 'Aceptado',
  EN_PROCESO = 'En Proceso',
  ENPROCESO = 'En Proceso',
  CANCELADO = 'Cancelado',
  FINALIZADO = 'Finalizado',
}

export enum EstadoRecinto {
  HABILITADO = 1,
  INHABILITADO = 2,
  MANTENIMIENTO = 3,
}

export enum EstadoBoleto {
  VALIDO = 1,
  UTILIZADO = 2,
  CANCELADO = 3,
}

export enum TipoCuentaUsuario {
  ADMINISTRADOR = 'Administrador',
  ASISTENTE = 'Asistente',
  SUBDIRECCION = 'Subdirección',
  INTERNO = 'Usuario Interno',
  EXTERNO = 'Usuario Externo',
}

export enum EstadoVerificacion {
  VERIFICADO = 'Verificado',
  NO_VERIFICADO = 'No verificado',
}

export enum RecintoId {
  AUDITORIO = 1,
  LABORATORIO_A = 2,
  LABORATORIO_B = 3,
  SALA_14 = 4,
  LABORATORIO_2104 = 2,
  LABORATORIO_2105 = 3,
  LABORATORIO_2106 = 5,
  LABORATORIO_2107 = 6,
}

export enum ModalidadAcceso {
  ACCESO_LIBRE = 1,
  REGISTRO_SIMPLE = 2,
  QR_GENERAL = 3,
  QR_MAPA = 4,
}

export const ETIQUETAS_MODALIDAD: Record<ModalidadAcceso, string> = {
  [ModalidadAcceso.ACCESO_LIBRE]: 'Acceso libre',
  [ModalidadAcceso.REGISTRO_SIMPLE]: 'Registro simple sin QR',
  [ModalidadAcceso.QR_GENERAL]: 'QR Admisión general',
  [ModalidadAcceso.QR_MAPA]: 'QR con mapa de asientos',
};

export const DESCRIPCIONES_MODALIDAD: Record<ModalidadAcceso, string> = {
  [ModalidadAcceso.ACCESO_LIBRE]:
    'Entrada abierta hasta completar el aforo del recinto. No requiere registro previo ni código QR.',
  [ModalidadAcceso.REGISTRO_SIMPLE]:
    'El asistente aparta su lugar en línea contra el aforo del recinto, sin generar código QR ni requerir escáner en puerta.',
  [ModalidadAcceso.QR_GENERAL]:
    'El asistente realiza registro previo y recibe un boleto digital con código QR sin asiento numerado.',
  [ModalidadAcceso.QR_MAPA]:
    'El asistente elige una butaca específica en el mapa del Auditorio y recibe su boleto digital con código QR.',
};

export function permiteCupoConfigurable(
  idModalidadAcceso?: ModalidadAcceso | number | null,
): boolean {
  return (
    idModalidadAcceso === ModalidadAcceso.REGISTRO_SIMPLE ||
    idModalidadAcceso === ModalidadAcceso.QR_GENERAL
  );
}

/** Normaliza cupoMaximo según la modalidad de acceso del subevento. */
export function normalizarCupoMaximo(
  cupoMaximo: number | null | undefined,
  aforoRealRecinto: number,
  idModalidadAcceso?: ModalidadAcceso | number | null,
): number | null {
  if (idModalidadAcceso === ModalidadAcceso.ACCESO_LIBRE) {
    return null;
  }
  if (idModalidadAcceso === ModalidadAcceso.QR_MAPA) {
    return aforoRealRecinto > 0 ? Math.trunc(aforoRealRecinto) : null;
  }
  if (cupoMaximo === null || cupoMaximo === undefined || Number.isNaN(cupoMaximo)) {
    return null;
  }
  return Math.trunc(cupoMaximo);
}

/** Valida que cupoMaximo sea entero positivo y no exceda el aforo real del recinto. */
export function validarCupoMaximo(
  cupoMaximo: number | null | undefined,
  aforoRealRecinto: number,
  idModalidadAcceso?: ModalidadAcceso | number | null,
): string | null {
  if (!permiteCupoConfigurable(idModalidadAcceso)) {
    return null;
  }
  if (cupoMaximo === null || cupoMaximo === undefined) {
    return null;
  }
  if (!Number.isInteger(cupoMaximo) || cupoMaximo < 1) {
    return 'El cupo máximo de asistentes debe ser un número entero mayor o igual a 1.';
  }
  if (aforoRealRecinto > 0 && cupoMaximo > aforoRealRecinto) {
    return `El cupo máximo (${cupoMaximo}) no puede exceder el aforo físico vigente del recinto (${aforoRealRecinto}).`;
  }
  return null;
}

/** Calcula la capacidad operativa real aplicando min(cupoMaximo, aforoRealRecinto). */
export function calcularCapacidadEfectiva(
  cupoMaximo: number | null | undefined,
  aforoRealRecinto: number,
  idModalidadAcceso?: ModalidadAcceso | number | null,
): number {
  const aforoSeguro = Math.max(0, Math.trunc(aforoRealRecinto));
  if (
    idModalidadAcceso === ModalidadAcceso.QR_MAPA ||
    idModalidadAcceso === ModalidadAcceso.ACCESO_LIBRE
  ) {
    return aforoSeguro;
  }
  if (
    cupoMaximo === null ||
    cupoMaximo === undefined ||
    !Number.isFinite(cupoMaximo) ||
    cupoMaximo < 1
  ) {
    return aforoSeguro;
  }
  return Math.min(Math.trunc(cupoMaximo), aforoSeguro);
}

export function esModalidadConQr(
  idModalidadAcceso?: ModalidadAcceso | number | null,
): boolean {
  return (
    idModalidadAcceso === ModalidadAcceso.QR_GENERAL ||
    idModalidadAcceso === ModalidadAcceso.QR_MAPA
  );
}

export function esModalidadConRegistro(
  idModalidadAcceso?: ModalidadAcceso | number | null,
): boolean {
  return (
    idModalidadAcceso === ModalidadAcceso.REGISTRO_SIMPLE ||
    idModalidadAcceso === ModalidadAcceso.QR_GENERAL ||
    idModalidadAcceso === ModalidadAcceso.QR_MAPA
  );
}

export function esLaboratorioRecinto(idRecinto?: number | null): boolean {
  return (
    typeof idRecinto === 'number' &&
    idRecinto > 0 &&
    idRecinto !== RecintoId.AUDITORIO &&
    idRecinto !== RecintoId.SALA_14
  );
}

export function obtenerEtiquetaModalidad(
  idModalidadAcceso?: ModalidadAcceso | number | null,
): string {
  if (
    idModalidadAcceso === ModalidadAcceso.ACCESO_LIBRE ||
    idModalidadAcceso === ModalidadAcceso.REGISTRO_SIMPLE ||
    idModalidadAcceso === ModalidadAcceso.QR_GENERAL ||
    idModalidadAcceso === ModalidadAcceso.QR_MAPA
  ) {
    return ETIQUETAS_MODALIDAD[idModalidadAcceso];
  }
  return 'No especificado';
}

export function obtenerModalidadesPermitidasPorRecinto(
  idRecinto: number,
): ModalidadAcceso[] {
  if (idRecinto === RecintoId.AUDITORIO) {
    return [
      ModalidadAcceso.ACCESO_LIBRE,
      ModalidadAcceso.REGISTRO_SIMPLE,
      ModalidadAcceso.QR_GENERAL,
      ModalidadAcceso.QR_MAPA,
    ];
  }
  if (idRecinto === RecintoId.SALA_14) {
    return [
      ModalidadAcceso.ACCESO_LIBRE,
      ModalidadAcceso.REGISTRO_SIMPLE,
      ModalidadAcceso.QR_GENERAL,
    ];
  }
  return [ModalidadAcceso.QR_GENERAL];
}

export function validarModalidadEnRecinto(
  idRecinto: number,
  idModalidadAcceso: ModalidadAcceso,
): string | null {
  if (
    idRecinto === RecintoId.SALA_14 &&
    idModalidadAcceso === ModalidadAcceso.QR_MAPA
  ) {
    return 'En Sala 14 no se permite la modalidad con mapa de asientos.';
  }
  if (
    esLaboratorioRecinto(idRecinto) &&
    idModalidadAcceso !== ModalidadAcceso.QR_GENERAL
  ) {
    return 'En los laboratorios de cómputo la única modalidad válida es QR Admisión general.';
  }
  if (!obtenerModalidadesPermitidasPorRecinto(idRecinto).includes(idModalidadAcceso)) {
    return 'La modalidad de acceso seleccionada no es válida para este recinto.';
  }
  return null;
}

export function modalidadPorDefectoRecinto(
  idRecinto: number,
  conQr: boolean,
): ModalidadAcceso {
  if (!conQr) {
    return ModalidadAcceso.ACCESO_LIBRE;
  }
  return idRecinto === RecintoId.AUDITORIO
    ? ModalidadAcceso.QR_MAPA
    : ModalidadAcceso.QR_GENERAL;
}

export type TipoTransicionModalidad =
  | 'CONSERVADO'
  | 'CANCELADO_REAUTH'
  | 'CANCELADO_LIBERADO';

export interface ImpactoCambioSubevento {
  idSubEvento: number;
  nombreSubEvento: string;
  inscritosActivos: number;
  aforoOrigen?: number;
  aforoDestino: number;
  idRecintoOrigen: number;
  idRecintoDestino: number;
  modalidadOrigen: ModalidadAcceso;
  modalidadDestino: ModalidadAcceso;
  cambioRecinto: boolean;
  cambioModalidad: boolean;
  cambioCupo?: boolean;
  conservadosFifo: number;
  canceladosSobrecupoFifo: number;
  canceladosPorTransicion: number;
  tipoTransicion: TipoTransicionModalidad | null;
  resumenTexto: string;
}

/** Clasifica el tratamiento de registros activos ante cambios de recinto o modalidad. */
export function clasificarTransicionModalidad(
  origen: ModalidadAcceso,
  destino: ModalidadAcceso,
): TipoTransicionModalidad {
  if (destino === ModalidadAcceso.ACCESO_LIBRE) {
    return 'CANCELADO_LIBERADO';
  }
  if (origen === ModalidadAcceso.ACCESO_LIBRE) {
    return 'CANCELADO_REAUTH';
  }
  if (
    origen === ModalidadAcceso.REGISTRO_SIMPLE &&
    destino !== ModalidadAcceso.REGISTRO_SIMPLE
  ) {
    return 'CANCELADO_REAUTH';
  }
  if (
    origen === ModalidadAcceso.QR_GENERAL &&
    destino === ModalidadAcceso.QR_MAPA
  ) {
    return 'CANCELADO_REAUTH';
  }
  return 'CONSERVADO';
}

/** Calcula el impacto estimado de corte FIFO y transición sobre reservas activas. */
export function calcularImpactoCambioSubevento(params: {
  idSubEvento: number;
  nombreSubEvento: string;
  inscritosActivos: number;
  aforoOrigen?: number;
  aforoDestino: number;
  idRecintoOrigen: number;
  idRecintoDestino: number;
  modalidadOrigen: ModalidadAcceso;
  modalidadDestino: ModalidadAcceso;
}): ImpactoCambioSubevento | null {
  const cambioRecinto = params.idRecintoOrigen !== params.idRecintoDestino;
  const cambioModalidad = params.modalidadOrigen !== params.modalidadDestino;
  const cambioCupo =
    typeof params.aforoOrigen === 'number' &&
    params.aforoOrigen !== params.aforoDestino;

  if (!cambioRecinto && !cambioModalidad && !cambioCupo) {
    return null;
  }

  const { inscritosActivos, aforoDestino, modalidadOrigen, modalidadDestino } = params;
  const transicion = clasificarTransicionModalidad(modalidadOrigen, modalidadDestino);

  if (inscritosActivos <= 0) {
    return {
      ...params,
      cambioRecinto,
      cambioModalidad,
      cambioCupo,
      conservadosFifo: 0,
      canceladosSobrecupoFifo: 0,
      canceladosPorTransicion: 0,
      tipoTransicion: transicion,
      resumenTexto: '',
    };
  }

  if (modalidadDestino === ModalidadAcceso.ACCESO_LIBRE) {
    return {
      ...params,
      cambioRecinto,
      cambioModalidad,
      cambioCupo,
      conservadosFifo: 0,
      canceladosSobrecupoFifo: 0,
      canceladosPorTransicion: inscritosActivos,
      tipoTransicion: 'CANCELADO_LIBERADO',
      resumenTexto: `Al cambiar a Acceso libre, los ${inscritosActivos} registros activos se cancelarán y liberarán con aviso por correo.`,
    };
  }

  const aforoSeguro = Math.max(0, aforoDestino);
  const canceladosSobrecupoFifo =
    inscritosActivos > aforoSeguro ? inscritosActivos - aforoSeguro : 0;
  const enAforo = inscritosActivos - canceladosSobrecupoFifo;
  const conservadosFifo = transicion === 'CONSERVADO' ? enAforo : 0;
  const canceladosPorTransicion = transicion === 'CANCELADO_REAUTH' ? enAforo : 0;

  let resumenTexto = '';
  if (canceladosSobrecupoFifo > 0 && transicion === 'CONSERVADO') {
    resumenTexto =
      !cambioRecinto && !cambioModalidad && cambioCupo
        ? `El cupo máximo configurado será de ${aforoSeguro} personas y actualmente hay ${inscritosActivos} inscritos. Se conservarán los primeros ${enAforo} registros por orden cronológico de inscripción y los ${canceladosSobrecupoFifo} restantes serán cancelados.`
        : `El espacio destino tiene capacidad para ${aforoSeguro} personas y actualmente hay ${inscritosActivos} inscritos. Se conservarán los primeros ${enAforo} registros por orden cronológico de inscripción y los ${canceladosSobrecupoFifo} restantes serán cancelados por sobrecupo.`;
  } else if (canceladosSobrecupoFifo > 0 && transicion === 'CANCELADO_REAUTH') {
    resumenTexto = `El espacio destino tiene capacidad para ${aforoSeguro} personas y actualmente hay ${inscritosActivos} inscritos. Los ${canceladosSobrecupoFifo} registros más recientes serán cancelados por sobrecupo y los primeros ${enAforo} deberán realizar un nuevo registro por cambio de modalidad.`;
  } else if (transicion === 'CANCELADO_REAUTH') {
    resumenTexto = `Por cambio de modalidad, los ${inscritosActivos} registros actuales serán cancelados para que los asistentes realicen un nuevo registro acorde al espacio destino.`;
  } else {
    const notaSinAsiento =
      modalidadOrigen === ModalidadAcceso.QR_MAPA &&
      modalidadDestino !== ModalidadAcceso.QR_MAPA
        ? ' (pasarán a admisión general sin asiento numerado asignado)'
        : '';
    resumenTexto = `Los ${inscritosActivos} registros actuales conservarán su lugar${notaSinAsiento} y recibirán notificación de actualización.`;
  }

  return {
    ...params,
    cambioRecinto,
    cambioModalidad,
    cambioCupo,
    conservadosFifo,
    canceladosSobrecupoFifo,
    canceladosPorTransicion,
    tipoTransicion: transicion,
    resumenTexto,
  };
}

export enum TipoPerfilVerificacion {
  ESTUDIANTE = 'Estudiante',
  PROFESOR = 'Profesor',
  DOCENTE = 'Docente',
  EMPRESA = 'Empresa',
  EXTERNO = 'Externo',
}

// Verificar identidad y verificación de vigencia de autenticación
export interface PerfilUsuarioResponse {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  tipoCuenta: TipoCuentaUsuario;
  cuenta: EstadoVerificacion;
  tipoUsuario: string;
  fechaUltimaVerificacion: Date | string | null;
  verificacionVigente: boolean;
  solicitudPendiente?: boolean;
  estadoSolicitud?: 'Sin solicitud' | 'Pendiente' | 'Verificado';
}

// Solicitud de verificación para evaluación de Subdirección
export interface SolicitudVerificacionItem {
  idVerificacion: number;
  idUsuario: number;
  estado: 'Pendiente' | 'Verificado';
  fechaSolicitud: Date | string;
  perfilSolicita: string;
  nombre: string;
  correo: string;
  numeroBoleta: string | null;
  informacionAdicional: string | null;
  // en el detalle es una URL firmada temporal (10 min) o una data URL antigua; no se incluye en el listado.
  archivo?: string | null;
}

export interface RechazarVerificacionPayload {
  motivo: string;
  detalle?: string | null;
}

export interface SolicitanteResumen {
  idUsuario: number;
  nombre: string;
  apellidoPa: string;
  apellidoMa: string | null;
  nombreCompleto: string;
  correo: string;
  esVerificado: EstadoVerificacion;
  tipoCuenta: TipoCuentaUsuario;
  esJefeAcademia: boolean;
}

// Cuentas del sistema para el Panel de Administrador
export interface CuentaSistemaItem {
  idUsuario: number;
  nombre: string;
  correo: string;
  estado: 'Activo' | 'Inactivo';
  esVerificado: EstadoVerificacion;
  rol: string;
  tipoCuenta: TipoCuentaUsuario;
  estatus: boolean;
}

export interface MovimientoBitacoraItem {
  idBitacoraEvento: number;
  idEvento: number;
  idSubEvento: number;
  evento: string;
  subEvento: string;
  idEstadoEvento: EstadoEvento;
  estado: string;
  idUsuarioActor: number | null;
  usuario: string;
  correoUsuario: string | null;
  fecha: string;
  hora: string;
  fechaHoraCambio: string;
}

export interface JefeDepartamentoItem {
  idUsuario: number;
  boleta: string;
  nombre: string;
  correoInstitucional: string;
  esJefeAcademia: boolean;
}

export interface SolicitarRecuperacionPayload {
  correo: string;
}

export interface RestablecerContrasenaPayload {
  token: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}

export interface ConfirmarRegistroPayload {
  token: string;
}