import { useState } from "react";
import { useParams } from "react-router";

import { Button } from "../../../components/atoms/Button/Button";
import { Spinner } from "../../../components/atoms/Spinner/Spinner";

import { SeatMap } from "../components/organisms/SeatMap";
import { useReservationAvailability } from "../hooks/useReservationAvailability";
import { toSeatMapItems } from "../services/reservations.service";

export function ReservationAvailabilityPreviewPage() {
  const { idSubEvento: idParam } =
    useParams<{ idSubEvento: string }>();

  const parsedId = Number(idParam);

  const idSubEvento =
    idParam &&
    Number.isSafeInteger(parsedId) &&
    parsedId > 0
      ? parsedId
      : null;

  const { availability, isLoading, error, refresh } =
    useReservationAvailability(idSubEvento);

  const [selectedSeatId, setSelectedSeatId] =
    useState<number | null>(null);

  const seats = availability
    ? toSeatMapItems(availability.asientos)
    : [];

  const selectedSeat = seats.find(
    (seat) =>
      seat.idAsiento === selectedSeatId &&
      !seat.occupied,
  );

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="font-merriweather text-3xl font-bold">
          Disponibilidad de reservaciones
        </h1>

        <p className="text-sm text-gray-600">
          Consulta de disponibilidad real del Backend.
          Esta pantalla no registra reservaciones.
        </p>
      </header>

      {isLoading && (
        <div className="flex items-center gap-3" role="status">
          <Spinner size="md" label="Cargando disponibilidad" />
          <span>Consultando lugares disponibles...</span>
        </div>
      )}

      {error && (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-eventos-error">
            {error}
          </p>

          {idSubEvento !== null && (
            <Button
              text="Reintentar"
              variant="outline"
              onClick={refresh}
            />
          )}
        </div>
      )}

      {availability && !isLoading && (
        <>
          <section className="rounded-xl border border-eventos-neutral bg-white p-6">
            <h2 className="font-merriweather text-xl font-bold">
              {availability.recinto.nombre}
            </h2>

            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-semibold">
                  Subevento
                </dt>
                <dd>{availability.idSubEvento}</dd>
              </div>

              <div>
                <dt className="text-sm font-semibold">
                  Aforo máximo
                </dt>
                <dd>{availability.recinto.aforo}</dd>
              </div>

              <div>
                <dt className="text-sm font-semibold">
                  Lugares disponibles
                </dt>
                <dd className="font-bold text-eventos-success">
                  {availability.lugaresDisponibles}
                </dd>
              </div>
            </dl>
          </section>

          {seats.length > 0 ? (
            <div className="space-y-4">
              <SeatMap
                seats={seats}
                selectedSeatId={selectedSeat?.idAsiento ?? null}
                onSelect={setSelectedSeatId}
                venueName={availability.recinto.nombre}
              />

              <p className="text-sm text-gray-700">
                Asiento seleccionado para la prueba:{" "}
                <strong>
                  {selectedSeat
                    ? `${selectedSeat.fila}${selectedSeat.numero}`
                    : "Ninguno"}
                </strong>
              </p>
            </div>
          ) : (
            <p className="rounded-xl border border-eventos-neutral p-5 text-sm">
              El Backend no devolvió asientos individuales
              para este recinto. La modalidad de reservación
              debe confirmarse con la configuración del evento.
            </p>
          )}

          <Button
            text="Actualizar disponibilidad"
            variant="outline"
            onClick={refresh}
          />
        </>
      )}
    </main>
  );
}

export default ReservationAvailabilityPreviewPage;