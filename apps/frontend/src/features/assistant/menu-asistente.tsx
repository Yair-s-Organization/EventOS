import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { CatalogEventCard } from "../event-catalog/components/CatalogEventCard";
import { useEventCatalog } from "../event-catalog/hooks/useEventCatalog";
import { TicketCard } from "../tickets/components/molecules/TicketCard";
import { EstadoSubEvento } from "@eventos/shared";
import { useMyTickets } from "../tickets/hooks/useMyTickets";
import { ticketsService } from "../tickets/services/tickets.service";
import { mapTicketToCard } from "../tickets/utils/mapTicketToCard";
import { ConfirmationDialog } from "../../components/organisms/ConfirmationDialog/ConfirmationDialog";
import { ApiError } from "../../lib/apiClient";
import { PageContainer } from "../../components/templates/PageContainer";

export function MenuAsistente() {
  const navigate = useNavigate();
  const { events, status, error, retry, failedCount } = useEventCatalog();
  const agenda = useMyTickets();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [clockNow, setClockNow] = useState(() => Date.now());

  useEffect(() => {
    const updateClock = () => {
      setClockNow(Date.now());
    };

    const intervalId = window.setInterval(updateClock, 15000);

    window.addEventListener("focus", updateClock);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", updateClock);
    };
  }, []);

  const eventosProximos = useMemo(() => {
    const partes = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Mexico_City",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(clockNow));

    const obtenerParte = (tipo: string) =>
      partes.find((parte) => parte.type === tipo)?.value ?? "00";

    const fechaActual = `${obtenerParte("year")}-${obtenerParte("month")}-${obtenerParte("day")}`;
    const horaActual = `${obtenerParte("hour")}:${obtenerParte("minute")}`;

    return events
      .flatMap((evento) => {
        const actividadesVigentes = (evento.subEventos ?? [])
          .filter((actividad) => {
            if (actividad.estado === EstadoSubEvento.CANCELADO) {
              return false;
            }

            const fecha = actividad.fecha?.fecha?.slice(0, 10);
            const horaFin = actividad.fecha?.horaFin?.slice(0, 5);

            if (!fecha || !horaFin) {
              return false;
            }

            return (
              fecha > fechaActual ||
              (fecha === fechaActual && horaFin > horaActual)
            );
          })
          .map((actividad) => ({
            actividad,
            orden: `${actividad.fecha?.fecha?.slice(0, 10) ?? ""}T${actividad.fecha?.horaInicio?.slice(0, 5) ?? ""}`,
          }))
          .sort((primera, segunda) =>
            primera.orden.localeCompare(segunda.orden),
          );

        if (actividadesVigentes.length === 0) {
          return [];
        }

        return [
          {
            evento: {
              ...evento,
              subEventos: actividadesVigentes.map(
                ({ actividad }) => actividad,
              ),
            },
            siguienteActividad: actividadesVigentes[0].orden,
          },
        ];
      })
      .sort(
        (primero, segundo) =>
          primero.siguienteActividad.localeCompare(
            segundo.siguienteActividad,
          ) || primero.evento.idEvento - segundo.evento.idEvento,
      )
      .slice(0, 3)
      .map(({ evento }) => evento);
  }, [events, clockNow]);

  const agendaItems = useMemo(() => {
    const partes = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Mexico_City",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(clockNow));

    const obtenerParte = (tipo: string) =>
      partes.find((parte) => parte.type === tipo)?.value ?? "00";

    const fechaActual = `${obtenerParte("year")}-${obtenerParte("month")}-${obtenerParte("day")}`;
    const horaActual = `${obtenerParte("hour")}:${obtenerParte("minute")}`;

    return agenda.tickets
      .map(mapTicketToCard)
      .filter((ticket) => {
        if (ticket.status !== "active" || !ticket.dateIso) {
          return false;
        }

        return (
          ticket.dateIso > fechaActual ||
          (ticket.dateIso === fechaActual && ticket.endTime > horaActual)
        );
      })
      .sort(
        (primero, segundo) =>
          primero.dateIso!.localeCompare(segundo.dateIso!) ||
          primero.startTime.localeCompare(segundo.startTime),
      )
      .slice(0, 3);
  }, [agenda.tickets, clockNow]);

  const selectedTicket = agendaItems.find(
    (ticket) => ticket.id === selectedTicketId,
  );

  const confirmCancel = async () => {
    if (!selectedTicket || isCancelling) return;

    setIsCancelling(true);
    setCancelError(null);
    setSuccessMessage(null);

    try {
      await ticketsService.cancelTicket(Number(selectedTicket.id));
      setSelectedTicketId(null);
      setSuccessMessage("Tu asistencia se canceló correctamente.");
      agenda.refresh();
    } catch (cause: unknown) {
      setCancelError(
        cause instanceof ApiError
          ? cause.message
          : "No fue posible cancelar tu asistencia. Intenta nuevamente.",
      );
      setSelectedTicketId(null);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-10 text-eventos-body-text">
        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-eventos-ink">
              Eventos Próximos
            </h2>

            <Link
              to="/asistente/cartelera"
              className="text-sm font-semibold text-eventos-primary underline-offset-4 hover:underline"
            >
              Ver cartelera completa
            </Link>
          </div>

          {status === "loading" && (
            <p
              role="status"
              className="py-8 text-center text-eventos-muted-text"
            >
              Cargando eventos próximos...
            </p>
          )}

          {status === "error" && (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 rounded-lg border border-eventos-panel-border p-8 text-center"
            >
              <p>{error}</p>

              <button
                type="button"
                onClick={retry}
                className="rounded-md bg-eventos-primary px-4 py-2 text-sm font-semibold text-eventos-on-primary hover:bg-eventos-action-hover"
              >
                Reintentar
              </button>
            </div>
          )}


          {status === "success" && failedCount > 0 && (
            <div
              role="alert"
              className="mb-6 flex flex-col gap-3 rounded-lg border border-eventos-panel-border bg-eventos-surface p-5"
            >
              <div>
                <p className="font-semibold text-eventos-ink">
                  No se pudieron cargar todos los eventos
                </p>
                <p className="mt-2 text-sm text-eventos-muted-text">
                  {failedCount === 1
                    ? "No se pudo recuperar la información de un evento."
                    : `No se pudo recuperar la información de ${failedCount} eventos.`}{" "}
                  Puedes consultar los eventos disponibles o intentar cargar nuevamente.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-md bg-eventos-primary px-4 py-2 text-sm font-semibold text-eventos-on-primary hover:bg-eventos-action-hover"
                >
                  Reintentar carga
                </button>
              </div>
            </div>
          )}

          {status === "success" && eventosProximos.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {eventosProximos.map((evento) => (
                <CatalogEventCard
                  key={evento.idEvento}
                  event={evento}
                  headingLevel="h3"
                />
              ))}
            </div>
          )}

          {status === "success" &&
            eventosProximos.length === 0 &&
            failedCount === 0 && (
            <div className="rounded-xl border border-dashed border-eventos-panel-border bg-eventos-surface px-5 py-12 text-center">
              <p className="text-lg font-bold text-eventos-ink">
                Sin eventos próximos
              </p>

              <Link
                to="/asistente/cartelera"
                className="mt-3 inline-block text-sm font-semibold text-eventos-primary hover:underline"
              >
                Ir a la cartelera
              </Link>
            </div>
          )}
        </section>

        <section className="space-y-5 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-eventos-ink">
              Mi Agenda
            </h2>

            <Link
              to="/asistente/boletos"
              className="text-sm font-semibold text-eventos-primary underline-offset-4 hover:underline"
            >
              Ver mis boletos
            </Link>
          </div>

          {cancelError && (
            <p
              role="alert"
              className="rounded-lg border border-eventos-error p-3 text-sm text-eventos-error"
            >
              {cancelError}
            </p>
          )}

          {successMessage && (
            <p
              role="status"
              className="rounded-lg border border-eventos-success p-3 text-sm text-eventos-success"
            >
              {successMessage}
            </p>
          )}

          {agenda.status === "loading" && (
            <p
              role="status"
              className="py-8 text-center text-eventos-muted-text"
            >
              Cargando tu agenda...
            </p>
          )}

          {agenda.status === "error" && (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 rounded-lg border border-eventos-panel-border p-8 text-center"
            >
              <p>{agenda.error}</p>

              <button
                type="button"
                onClick={agenda.refresh}
                className="rounded-md bg-eventos-primary px-4 py-2 text-sm font-semibold text-eventos-on-primary hover:bg-eventos-action-hover"
              >
                Reintentar
              </button>
            </div>
          )}

          {agenda.status === "success" && agendaItems.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agendaItems.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  {...ticket}
                  onViewQr={() =>
                    navigate(`/asistente/boletos/${ticket.id}`)
                  }
                  onCancel={() => {
                    setCancelError(null);
                    setSuccessMessage(null);
                    setSelectedTicketId(ticket.id);
                  }}
                />
              ))}
            </div>
          )}

          {agenda.status === "success" && agendaItems.length === 0 && (
            <div className="rounded-xl border border-dashed border-eventos-panel-border bg-eventos-surface px-5 py-12 text-center">
              <p className="text-lg font-bold text-eventos-ink">
                Sin eventos agendados
              </p>

              <p className="mt-2 text-sm text-eventos-muted-text">
                No tienes asistencias activas próximas.
              </p>

              <Link
                to="/asistente/cartelera"
                className="mt-3 inline-block text-sm font-semibold text-eventos-primary hover:underline"
              >
                Explorar eventos
              </Link>
            </div>
          )}
        </section>

        <ConfirmationDialog
          isOpen={Boolean(selectedTicket)}
          title="Cancelar asistencia"
          description={`¿Estás seguro de que deseas cancelar tu asistencia a ${selectedTicket?.subEventName ?? selectedTicket?.eventName ?? "esta actividad"}? Esta acción liberará tu lugar.`}
          confirmText="Confirmar cancelación"
          cancelText="Volver"
          variant="danger"
          isLoading={isCancelling}
          onConfirm={() => void confirmCancel()}
          onCancel={() => {
            if (!isCancelling) setSelectedTicketId(null);
          }}
        />
      </div>
    </PageContainer>
  );
}

export default MenuAsistente;
