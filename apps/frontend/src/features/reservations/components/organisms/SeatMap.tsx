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
}

export function SeatMap({
                            seats,
                            selectedSeatId,
                            onSelect,
                        }: SeatMapProps) {
    const rows = Array.from(
      new Set(seats.map((seat) => seat.fila))
    ).sort((a, b) =>
      a.localeCompare(b, "es", { numeric: true })
    );

    return (
      <section
        aria-label="Mapa de asientos"
        className="space-y-6"
      >
          <h2 className="font-merriweather text-xl font-bold">
              Selecciona tu asiento
          </h2>

          {seats.length === 0 ? (
            <p className="text-sm text-gray-600">
                No hay asientos para mostrar.
            </p>
          ) : (
            <>
                <div className="space-y-4">
                    {rows.map((row) => (
                      <div
                        key={row}
                        className="flex items-center gap-4"
                      >
                <span className="w-6 shrink-0 font-semibold">
                  {row}
                </span>
                          <div className="flex flex-wrap gap-2">
                              {seats
                                .filter((seat) => seat.fila === row)
                                .sort((a, b) => a.numero - b.numero)
                                .map((seat) => (
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
                                  />
                                ))}
                          </div>
                      </div>
                    ))}
                </div>

                <SeatLegend />
            </>
          )}
      </section>
    );
}

export default SeatMap;
