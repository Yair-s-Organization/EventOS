import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ConfirmationDialog } from "../../../components/organisms/ConfirmationDialog/ConfirmationDialog";
import { ApiError } from "../../../lib/apiClient";
import { TicketCard } from "../components/molecules/TicketCard";
import { PageContainer } from "../../../components/templates/PageContainer";
import type { TicketCardProps, TicketStatus } from "../components/molecules/TicketCard";
import { PageHeader } from "../../../components/organisms/PageHeader/PageHeader";
import { SearchField } from "../../../components/molecules/SearchField";
import { FilterDropdown } from "../../../components/molecules/FilterDropdown";
import { DateRangeFields } from "../../../components/molecules/DateRangeFields";
import { ClearFiltersButton } from "../../../components/molecules/ClearFiltersButton";
import { FeedbackNotice } from "../../../components/molecules/FeedbackNotice";
import { PageState } from "../../../components/organisms/PageState/PageState";

export interface TicketItem extends Omit<TicketCardProps, "onViewQr" | "onViewDetails" | "onCancel"> {
  id: string;
  dateIso?: string;
  speakers?: string[];
}

export interface MyTicketsPageProps {
  tickets: TicketItem[];
  onCancelTicket: (ticketId: string) => Promise<void>;
  onViewQr: (ticketId: string) => void;
}

const normalize = (value: string) =>
  value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const statuses: { value: TicketStatus; label: string }[] = [
  { value: "active", label: "Activo" },
  { value: "checked-in", label: "Ingresado" },
  { value: "cancelled", label: "Cancelado" },
];

const selectStyle = "min-h-11 w-full min-w-0 rounded-lg border border-eventos-panel-border bg-eventos-surface px-3 py-2 text-sm text-eventos-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary";

