//interfaces
export interface Evento {
  idEvento: number;
  nombre: string;
  descripcion: string;
  poster: string;
  idAlcance?: AlcanceEvento;
  idEstadoEvento?: EstadoEvento;
  esUrgente?: boolean;
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
  accesoQR: boolean;
  estado: EstadoSubEvento;
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
  computadorasDisponibles?: number;
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
  idSubEvento: number;
  idUsuario: number;
  idBoleto?: number | null;
}

export interface AsientoDisponible {
  idAsiento: number;
  fila: string;
  numero: number;
  ocupado: boolean; // <- calculado por el back
}

export interface DisponibilidadSubEvento {
  idSubEvento: number;
  recinto: Recinto;
  lugaresDisponibles: number;  //<- calculado por el back
  asientos: AsientoDisponible[]; // <- lista de asientos disponibles
}

export interface CrearReservaPayload {
  idSubEvento: number;
  idAsiento: number | null;
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
  accesoQR: boolean;
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
  informacionAdicional: string;
  archivo: string;
  fecha: string;
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
  accesoQR?: boolean;
  fecha: string;
  horaInicio: string;
  horaFin: string;
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

//el estado cancelado se va a usar? -> habria que revisarlo
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
}
