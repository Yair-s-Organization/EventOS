
import type { SeatStatus } from "../atoms/Seat";

interface LegendItem {
    status: SeatStatus;
    label: string;
    color: string;
}

const legendItems: LegendItem[] = [
    {
        status: "available",
        label: "Disponible",
        color: "bg-eventos-secondary-light",
    },
    {
        status: "occupied",
        label: "Ocupado",
        color: "bg-secondary",
    },
    {
        status: "selected",
        label: "Seleccionado",
        color: "bg-eventos-primary",
    },
];

export function SeatLegend() {
    return (
      <div
        aria-label="Leyenda de asientos"
        className="flex flex-wrap items-center gap-x-5 gap-y-3"
      >
          {legendItems.map((item) => (
            <div
              key={item.status}
              className="flex items-center gap-2"
            >
          <span
            aria-hidden="true"
            className={`h-5 w-5 rounded-full ${item.color}`}
          />

                <span className="font-merriweather text-sm">
            {item.label}
          </span>
            </div>
          ))}
      </div>
    );
}

export default SeatLegend;
