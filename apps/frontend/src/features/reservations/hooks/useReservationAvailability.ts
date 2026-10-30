import { useEffect, useState } from "react";
import type { DisponibilidadSubEvento } from "@eventos/shared";

import { reservationsService } from "../services/reservations.service";

export function useReservationAvailability(
  idSubEvento: number | null,
) {
  const [availability, setAvailability] =
    useState<DisponibilidadSubEvento | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (idSubEvento === null) {
      setAvailability(null);
      setError("El identificador del subevento no es válido.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    setError(null);
    setAvailability(null);

    void reservationsService
      .getAvailability(idSubEvento, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setAvailability(data);
        }
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;

        const message =
          cause instanceof Error
            ? cause.message
            : "No se pudo consultar la disponibilidad.";

        setError(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [idSubEvento, refreshKey]);

  const refresh = () => {
    setRefreshKey((current) => current + 1);
  };

  return {
    availability,
    isLoading,
    error,
    refresh,
  };
}