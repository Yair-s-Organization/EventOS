export type SeatStatus = "available" | "occupied" | "selected";

export interface SeatProps {
  idAsiento: number;
  label: string;
  status: SeatStatus;
  onSelect: (idAsiento: number) => void;
}

const statusStyles: Record<SeatStatus, string> = {
  available:
    "bg-eventos-success text-white hover:brightness-90",
  occupied:
    "bg-eventos-error text-white",
  selected:
    "bg-eventos-primary text-white ring-2 ring-eventos-primary ring-offset-2",
};

const statusLabels: Record<SeatStatus, string> = {
  available: "disponible",
  occupied: "ocupado",
  selected: "seleccionado",
};

export function Seat({
                       idAsiento,
                       label,
                       status,
                       onSelect,
                     }: SeatProps) {
  const isOccupied = status === "occupied";

  return (
    <button
      type="button"
      disabled={isOccupied}
      aria-pressed={status === "selected"}
      aria-label={`Asiento ${label}, ${statusLabels[status]}`}
      onClick={() => onSelect(idAsiento)}
      className={`
        inline-flex h-10 w-10 shrink-0
        items-center justify-center
        rounded-md font-merriweather
        text-sm font-semibold
        transition-colors
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-eventos-primary
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        ${statusStyles[status]}
      `}
    >
      {label}
    </button>
  );
}

export default Seat;
