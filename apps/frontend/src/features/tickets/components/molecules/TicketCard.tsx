import { Button } from "../../../../components/atoms/Button/Button";
import { Badge } from "../../../../components/atoms/Badge/Badge";

export type TicketStatus =
  | "active"
  | "checked-in"
  | "cancelled"
  | "expired";

export type TicketVisibility = "public" | "private";

export interface TicketCardProps {
  eventName: string;
  subEventName?: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  status: TicketStatus;
  visibility: TicketVisibility;
  posterUrl?: string;

  onViewQr?: () => void;
  onCancel?: () => void;
  onViewDetails?: () => void;
}

const statusLabels: Record<TicketStatus, string> = {
  active: "Activo",
  "checked-in": "Ingresado",
  cancelled: "Cancelado",
  expired: "Expirado",
};

const statusVariants = {
  active: "success",
  "checked-in": "secondary",
  cancelled: "neutral",
  expired: "neutral",
} as const;

const visibilityLabels: Record<TicketVisibility, string> = {
  public: "Público",
  private: "Privado",
};

export function TicketCard({
                             eventName,
                             subEventName,
                             date,
                             startTime,
                             endTime,
                             venue,
                             status,
                             visibility,
                             posterUrl,
                             onViewQr,
                             onCancel,
                             onViewDetails,
                           }: TicketCardProps) {
  const isActive = status === "active";

  const showActions =
    Boolean(onViewDetails) ||
    (isActive && (Boolean(onViewQr) || Boolean(onCancel)));

  return (
    <article className="flex h-full flex-col gap-4 rounded-xl border border-eventos-neutral bg-white p-4 shadow-sm">
      {/* Event poster */}
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={`Póster de ${eventName}`}
          className="aspect-video w-full rounded-md object-cover"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-md bg-eventos-neutral">
          <span className="text-sm text-gray-600">
            Póster no disponible
          </span>
        </div>
      )}

      {/* Event information */}
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={visibility === "public" ? "primary" : "secondary"}
          >
            {visibilityLabels[visibility]}
          </Badge>

          <Badge variant={statusVariants[status]}>
            {statusLabels[status]}
          </Badge>
        </div>

        <div className="space-y-1">
          <h3 className="font-merriweather text-lg font-bold">
            {eventName}
          </h3>

          {subEventName && (
            <p className="font-merriweather text-sm text-gray-700">
              {subEventName}
            </p>
          )}
        </div>

        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-semibold">Fecha</dt>
            <dd>{date}</dd>
          </div>

          <div>
            <dt className="font-semibold">Horario</dt>
            <dd>
              {startTime} - {endTime} hrs
            </dd>
          </div>

          <div>
            <dt className="font-semibold">Espacio</dt>
            <dd>{venue}</dd>
          </div>
        </dl>
      </div>

      {/* Ticket actions */}
      {showActions && (
        <div className="mt-auto flex flex-wrap gap-2 border-t border-eventos-neutral pt-4">
          {onViewDetails && (
            <Button
              text="Ver detalles"
              variant="outline"
              size="sm"
              onClick={onViewDetails}
            />
          )}

          {isActive && onViewQr && (
            <Button
              text="Ver QR"
              size="sm"
              onClick={onViewQr}
            />
          )}

          {isActive && onCancel && (
            <Button
              text="Cancelar asistencia"
              variant="danger"
              size="sm"
              onClick={onCancel}
            />
          )}
        </div>
      )}
    </article>
  );
}

export default TicketCard;