import { Badge } from "../../atoms/Badge/Badge";
import { Button } from "../../atoms/Button/Button";
import { useNavigate } from "react-router";
import { AlcanceEvento } from "@eventos/shared";
import type { MisEventosItem } from "@eventos/shared";
import { EstadoEvento } from "@eventos/shared";
import {
  formatearFechaDdMmAaaa,
  formatearHorarioRango,
} from "../../../utils/fechaHorario";

export function CardMenuPrincipal({
  nombre,
  posterUrl,
  idAlcance,
  idEvento,
  idEstadoEvento,
  subeventos,
}: MisEventosItem) {
  const estiloTexto = "font-merriweather text-base";
  const navigate = useNavigate();
  const primerSubevento = subeventos?.[0];
  const ultimoSubevento = subeventos?.[subeventos.length - 1];
  const tieneUnSubevento = subeventos?.length === 1;
  const espacios = [
    ...new Set(
      (subeventos ?? [])
        .map((sub) => sub.nombreRecinto)
        .filter((recinto): recinto is string => Boolean(recinto)),
    ),
  ];


  return (
    <article
      id="contenedorTarjeta"
      className="flex h-full min-h-[30rem] w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div id="contenedorPoster" className="px-4 pt-4">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={nombre}
            className="aspect-video w-full rounded-lg bg-gray-100 object-cover"
          />
        ) : (
          <div
            className="flex aspect-video items-center justify-center rounded-lg bg-gray-100 px-4 text-center text-sm text-gray-500"
            role="img"
            aria-label={`No hay póster para ${nombre}`}>
            Sin póster disponible
          </div>
        )}
      </div>
      <div id="contenedorDatosCard" className="flex flex-1 flex-col gap-4 p-4">
        <div id="contenedorBadges" className="flex flex-wrap justify-between gap-2">
          <Badge variant="primary">
            {idAlcance !== undefined ? AlcanceEvento[idAlcance] : "Sin alcance"}
          </Badge>
          <Badge
            variant={
              idEstadoEvento == 1
                ? "error"
                : idEstadoEvento == 2
                  ? "success"
                  : idEstadoEvento === 3
                    ? "warning"
                    : idEstadoEvento === 4
                      ? "primary"
                      : "error"
            }>
            {idEstadoEvento == 3 ? "PENDIENTE" : idEstadoEvento !== undefined && EstadoEvento[idEstadoEvento]}
          </Badge>
        </div>
        <div id="contenedorTexto" className="space-y-2">
          <h2 className="break-words font-merriweather text-xl font-semibold sm:text-2xl">
            {nombre}
          </h2>
          {tieneUnSubevento || primerSubevento?.fecha === ultimoSubevento?.fecha ? (
            <p className={estiloTexto}>
              <strong>Fecha:</strong>{" "}
              {formatearFechaDdMmAaaa(primerSubevento?.fecha, "Fecha no disponible")}
            </p>
          ) : (
            <>
              <p className={estiloTexto}>
                <strong>Fecha inicio:</strong>{" "}
                {formatearFechaDdMmAaaa(primerSubevento?.fecha, "Fecha no disponible")}
              </p>
              <p className={estiloTexto}>
                <strong>Fecha fin:</strong>{" "}
                {formatearFechaDdMmAaaa(ultimoSubevento?.fecha, "Fecha no disponible")}
              </p>
            </>
          )}
          {tieneUnSubevento && (
            <p className={estiloTexto}>
              <strong>Horario:</strong>{" "}
              {formatearHorarioRango(
                primerSubevento?.horaInicio,
                primerSubevento?.horaFin,
                "Hora no disponible",
              )}
            </p>
          )}
          <p className={estiloTexto}>
            <strong>{espacios.length > 1 ? "Espacios:" : "Espacio:"}</strong>{" "}
            {espacios.length > 0 ? espacios.join(", ") : "Recinto no disponible"}
          </p>
        </div>
      </div>
      <div id="contenedorBoton" className="mt-auto flex justify-end px-4 pb-4">
        <Button
          text="Ver detalles"
          variant="primary"
          type="button"
          onClick={() => {
            tieneUnSubevento
              ? navigate(`/organizador/administrar-evento/${idEvento}`)
              : navigate(`/organizador/administrar-evento-subeventos/${idEvento}`)
          }}
        />
      </div>
    </article>
  );
}
