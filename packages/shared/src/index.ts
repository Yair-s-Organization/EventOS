//interfaces
export interface Evento {
  idEvento: number;
  nombre: string;
  descripcion: string;
  poster?: string | null;
  idAlcance?: AlcanceEvento;
  idEstadoEvento?: EstadoEvento;
  etiquetas?: TipoEtiqueta[];
  subEventos?: SubEvento[];
  justificacion: string;
  idOrganizador: number;
}

export interface SubEvento {
  idSubEvento: number;
  idEvento: number;
  idRecinto: number;
  idFecha: number;
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
  idBoleto: number;
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
  apP: string;
  apM?: string | null;
  correo: string;
  contrasena?: string;
  estatus?: boolean;
  esVerificado?: EstadoVerificacion;
  tipoCuenta?: TipoCuentaUsuario;
  esJefeAcademia?: boolean;
}


//Enums

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
  FINALIZADO = 5
}

export enum EstadoSubEvento {
  ACEPTADO = 1,
  CANCELADO = 2,
  FINALIZADO = 3
}

export enum EstadoRecinto{
  HABILITADO = 1,
  INHABILITADO = 2,
  MANTENIMIENTO = 3
}

//el estado cancelado se va a usar? -> habria que revisarlo
export enum EstadoBoleto {
  VALIDO = 1,
  UTILIZADO = 2,
  CANCELADO = 3
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

