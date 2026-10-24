import type { SeatStatus } from "../atoms/Seat";

interface LegendItem {
    status: SeatStatus;
    label: string;
    colorClass: string;
}

const legendItems: LegendItem[] = [
    {
        status: "available",
        label: "Disponible",
        colorClass: "bg-eventos-success",
    },
    {
        status: "occupied",
        label: "Ocupado",
        colorClass: "bg-eventos-error",
    },
    {
        status: "selected",
        label: "Seleccionado",
        colorClass: "bg-eventos-primary",
    },
];

export function SeatLegend() {
    return (
      <div
        role="group"
        aria-label="Estados de los asientos"
        className="flex flex-wrap items-center gap-x-5 gap-y-2"
      >
          {legendItems.map((item) => (
            <div
              key={item.status}
              className="inline-flex items-center gap-2"
            >
          <span
            aria-hidden="true"
            className={`h-3 w-3 rounded-sm ${item.colorClass}`}
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