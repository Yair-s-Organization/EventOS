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
  computadorasDisponibles?: number; 
  idEstadoRecinto?: number;
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
  CANCELADO= 4,
  FINALIZADO= 5
}

export enum EstadoSubEvento {
  ACEPTADO = 1,
  CANCELADO= 2,
  FINALIZADO= 3
}

export enum TipoCuentaUsuario {
  ADMINISTRADOR = 'Administrador',
  ASISTENTE = 'Asistente',
  SUBDIRECCION = 'Subdirección',
}

export enum EstadoVerificacion {
  VERIFICADO = 'Verificado',
  NO_VERIFICADO = 'No verificado',
}

