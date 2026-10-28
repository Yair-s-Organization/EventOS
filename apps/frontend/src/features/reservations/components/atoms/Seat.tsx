
export type SeatStatus = "available" | "occupied" | "selected";

export interface SeatProps {
  idAsiento: number;
  label: string;
  status: SeatStatus;
  onSelect: (idAsiento: number) => void;
  compact?: boolean;
}

const statusLabels: Record<SeatStatus, string> = {
  available: "disponible",
  occupied: "ocupado",
  selected: "seleccionado",
};

const normalStyles: Record<SeatStatus, string> = {
  available: "bg-eventos-success text-white hover:brightness-90",
  occupied: "bg-eventos-error text-white",
  selected:
    "bg-eventos-primary text-white ring-2 ring-eventos-primary ring-offset-2",
};

const compactStyles: Record<SeatStatus, string> = {
  available: "bg-eventos-secondary-light hover:brightness-95",
  occupied: "bg-secondary",
  selected:
    "bg-eventos-primary ring-2 ring-eventos-primary ring-offset-2",
};

export function Seat({
                       idAsiento,
                       label,
                       status,
                       onSelect,
                       compact = false,
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
        inline-flex shrink-0 items-center justify-center
        font-merriweather font-semibold transition-colors
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-eventos-primary
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        ${compact
        ? "h-7 w-7 rounded-full"
        : "h-10 w-10 rounded-md text-sm"}
        ${compact ? compactStyles[status] : normalStyles[status]}
      `}
    >
      {compact ? null : label}
    </button>
  );
}

export default Seat;
