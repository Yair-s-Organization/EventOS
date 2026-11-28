import { EstadoSubEvento } from "@eventos/shared";
import { resolverUrlPoster } from "../../../utils/posterUrl";
import type { EventDetailsApi, SubEventDetailsApi } from "../types/eventDetails.api.types";
import type { EventActivityViewModel, EventDetailsViewModel } from "../types/eventDetails.types";

function todayInMexico(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function mapActivity(activity: SubEventDetailsApi, idEvento: number): EventActivityViewModel {
  return {
    idSubEvento: activity.idSubEvento,
    idEvento,
    nombre: activity.nombre,
    descripcion: activity.descripcion ?? "",
    idModalidadAcceso: activity.idModalidadAcceso,
    cupoMaximo: activity.cupoMaximo ?? null,
    cupoEfectivo: activity.cupoEfectivo,
    requiereSeleccionAsiento: activity.requiereSeleccionAsiento,
    fecha: activity.fecha ? {
      fecha: activity.fecha.fecha,
      horaInicio: activity.fecha.horaInicio,
      horaFin: activity.fecha.horaFin,
    } : null,
    recinto: activity.recinto ? {
      idRecinto: activity.recinto.idRecinto,
      nombre: activity.recinto.nombre,
      aforo: activity.recinto.aforo,
    } : null,
    ponentes: (activity.ponentes ?? []).map((speaker) => ({
      idPonente: speaker.idPonente,
      nombreCompleto: [speaker.nombre, speaker.apellidoPa, speaker.apellidoMa].filter(Boolean).join(" "),
    })),
  };
}

export function toEventDetailsViewModel(event: EventDetailsApi): EventDetailsViewModel {
  if (!event || !Number.isSafeInteger(event.idEvento) || !Array.isArray(event.subEventos)) {
    throw new Error("La respuesta de detalles del evento no es válida.");
  }
  const today = todayInMexico();
  const actividades = event.subEventos
    .filter((activity) =>
      activity.estado === EstadoSubEvento.ACEPTADO &&
      Boolean(activity.fecha?.fecha) &&
      activity.fecha!.fecha.slice(0, 10) >= today,
    )
    .map((activity) => mapActivity(activity, event.idEvento))
    .sort((a, b) => (a.fecha?.fecha ?? "").localeCompare(b.fecha?.fecha ?? ""));

  const posterReferencia = resolverUrlPoster(event.poster);

  return {
    idEvento: event.idEvento,
    nombre: event.nombre,
    descripcion: event.descripcion ?? "",
    posterReferencia,
    idAlcance: event.idAlcance,
    actividades,
  };
}

export function getActivityById(event: EventDetailsViewModel, idSubEvento: number): EventActivityViewModel | null {
  return event.actividades.find((activity) => activity.idSubEvento === idSubEvento) ?? null;
}
