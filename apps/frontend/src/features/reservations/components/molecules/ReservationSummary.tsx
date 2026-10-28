export default ReservationSummary;export interface ReservationSummaryProps {
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  selectedSeatLabel: string | null;
  showSeat?: boolean;
}

export function ReservationSummary({
                                     eventName,
                                     date,
                                     startTime,
                                     endTime,
                                     venue,
                                     selectedSeatLabel,
                                     showSeat = true,
                                   }: ReservationSummaryProps) {
  return (
    <section
      aria-label="Resumen de reservación"
      className="space-y-4 rounded-xl border
                 border-eventos-neutral p-5"
    >
      <h2 className="font-merriweather text-xl font-bold">
        Resumen de reservación
      </h2>

      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-semibold">Evento</dt>
          <dd>{eventName}</dd>
        </div>

        <div>
          <dt className="font-semibold">Fecha</dt>
          <dd>{date}</dd>
        </div>

        <div>
          <dt className="font-semibold">Horario</dt>
          <dd>
            {startTime} - {endTime}
          </dd>
        </div>

        <div>
          <dt className="font-semibold">Recinto</dt>
          <dd>{venue}</dd>
        </div>

        {showSeat && (
          <div>
            <dt className="font-semibold">Asiento</dt>
            <dd>{selectedSeatLabel ?? "Sin seleccionar"}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