export function MyTicketsPage({ tickets, onCancelTicket, onViewQr }: MyTicketsPageProps) {
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [period, setPeriod] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [venue, setVenue] = useState("");
  const [status, setStatus] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const venueOptions = useMemo(
    () => Array.from(new Set(tickets.map((ticket) => ticket.venue).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es")),
    [tickets],
  );

  const filteredTickets = useMemo(() => {
    const normalizedSearch = normalize(search.trim());
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const currentMonth = today.slice(0, 7);
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;

    return tickets.filter((ticket) => {
      const searchable = normalize([ticket.eventName, ticket.subEventName ?? ""].join(" "));
      const dateIso = ticket.dateIso ?? "";
      const matchesPeriod = period === ""
        || (period === "upcoming" && (dateIso > today || (dateIso === today && ticket.startTime >= currentTime)))
        || (period === "current-month" && dateIso.slice(0, 7) === currentMonth)
        || (period === "next-month" && dateIso.slice(0, 7) === nextMonth)
        || (period === "custom" && Boolean(dateIso) && (!rangeStart || dateIso >= rangeStart) && (!rangeEnd || dateIso <= rangeEnd));

      return (!normalizedSearch || searchable.includes(normalizedSearch))
        && matchesPeriod
        && (!venue || ticket.venue === venue)
        && (!status || ticket.status === status);
    });
  }, [tickets, search, period, rangeStart, rangeEnd, venue, status]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId);
  const hasFilters = Boolean(search || period || venue || status);

  const clearFilters = () => {
    setSearch("");
    setPeriod("");
    setRangeStart("");
    setRangeEnd("");
    setVenue("");
    setStatus("");
  };

  const confirmCancel = async () => {
    if (!selectedTicket || selectedTicket.status !== "active" || isCancelling) return;
    setIsCancelling(true);
    setCancelError(null);
    setSuccessMessage(null);
    try {
      await onCancelTicket(selectedTicket.id);
      setSelectedTicketId(null);
      setSuccessMessage("Tu asistencia se canceló correctamente.");
    } catch (cause: unknown) {
      setCancelError(cause instanceof ApiError ? cause.message : "No fue posible cancelar tu asistencia. Intenta nuevamente.");
      setSelectedTicketId(null);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="shrink-0">
            <PageHeader
              title="Mis Boletos"
              description="Consulta tus reservas y administra tu asistencia."
              back={{
                to: "/menu-asistente",
                label: "Volver al menú principal",
              }}
            />
          </div>

          <div className="w-full space-y-3 xl:max-w-5xl">
            <div className="flex gap-2">
              <SearchField
                value={search}
                onChange={setSearch}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setFiltersOpen((value) => !value)}
                aria-expanded={filtersOpen}
                aria-controls="ticket-filter-controls"
                className="shrink-0 rounded-lg border border-eventos-primary px-3 text-sm font-semibold text-eventos-primary md:hidden"
              >
                Filtros{hasFilters ? " •" : ""}
              </button>
            </div>
            <div id="ticket-filter-controls" className={`${filtersOpen ? "grid" : "hidden"} grid-cols-2 gap-2 md:grid md:grid-cols-3`}>
              <div className="min-w-0">
                <FilterDropdown
                  label="Fecha"
                  allLabel="Todas las fechas"
                  value={period}
                  options={[
                    { value: "upcoming", label: "Próximas actividades" },
                    { value: "current-month", label: "Este mes" },
                    { value: "next-month", label: "Próximo mes" },
                    { value: "custom", label: "Rango personalizado" },
                  ]}
                  onChange={setPeriod}
                />
              </div>
              <div className="min-w-0">
                <FilterDropdown
                  label="Espacio"
                  allLabel="Todos los espacios"
                  value={venue}
                  options={venueOptions.map((name) => ({
                    value: name,
                    label: name,
                  }))}
                  onChange={setVenue}
                />
              </div>
              <div className="min-w-0">
                <FilterDropdown
                  label="Estado"
                  allLabel="Todos los estados"
                  value={status}
                  options={statuses}
                  onChange={setStatus}
                />
              </div>

              {period === "custom" && (
                <DateRangeFields
                  startDate={rangeStart}
                  endDate={rangeEnd}
                  onStartDateChange={setRangeStart}
                  onEndDateChange={setRangeEnd}
                  className="col-span-2 md:col-span-3"
                />
              )}
            </div>
          </div>
        </div>

        {hasFilters && (
          <div className="flex justify-end">
            <ClearFiltersButton onClick={clearFilters} />
          </div>
        )}

        {cancelError && (
          <FeedbackNotice
            variant="error"
            title="No se pudo cancelar la asistencia"
          >
            {cancelError}
          </FeedbackNotice>
        )}

        {successMessage && (
          <FeedbackNotice variant="success">
            {successMessage}
          </FeedbackNotice>
        )}

        {filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                {...ticket}
                onViewQr={ticket.status === "active" ? () => onViewQr(ticket.id) : undefined}
                onViewDetails={ticket.status !== "active" ? () => onViewQr(ticket.id) : undefined}
                onCancel={ticket.status === "active" ? () => {
                  setCancelError(null);
                  setSuccessMessage(null);
                  setSelectedTicketId(ticket.id);
                } : undefined}
              />
            ))}
          </div>
        ) : (
          <PageState
            variant="empty"
            title={
              tickets.length === 0
                ? "No tienes boletos"
                : "No encontramos boletos con esos filtros"
            }
            description={
              tickets.length === 0
                ? "Explora la cartelera para reservar tu lugar."
                : "Modifica los filtros para consultar otros boletos."
            }
            action={
              tickets.length === 0 ? (
                <Link
                  to="/asistente/cartelera"
                  className="inline-flex cursor-pointer items-center justify-center rounded-md bg-eventos-primary px-5 py-2 text-sm font-semibold text-eventos-on-primary hover:bg-eventos-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary"
                >
                  Ver cartelera
                </Link>
              ) : undefined
            }
          />
        )}

        <ConfirmationDialog
          isOpen={Boolean(selectedTicket)}
          title="Cancelar asistencia"
          description={`¿Estás seguro de que deseas cancelar tu asistencia a ${selectedTicket?.subEventName ?? selectedTicket?.eventName ?? "esta actividad"}? Esta acción liberará tu lugar.`}
          confirmText="Confirmar cancelación"
          cancelText="Volver"
          variant="danger"
          isLoading={isCancelling}
          onConfirm={() => void confirmCancel()}
          onCancel={() => { if (!isCancelling) setSelectedTicketId(null); }}
        />
      </div>
    </PageContainer>
  );
}

export default MyTicketsPage;
