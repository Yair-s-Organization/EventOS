import { useState } from "react";

import { Button } from "../../../../components/atoms/Button/Button";
import { ConfirmationDialog } from "../../../../components/organisms/ConfirmationDialog/ConfirmationDialog";
import { ReservationSummary } from "../molecules/ReservationSummary";
import { ReservationSuccessDialog } from "./ReservationSuccessDialog";

export interface AutomaticReservationPanelProps {
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  onReserve: () => Promise<void>;
}

export function AutomaticReservationPanel({
                                            eventName,
                                            date,
                                            startTime,
                                            endTime,
                                            venue,
                                            onReserve,
                                          }: AutomaticReservationPanelProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleConfirm = async () => {
    if (isLoading || isReserved) return;

    setIsLoading(true);
    setError(null);

    try {
      await onReserve();

      setIsReserved(true);
      setIsConfirmOpen(false);
      setIsSuccessOpen(true);
    } catch {
      setError(
        "No fue posible reservar un lugar. Verifica la disponibilidad e inténtalo nuevamente.",
      );
      setIsConfirmOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <ReservationSummary
        eventName={eventName}
        date={date}
        startTime={startTime}
        endTime={endTime}
        venue={venue}
        selectedSeatLabel={null}
        showSeat={false}
      />

      <div className="rounded-xl border border-eventos-neutral p-5">
        <h2 className="font-merriweather text-xl font-bold">
          Reservación de lugar
        </h2>

        <p className="mt-3 text-sm text-gray-600">
          Para este recinto no necesitas seleccionar un asiento.
          El sistema asignará un lugar disponible al confirmar
          tu reservación.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-eventos-error">
          {error}
        </p>
      )}

      {isReserved ? (
        <p role="status" className="text-eventos-success">
          Reservación registrada correctamente.
        </p>
      ) : (
        <Button
          text="Reservar lugar"
          disabled={isLoading}
          onClick={() => setIsConfirmOpen(true)}
        />
      )}

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        title="Confirmar reservación"
        description={`¿Deseas reservar un lugar para el evento ${eventName}?`}
        confirmText="Confirmar reservación"
        cancelText="Volver"
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />

      <ReservationSuccessDialog
        isOpen={isSuccessOpen}
        eventName={eventName}
        onClose={() => setIsSuccessOpen(false)}
      />
    </section>
  );
}

export default AutomaticReservationPanel;
