import { EstadoBoleto } from "@eventos/shared";

import type { TicketStatus } from "../components/molecules/TicketCard";

const statusMap: Record<EstadoBoleto, TicketStatus> = {
  [EstadoBoleto.VALIDO]: "active",
  [EstadoBoleto.UTILIZADO]: "checked-in",
  [EstadoBoleto.CANCELADO]: "cancelled",
};

export function mapTicketStatus(
  status: EstadoBoleto,
): TicketStatus {
  const mappedStatus = statusMap[status];

  if (!mappedStatus) {
    throw new Error(`Estado de boleto desconocido: ${status}`);
  }

  return mappedStatus;
}