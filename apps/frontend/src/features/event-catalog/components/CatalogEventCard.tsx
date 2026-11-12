import { useState } from "react";
import { Link } from "react-router";
import { ImageOff } from "lucide-react";
import { AlcanceEvento } from "@eventos/shared";

import type { CatalogEventApi } from "../types/eventCatalog.types";
import {
  formatCatalogDate,
  formatCatalogTime,
  getEventDates,
} from "../utils/catalogFilters";

interface CatalogEventCardProps {
  event: CatalogEventApi;
  headingLevel?: "h2" | "h3";
}

export function CatalogEventCard({
                                   event,
                                   headingLevel: Heading = "h2",
                                 }: CatalogEventCardProps) {
  const [failedPoster, setFailedPoster] = useState<string | null>(null);

  const posterCandidate = event.poster?.trim() ?? "";
  const poster = /^https?:\/\//i.test(posterCandidate)
    ? posterCandidate
    : posterCandidate
      ? `http://localhost:9000/eventos-public/${posterCandidate.replace(/^\/+/, "")}`
      : null;

  const imageAvailable = poster !== null && failedPoster !== poster;

  const dates = getEventDates(event);
  const firstDate = dates[0] ?? null;
  const lastDate = dates[dates.length - 1] ?? null;

  const singleActivity =
    event.subEventos?.length === 1 ? event.subEventos[0] : null;

  const venueNames = [
    ...new Set(
      (event.subEventos ?? [])
        .map((activity) => activity.recinto?.nombre)
        .filter((name): name is string => Boolean(name))
    ),
  ];

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-eventos-panel-border bg-eventos-surface p-4 shadow-sm">
      <div className="mb-4 flex aspect-video items-center justify-center overflow-hidden rounded-md bg-eventos-panel-surface">
        {imageAvailable ? (
          <img
            src={poster ?? undefined}
            alt={`Póster de ${event.nombre}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setFailedPoster(poster)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-eventos-placeholder-text">
            <ImageOff size={30} aria-hidden="true" />
            <span className="text-sm">
              Póster no disponible
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <span className="w-fit rounded bg-eventos-primary-light px-2 py-0.5 text-xs font-medium text-eventos-primary">
          {event.idAlcance === AlcanceEvento.PUBLICO
            ? "Público"
            : event.idAlcance === AlcanceEvento.INTERNO
              ? "Interno"
              : event.idAlcance === AlcanceEvento.PRIVADO
                ? "Privado"
                : "No especificado"}
        </span>

        <Heading className="font-merriweather text-lg font-semibold leading-snug text-eventos-ink">
          {event.nombre}
        </Heading>

        <div className="space-y-1 text-sm leading-relaxed text-eventos-body-text">
          {firstDate === null ? (
            <p>
              <strong>Fecha:</strong> Por confirmar
            </p>
          ) : firstDate === lastDate ? (
            <p>
              <strong>Fecha:</strong> {formatCatalogDate(firstDate)}
            </p>
          ) : (
            <>
              <p>
                <strong>Fecha inicio:</strong> {formatCatalogDate(firstDate)}
              </p>
              <p>
                <strong>Fecha fin:</strong> {formatCatalogDate(lastDate!)}
              </p>
            </>
          )}

          {singleActivity?.fecha && (
            <p>
              <strong>Horario:</strong>{" "}
              {formatCatalogTime(singleActivity.fecha.horaInicio)}
              {" – "}
              {formatCatalogTime(singleActivity.fecha.horaFin)} hrs
            </p>
          )}

          {venueNames.length === 1 && (
            <p>
              <strong>Espacio:</strong> {venueNames[0]}
            </p>
          )}

          {venueNames.length > 1 && (
            <p>
              <strong>Espacios:</strong> {venueNames.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Link
          to={`/eventos/${event.idEvento}`}
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-eventos-primary px-5 py-2 text-sm font-semibold text-eventos-on-primary transition-colors hover:bg-eventos-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary"
        >
          Ver detalles
        </Link>
      </div>
    </article>
  );
}