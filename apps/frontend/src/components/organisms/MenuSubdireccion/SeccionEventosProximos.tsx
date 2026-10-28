import { useEffect, useState } from "react";
import type { Evento, Fecha, Recinto, SubEvento } from "@eventos/shared";
import { CardMenuPrincipal } from "../CardMenuPrincipal/CardMenuSubdireccion";

type EventoAprobado = Pick<Evento, "idEvento" | "nombre" | "idAlcance"> & {
  posterUrl: string | null;
  subEventos: Array<
    Pick<SubEvento, "idSubEvento"> & {
      fecha: Pick<Fecha, "fecha" | "horaInicio" | "horaFin"> | null;
      recinto: Pick<Recinto, "nombre"> | null;
    }
  >;
};

export function SeccionEventosProximos() {
  const [eventos, setEventos] = useState<EventoAprobado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const cargarEventos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Debes iniciar sesión para ver los eventos.");
        }

        const response = await fetch(
          "http://localhost:3000/api/solicitudes?estado=Aprobado",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `No se pudieron cargar los eventos (HTTP ${response.status}).`,
          );
        }

        const respuesta: unknown = await response.json();
        if (!Array.isArray(respuesta)) {
          throw new Error("La respuesta del servidor no contiene una lista de eventos.");
        }
        setEventos(respuesta as EventoAprobado[]);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : "Ocurrió un error al cargar los eventos.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    void cargarEventos();
    return () => controller.abort();
  }, []);

  return (
    <section>
      {cargando && <p role="status">Cargando eventos...</p>}
      {error && <p role="alert">{error}</p>}
      {!cargando && !error && eventos.length === 0 && (
        <p>No hay eventos aprobados próximos.</p>
      )}
      {!cargando && !error && eventos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventos.flatMap((evento) => {
            const subEventos =
              evento.subEventos.length > 0 ? evento.subEventos : [null];

            return subEventos.map((subEvento) => (
              <CardMenuPrincipal
                key={`${evento.idEvento}-${subEvento?.idSubEvento ?? "sin-subevento"}`}
                evento={evento}
                fecha={subEvento?.fecha ?? null}
                recinto={subEvento?.recinto ?? null}
              />
            ));
          })}
        </div>
      )}
    </section>
  );
}
