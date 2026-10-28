import { apiRequest } from "../../../lib/apiClient";
import type { EstadoBoleto } from "@eventos/shared";

export interface TicketSummaryResponse {
  idSubEvento: number;
  idBoleto: number;
  estadoBoleto: EstadoBoleto;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export interface TicketDetailResponse {
  idBoleto: number;
  estadoBoleto: EstadoBoleto;
  qr: string | null;

  asiento: {
    fila: string;
    numero: number;
  } | null;

  subEvento: {
    idSubEvento: number;
    idEvento: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
  };

  recinto: {
    idRecinto: number;
    nombre: string;
  };
}

export interface CancelTicketResponse {
  mensaje: string;
  boleto: {
    idBoleto: number;
    idEstadoBoleto: EstadoBoleto;
    idAsiento: number | null;
  };
}

export const ticketsService = {
  getMyTickets(): Promise<TicketSummaryResponse[]> {
    return apiRequest<TicketSummaryResponse[]>(
      "reservations/mis-boletos",
    );
  },

  getTicketDetail(
    idBoleto: number,
  ): Promise<TicketDetailResponse> {
    return apiRequest<TicketDetailResponse>(
      `reservations/mis-boletos/${idBoleto}`,
    );
  },

  cancelTicket(
    idBoleto: number,
  ): Promise<CancelTicketResponse> {
    return apiRequest<CancelTicketResponse>(
      `reservations/${idBoleto}/cancelar`,
      {
        method: "PATCH",
      },
    );
  },
};