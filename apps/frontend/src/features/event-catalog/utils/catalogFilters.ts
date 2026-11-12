import type { CatalogEventApi } from "../types/eventCatalog.types";

export type DateFilter =
  | "todas"
  | "proximos"
  | "mes_actual"
  | "mes_siguiente"
  | "personalizado";

interface DateRange {
  start: string;
  end: string;
  includeTime: boolean;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function dateValue(value: string | null | undefined): string | null {
  const found = /^(\d{4}-\d{2}-\d{2})/.exec(value ?? "");
  return found ? found[1] : null;
}

function mexicoDateTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const part = (name: string) =>
    parts.find((item) => item.type === name)?.value ?? "00";

  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}:${part("second")}`;
}

function isoFromDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dateRange(
  filter: DateFilter,
  customStart: string,
  customEnd: string,
): DateRange | null {
  if (filter === "todas") {
    return null;
  }

  const now = new Date();
  const nowMexico = mexicoDateTime(now);
  const today = nowMexico.slice(0, 10);
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));

  if (filter === "proximos") {
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      start: nowMexico,
      end: mexicoDateTime(end),
      includeTime: true,
    };
  }

  if (filter === "mes_actual") {
    return {
      start: isoFromDate(new Date(Date.UTC(year, month - 1, 1))),
      end: isoFromDate(new Date(Date.UTC(year, month, 0))),
      includeTime: false,
    };
  }

  if (filter === "mes_siguiente") {
    return {
      start: isoFromDate(new Date(Date.UTC(year, month, 1))),
      end: isoFromDate(new Date(Date.UTC(year, month + 1, 0))),
      includeTime: false,
    };
  }

  return {
    start: customStart || "0000-01-01",
    end: customEnd || "9999-12-31",
    includeTime: false,
  };
}

function nextActivityStart(event: CatalogEventApi): string {
  const starts = (event.subEventos ?? [])
    .map((activity) => {
      const date = dateValue(activity.fecha?.fecha);
      const time = activity.fecha?.horaInicio;

      return date && time ? `${date}T${time}` : null;
    })
    .filter((value): value is string => value !== null)
    .sort();

  return starts[0] ?? "9999-12-31T23:59:59";
}

export function visibleEvents(
  events: CatalogEventApi[],
  search: string,
  selectedDate: DateFilter,
  venue: string,
  customStart = "",
  customEnd = "",
): CatalogEventApi[] {
  const query = normalizeText(search);
  const range = dateRange(selectedDate, customStart, customEnd);

  return events
    .flatMap((event) => {
      const matchesEventName =
        query !== "" && normalizeText(event.nombre).includes(query);

      const subEventos = (event.subEventos ?? []).filter((activity) => {
        const date = dateValue(activity.fecha?.fecha);

        if (!date) {
          return false;
        }

        let matchesDate = true;

        if (range) {
          if (range.includeTime) {
            const startTime = activity.fecha?.horaInicio;
            const endTime = activity.fecha?.horaFin;

            matchesDate = Boolean(
              startTime &&
              endTime &&
              `${date}T${endTime}` > range.start &&
              `${date}T${startTime}` <= range.end
            );
          } else {
            matchesDate = date >= range.start && date <= range.end;
          }
        }

        const matchesVenue =
          !venue || activity.recinto?.nombre === venue;

        const matchesSearch =
          !query ||
          matchesEventName ||
          normalizeText(activity.nombre).includes(query);

        return matchesDate && matchesVenue && matchesSearch;
      });

      if (subEventos.length === 0) {
        return [];
      }

      return [{ ...event, subEventos }];
    })
    .sort((first, second) => {
      return (
        nextActivityStart(first).localeCompare(nextActivityStart(second)) ||
        first.idEvento - second.idEvento
      );
    });
}

export function getEventDates(event: CatalogEventApi): string[] {
  return (event.subEventos ?? [])
    .map((activity) => dateValue(activity.fecha?.fecha))
    .filter((value): value is string => value !== null)
    .sort();
}

export function formatCatalogDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function formatCatalogTime(value: string): string {
  return value.slice(0, 5);
}