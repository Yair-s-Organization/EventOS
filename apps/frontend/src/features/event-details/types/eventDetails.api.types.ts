import type { AlcanceEvento, EstadoSubEvento, ModalidadAcceso } from "@eventos/shared";

export interface EventDateApi {
  idFecha: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export interface EventVenueApi {
  idRecinto: number;
  nombre: string;
  aforo: number;
}

export interface EventSpeakerApi {
  idPonente: number;
  nombre: string;
  apellidoPa: string;
  apellidoMa: string | null;
}

export interface SubEventDetailsApi {
  idSubEvento: number;
  nombre: string;
  descripcion: string;
  estado: EstadoSubEvento;
  idModalidadAcceso: ModalidadAcceso;
  cupoMaximo?: number | null;
  cupoEfectivo?: number;
  requiereSeleccionAsiento: boolean;
  fecha: EventDateApi | null;
  recinto: EventVenueApi | null;
  ponentes: EventSpeakerApi[];
}

export interface EventDetailsApi {
  idEvento: number;
  nombre: string;
  descripcion: string;
  poster: string;
  idAlcance: AlcanceEvento;
  esAccesoLibre: boolean;
  requiereCuenta: boolean;
  subEventos: SubEventDetailsApi[];
}
