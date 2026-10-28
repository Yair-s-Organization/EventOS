import type { DisponibilidadSubEvento } from "@eventos/shared";
import { apiRequest } from "../../../lib/apiClient";
import type { SeatMapItem } from "../components/organisms/SeatMap";

export interface CreateReservationInput {
  idSubEvento: number;
  idAsiento?: number;
}

export interface CreatedTicket {
  idBoleto: number;
  idAsiento: number | null;
  idEstadoBoleto: number;
}

export interface CreateReservationResponse {
  mensaje: string;
  boleto: CreatedTicket;
  qr?: string;
}

export const reservationsService = {
  getAvailability(
    idSubEvento: number,
    signal?: AbortSignal,
  ): Promise<DisponibilidadSubEvento> {
    return apiRequest<DisponibilidadSubEvento>(
      `reservations/disponibilidad/${idSubEvento}`,
      { signal },
    );
  },

  createReservation(
    data: CreateReservationInput,
  ): Promise<CreateReservationResponse> {
    return apiRequest<CreateReservationResponse>(
      "reservations",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },
};

export function toSeatMapItems(
  seats: DisponibilidadSubEvento["asientos"],
): SeatMapItem[] {
  return seats.map((seat) => ({
    idAsiento: seat.idAsiento,
    fila: seat.fila,
    numero: seat.numero,
    occupied: seat.ocupado,
  }));
}