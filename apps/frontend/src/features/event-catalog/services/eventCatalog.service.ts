import { EstadoSubEvento } from "@eventos/shared";
import { apiRequest } from "../../../lib/apiClient";
import type { CatalogEventApi } from "../types/eventCatalog.types";

interface CatalogEventSummary {
  idEvento: number;
}

export interface CatalogEventsResult {
  events: CatalogEventApi[];
  failedCount: number;
}

function nowInMexico() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const part = (name: string) =>
    parts.find((item) => item.type === name)?.value ?? "00";

  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}:${part("second")}`,
  };
}

export const eventCatalogService = {
  async getEvents(signal?: AbortSignal): Promise<CatalogEventsResult> {
    const summaries = await apiRequest<CatalogEventSummary[]>(
      "eventos",
      { signal },
    );

    if (!Array.isArray(summaries)) {
      throw new Error("La respuesta de eventos no es válida.");
    }

    if (summaries.length === 0) {
      return { events: [], failedCount: 0 };
    }

    const now = nowInMexico();

    const results = await Promise.allSettled(
      summaries.map((event) =>
        apiRequest<CatalogEventApi>(
          `eventos/${event.idEvento}`,
          { signal },
        ),
      ),
    );

    if (signal?.aborted) {
      throw new DOMException("Solicitud cancelada", "AbortError");
    }

    if (results.every((result) => result.status === "rejected")) {
      throw new Error("No se pudieron cargar los detalles de los eventos.");
    }

    const failedCount = results.filter(
      (result) => result.status === "rejected",
    ).length;

    const events = results.flatMap((result) => {
      if (result.status !== "fulfilled") {
        return [];
      }

      const event = result.value;

      const subEventos = (event.subEventos ?? []).filter((activity) => {
        const date = activity.fecha?.fecha?.slice(0, 10);
        const endTime = activity.fecha?.horaFin?.slice(0, 8);

        if (
          activity.estado !== EstadoSubEvento.ACEPTADO ||
          !date ||
          !endTime
        ) {
          return false;
        }

        return (
          date > now.date ||
          (date === now.date && endTime > now.time)
        );
      });

      if (subEventos.length === 0) {
        return [];
      }

      return [{ ...event, subEventos }];
    });

    return { events, failedCount };
  },
};