
import { Seat } from "../atoms/Seat";
import { SeatLegend } from "../molecules/SeatLegend";

export interface SeatMapItem {
  idAsiento: number;
  fila: string;
  numero: number;
  occupied: boolean;
}

export interface SeatMapProps {
  seats: SeatMapItem[];
  selectedSeatId: number | null;
  onSelect: (idAsiento: number) => void;
  aisleAfter?: number[];
  venueName?: string;
}

export function SeatMap({
                          seats,
                          selectedSeatId,
                          onSelect,
                          aisleAfter = [],
                          venueName,
                        }: SeatMapProps) {
  const rows = [...new Set(seats.map((seat) => seat.fila))]
    .sort((a, b) => b.localeCompare(a, "es", { numeric: true }));

  const selectedSeat = seats.find(
    (seat) =>
      seat.idAsiento === selectedSeatId &&
      !seat.occupied,
  );

  const selectedSeatLabel = selectedSeat
    ? `${selectedSeat.fila}${selectedSeat.numero}`
    : null;

  if (seats.length === 0) {
    return (
      <section aria-label="Mapa de asientos">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-merriweather text-xl font-bold">
              Selecciona tu asiento
            </h2>

            <p className="text-sm text-gray-600">
              Selecciona uno de los lugares disponibles.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm">
              <span className="font-semibold">
                Asiento seleccionado:
              </span>{" "}
              {selectedSeatLabel ?? "Ninguno"}
            </p>

            <SeatLegend />
          </div>
        </div>
      </section>
    );
  }

  const seatNumbers = seats.map((seat) => seat.numero);
  const minNumber = Math.min(...seatNumbers);
  const maxNumber = Math.max(...seatNumbers);

  // Include empty positions to preserve the auditorium layout.
  const columns = Array.from(
    { length: maxNumber - minNumber + 1 },
    (_, index) => minNumber + index,
  );

  // Divide columns into groups separated by aisles.
  const columnGroups: number[][] = [[]];

  for (const column of columns) {
    columnGroups[columnGroups.length - 1].push(column);

    if (aisleAfter.includes(column) && column !== maxNumber) {
      columnGroups.push([]);
    }
  }

  const seatsByPosition = new Map<string, SeatMapItem>();

  for (const seat of seats) {
    seatsByPosition.set(`${seat.fila}-${seat.numero}`, seat);
  }

  return (
    <section aria-label="Mapa de asientos" className="space-y-5">
      <h2 className="font-merriweather text-xl font-bold">
        Selecciona tu asiento
      </h2>

      <p className="text-sm text-gray-600">
        Selecciona uno de los lugares disponibles.
      </p>

      <div className="overflow-x-auto pb-3">
        <div className="w-max space-y-4">
          {venueName && (
            <h3 className="text-center font-merriweather font-semibold">
              {venueName}
            </h3>
          )}

          <div className="rounded-lg border border-gray-300 p-4">
            {/* Column numbers */}
            <div className="mb-3 ml-10 flex gap-7">
              {columnGroups.map((group, index) => (
                <div key={index} className="flex gap-1">
                  {group.map((number) => (
                    <span
                      key={number}
                      className="flex h-5 w-7 items-center justify-center text-xs"
                    >
                      {number}
                    </span>
                  ))}
                </div>
              ))}
            </div>

            {/* Seat rows */}
            <div className="space-y-1">
              {rows.map((row) => (
                <div
                  key={row}
                  role="group"
                  aria-label={`Fila ${row}`}
                  className="flex items-center gap-3"
                >
                  <span className="w-7 shrink-0 text-right font-semibold">
                    {row}
                  </span>

                  <div className="flex gap-7">
                    {columnGroups.map((group, index) => (
                      <div key={index} className="flex gap-1">
                        {group.map((number) => {
                          const seat = seatsByPosition.get(
                            `${row}-${number}`,
                          );

                          if (!seat) {
                            return (
                              <span
                                key={number}
                                aria-hidden="true"
                                className="inline-block h-7 w-7"
                              />
                            );
                          }

                          return (
                            <Seat
                              key={seat.idAsiento}
                              idAsiento={seat.idAsiento}
                              label={`${seat.fila}${seat.numero}`}
                              status={
                                seat.occupied
                                  ? "occupied"
                                  : selectedSeatId === seat.idAsiento
                                    ? "selected"
                                    : "available"
                              }
                              onSelect={onSelect}
                              compact
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md bg-eventos-secondary-light py-4 text-center font-merriweather font-semibold">
            Escenario
          </div>
        </div>
      </div>
    </section>
  );
}

export default SeatMap;
