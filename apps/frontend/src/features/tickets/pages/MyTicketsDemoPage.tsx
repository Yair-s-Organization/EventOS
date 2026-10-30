import { useState } from "react";

import { MyTicketsPage } from "./MyTicketsPage";
import type { TicketItem } from "./MyTicketsPage";

import { DigitalTicketView } from "../components/organisms/DigitalTicketView";
import type { TicketAssignment } from "../components/organisms/DigitalTicketView";

interface DemoTicket extends TicketItem {
  attendeeName: string;
  assignment?: TicketAssignment;
}

const mockTickets: DemoTicket[] = [
  {
    id: "ticket-1",
    eventName: "Feria de Sistemas Computacionales",
    subEventName: "Taller IA",
    date: "05/11/2026",
    startTime: "17:00",
    endTime: "18:00",
    venue: "Laboratorio 1104",
    status: "active",
    visibility: "public",
    attendeeName: "Persona de prueba",
    assignment: { kind: "general" },
  },
  {
    id: "ticket-2",
    eventName: "Números Complejos",
    date: "06/11/2026",
    startTime: "10:00",
    endTime: "12:00",
    venue: "Auditorio",
    status: "active",
    visibility: "public",
    attendeeName: "Persona de prueba",
    assignment: { kind: "seat", label: "G12" },
  },
  {
    id: "ticket-3",
    eventName: "Taller de Computación",
    date: "07/11/2026",
    startTime: "10:00",
    endTime: "13:00",
    venue: "Laboratorio 1105",
    status: "active",
    visibility: "public",
    attendeeName: "Persona de prueba",
    assignment: { kind: "equipment", label: "23" },
  },
  {
    id: "ticket-4",
    eventName: "Economía Circular",
    date: "26/10/2026",
    startTime: "15:00",
    endTime: "19:00",
    venue: "Sala 14",
    status: "checked-in",
    visibility: "public",
    attendeeName: "Persona de prueba",
    assignment: { kind: "general" },
  },
];

export function MyTicketsDemoPage() {
  const [tickets, setTickets] =
    useState<DemoTicket[]>(mockTickets);

  const [selectedTicketId, setSelectedTicketId] =
    useState<string | null>(null);

  const selectedTicket = tickets.find(
    (ticket) => ticket.id === selectedTicketId,
  );

  const handleViewQr = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const handleBack = () => {
    setSelectedTicketId(null);
  };

  const handleCancelTicket = async (
    ticketId: string,
  ): Promise<void> => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 600);
    });

    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status: "cancelled" as const }
          : ticket,
      ),
    );
  };

  if (selectedTicket) {
    return (
      <div className="px-4 py-8">
        <DigitalTicketView
          eventName={selectedTicket.eventName}
          subEventName={selectedTicket.subEventName}
          date={selectedTicket.date}
          startTime={selectedTicket.startTime}
          endTime={selectedTicket.endTime}
          venue={selectedTicket.venue}
          attendeeName={selectedTicket.attendeeName}
          status={selectedTicket.status}
          assignment={selectedTicket.assignment}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <MyTicketsPage
      tickets={tickets}
      onViewQr={handleViewQr}
      onCancelTicket={handleCancelTicket}
    />
  );
}

export default MyTicketsDemoPage;