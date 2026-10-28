import { useState } from "react";

import { Input } from "../../../components/atoms/Input/Input";
import { ConfirmationDialog } from "../../../components/organisms/ConfirmationDialog/ConfirmationDialog";

import { TicketCard } from "../components/molecules/TicketCard";
import type { TicketCardProps } from "../components/molecules/TicketCard";

export type TicketItem = Omit<
  TicketCardProps,
  "onViewQr" | "onCancel" | "onViewDetails"
> & {
  id: string;
};

export interface MyTicketsPageProps {
  tickets: TicketItem[];
  onCancelTicket: (ticketId: string) => Promise<void>;
  onViewQr?: (ticketId: string) => void;
}

export function MyTicketsPage({
                                tickets,
                                onCancelTicket,
                                onViewQr,
                              }: MyTicketsPageProps) {
  const [search, setSearch] = useState("");
  const [selectedTicketId, setSelectedTicketId] =
    useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTicket = tickets.find(
    (ticket) => ticket.id === selectedTicketId,
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("es");

  const filteredTickets = tickets.filter((ticket) => {
    const searchableText = [
      ticket.eventName,
      ticket.subEventName ?? "",
      ticket.venue,
    ]
      .join(" ")
      .toLocaleLowerCase("es");

    return searchableText.includes(normalizedSearch);
  });

  const handleCancelClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setError(null);
  };

  const handleConfirmCancel = async () => {
    if (
      !selectedTicket ||
      selectedTicket.status !== "active" ||
      isCancelling
    ) {
      return;
    }

    setIsCancelling(true);
    setError(null);

    try {
      await onCancelTicket(selectedTicket.id);
      setSelectedTicketId(null);
    } catch {
      setError(
        "No fue posible cancelar la asistencia. Inténtalo nuevamente.",
      );
      setSelectedTicketId(null);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-merriweather text-3xl font-bold">
          Mis Boletos
        </h1>

        <div className="w-full max-w-sm space-y-2">
          <label
            htmlFor="ticket-search"
            className="block text-sm font-semibold"
          >
            Buscar evento
          </label>

          <Input
            id="ticket-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar evento o recinto..."
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-eventos-error">
          {error}
        </p>
      )}

      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              eventName={ticket.eventName}
              subEventName={ticket.subEventName}
              date={ticket.date}
              startTime={ticket.startTime}
              endTime={ticket.endTime}
              venue={ticket.venue}
              status={ticket.status}
              visibility={ticket.visibility}
              posterUrl={ticket.posterUrl}
              onViewQr={
                ticket.status === "active" && onViewQr
                  ? () => onViewQr(ticket.id)
                  : undefined
              }
              onCancel={
                ticket.status === "active"
                  ? () => handleCancelClick(ticket.id)
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-eventos-neutral p-10 text-center">
          <p className="font-semibold">
            {tickets.length === 0
              ? "Todavía no tienes boletos."
              : "No se encontraron boletos."}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            {tickets.length === 0
              ? "Cuando reserves un lugar, podrás consultar aquí tu boleto."
              : "Prueba con otro nombre de evento o recinto."}
          </p>
        </div>
      )}

      <ConfirmationDialog
        isOpen={Boolean(selectedTicket)}
        title="Cancelar asistencia"
        description={`¿Estás seguro de que deseas cancelar tu asistencia al evento ${selectedTicket?.eventName ?? ""}?`}
        confirmText="Confirmar cancelación"
        cancelText="Volver"
        variant="danger"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setSelectedTicketId(null)}
      />
    </section>
  );
}

export default MyTicketsPage;