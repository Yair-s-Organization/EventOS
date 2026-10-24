import { SeccionDatosPrellenados } from "../../components/organisms/DetallesEvento/SeccionDatosPrellenados";
import { useLocation } from "react-router";
import type { DatosSubevento } from "../events/SolicitudEventos";

export interface DatosPrellenados {
  nombreSolicitante: string;
  etiquetaEvento: string;
  alcanceEvento: string;
  posterEvento: string;
  descripcion: string;
  nombreEvento: string;
  justificacion: string;
  subeventos: DatosSubevento[];
}

const datosPrellenados: DatosPrellenados = {
  nombreSolicitante: "Adriana Perez",
  etiquetaEvento: "tecnología",
  alcanceEvento: "privado",
  posterEvento: "poster-jpg",
  descripcion:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est labor mollit anim id est labor mollit anim id est laboriusidas",
  nombreEvento: "Ada Lovelace",
  justificacion: "ola",
  subeventos: [
    {
      id: 1,
      fecha: "2026-11-15",
      horaInicio: "9am",
      horaFin: "10am",
      recinto: "auditorio",
      accesoBoleto: "no",
      descripcion: "Estas es la descripcion",
    },
  ],
};

export function DetallesEvento() {
  const location = useLocation();
  const state = location.state as {
    solicitud?: Partial<DatosPrellenados>;
  } | null;
  const datos = state?.solicitud
    ? { ...datosPrellenados, ...state.solicitud }
    : datosPrellenados;

  return (
    <section>
      <SeccionDatosPrellenados datos={datos} />
    </section>
  );
}
