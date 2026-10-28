import { useState } from "react";
import { Button } from "../../../../components/atoms/Button/Button";
import { ConfirmationDialog } from "../../../../components/organisms/ConfirmationDialog/ConfirmationDialog";
import { ReservationSummary } from "../molecules/ReservationSummary";
import { SeatMap } from "./SeatMap";
import type { SeatMapItem } from "./SeatMap";
import { ReservationSuccessDialog } from "./ReservationSuccessDialog";

export interface ReservationPanelProps {
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  seats: SeatMapItem[];
  onReserve: (idAsiento: number) => Promise<void>;
  aisleAfter?: number[];
}

export function ReservationPanel({
                                   eventName,
                                   date,
                                   startTime,
                                   endTime,
                                   venue,
                                   seats,
                                   onReserve,
                                   aisleAfter = [],
                                 }: ReservationPanelProps) {
  const [selectedSeatId, setSelectedSeatId] =
    useState<number | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const selectedSeat =
    seats.find(
      (seat) =>
        seat.idAsiento === selectedSeatId && !seat.occupied,
    ) ?? null;

  const selectedSeatLabel = selectedSeat
    ? `${selectedSeat.fila}${selectedSeat.numero}`
    : null;

  const handleSeatSelect = (idAsiento: number) => {
    setSelectedSeatId(idAsiento);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedSeat || isLoading || isReserved) return;

    setIsLoading(true);
    setError(null);

    try {
      await onReserve(selectedSeat.idAsiento);

      setIsReserved(true);
      setIsConfirmOpen(false);
      setIsSuccessOpen(true);
    } catch {
      setError(
        "No fue posible completar la reservación. Inténtalo nuevamente.",
      );
      setIsConfirmOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      {!isReserved && (
        <SeatMap
          seats={seats}
          selectedSeatId={selectedSeat?.idAsiento ?? null}
          onSelect={handleSeatSelect}
          aisleAfter={aisleAfter}
          venueName={venue}
        />
      )}

      <ReservationSummary
        eventName={eventName}
        date={date}
        startTime={startTime}
        endTime={endTime}
        venue={venue}
        selectedSeatLabel={selectedSeatLabel}
      />

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
          text="Reservar asiento"
          disabled={!selectedSeat || isLoading}
          onClick={() => setIsConfirmOpen(true)}
        />
      )}

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        title="Confirmar reservación"
        description={`¿Deseas reservar el asiento ${
          selectedSeatLabel ?? ""
        } para el evento ${eventName}?`}
        confirmText="Confirmar reservación"
        cancelText="Volver"
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />

      <ReservationSuccessDialog
        isOpen={isSuccessOpen}
        eventName={eventName}
        seatLabel={selectedSeatLabel}
        onClose={() => setIsSuccessOpen(false)}
      />
    </section>
  );
}

export default ReservationPanel;