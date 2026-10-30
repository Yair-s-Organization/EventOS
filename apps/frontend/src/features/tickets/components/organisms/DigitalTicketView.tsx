import { Badge } from "../../../../components/atoms/Badge/Badge";
import { Button } from "../../../../components/atoms/Button/Button";

import { QRDisplay } from "../molecules/QRDisplay";
import type { TicketStatus } from "../molecules/TicketCard";

export type TicketAssignment =
  | { kind: "seat"; label: string }
  | { kind: "equipment"; label: string }
  | { kind: "general" };

export interface DigitalTicketViewProps {
  eventName: string;
  subEventName?: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  attendeeName: string;
  status: TicketStatus;
  assignment?: TicketAssignment;
  qrImageUrl?: string | null;
  onBack: () => void;
  onDownloadPdf?: () => void;
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
  cancelled: "error",
  expired: "neutral",
} as const;

export function DigitalTicketView({
                                    eventName,
                                    subEventName,
                                    date,
                                    startTime,
                                    endTime,
                                    venue,
                                    attendeeName,
                                    status,
                                    assignment,
                                    qrImageUrl,
                                    onBack,
                                    onDownloadPdf,
                                  }: DigitalTicketViewProps) {
  const isActive = status === "active";

  const assignmentText =
    assignment?.kind === "seat"
      ? `Asiento: ${assignment.label}`
      : assignment?.kind === "equipment"
        ? `Equipo: ${assignment.label}`
        : assignment?.kind === "general"
          ? "Acceso general"
          : null;

  const qrUnavailableMessage = isActive
    ? "El código QR de este boleto aún no está disponible."
    : "Este boleto no tiene un código QR de acceso activo.";

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-4">
        <Button
          text="Volver"
          variant="outline"
          size="sm"
          onClick={onBack}
        />

        <h1 className="font-merriweather text-3xl font-bold">
          Boleto Digital
        </h1>
      </header>

      <div className="grid grid-cols-1 items-center gap-10 rounded-xl border border-eventos-neutral bg-white p-6 md:grid-cols-2 md:p-10">
        {/* Ticket information */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-merriweather text-2xl font-bold text-secondary">
              {eventName}
            </h2>

            {subEventName && (
              <p className="font-merriweather text-lg">
                {subEventName}
              </p>
            )}

            <Badge variant={statusVariants[status]}>
              {statusLabels[status]}
            </Badge>
          </div>

          <dl className="space-y-4 text-sm">
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
              <dt className="font-semibold">Nombre</dt>
              <dd>{attendeeName}</dd>
            </div>

            <div>
              <dt className="font-semibold">Espacio del evento</dt>
              <dd>{venue}</dd>
            </div>

            {assignmentText && (
              <div>
                <dt className="font-semibold">Lugar asignado</dt>
                <dd>{assignmentText}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* QR code */}
        <QRDisplay
          imageUrl={qrImageUrl}
          isUsable={isActive}
          unavailableMessage={qrUnavailableMessage}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {isActive && onDownloadPdf && (
          <Button
            text="Descargar PDF"
            onClick={onDownloadPdf}
          />
        )}

        <Button
          text="Volver"
          variant="outline"
          onClick={onBack}
        />
      </div>
    </section>
  );
}

export default DigitalTicketView;