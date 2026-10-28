import { Badge } from "../../atoms/Badge/Badge";
import { Button } from "../../atoms/Button/Button";
import { Link, useNavigate } from "react-router";


import { AlcanceEvento } from "@eventos/shared";
import type { Evento, Fecha, Recinto } from "@eventos/shared";

type CardMenuPrincipalProps = {
  evento: Pick<Evento, "nombre" | "idAlcance" | "idEvento"> & {
    posterUrl: string | null;
  };
  fecha: Pick<Fecha, "fecha" | "horaInicio" | "horaFin"> | null;
  recinto: Pick<Recinto, "nombre"> | null;
};

export function CardMenuPrincipal({
  evento,
  fecha,
  recinto,
}: CardMenuPrincipalProps) {
  const estiloTexto = "font-merriweather font-medium text-[20px]";
  const navigate = useNavigate();

  return (
    <div
      id="contenedorTarjeta"
      className="border border-secondary h-[600px] w-[400px] space-y-4 rounded-md">
      <div id="contenedorPoster" className="px-5 pt-7">
        {evento.posterUrl ? (
          <img src={evento.posterUrl} alt={evento.nombre} className="rounded-md"/>
        ) : (
          <div
            className="flex min-h-40 items-center justify-center bg-gray-100 text-gray-500"
            role="img"
            aria-label={`No hay póster para ${evento.nombre}`}>
            Sin póster disponible
          </div>
        )}
      </div>
      <div id="datos inferiores" className="px-[24px] space-y-1">
        <Badge variant="primary">
          {evento.idAlcance !== undefined
            ? AlcanceEvento[evento.idAlcance]
            : "Sin alcance"}
        </Badge>
        <h2 className="font-merriweather text-[24px] font-semibold">
          {evento.nombre}
        </h2>
        <p className={estiloTexto}>Fecha: {fecha?.fecha ?? "Fecha no disponible"}</p>
        <p className={estiloTexto}>
          Hora inicio: {fecha?.horaInicio ?? "Hora no disponible"}
        </p>
        <p className={estiloTexto}>Hora fin: {fecha?.horaFin ?? "Hora no disponible"}</p>
        <p className={estiloTexto}>
          Espacio: {recinto?.nombre ?? "Recinto no disponible"}
        </p>
      </div>
      <div id="contenedorBoton" className="flex justify-end px-5">
        <Button text="Ver detalles" variant="primary" type="button" onClick={() => navigate(`/detalles-solicitud/${evento.idEvento}`)}></Button>
      </div>
    </div>
  );
}
