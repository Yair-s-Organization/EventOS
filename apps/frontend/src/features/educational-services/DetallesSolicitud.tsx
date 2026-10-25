import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { AlcanceEvento, RecintoId } from "@eventos/shared";
import Button from "../../components/atoms/Button/Button";
import { CardSubevento } from "../../components/organisms/SolicitudEventos/CardSubevento";
import { SeccionDatosPrellenados } from "../../components/organisms/DetallesSolicitud/SeccionDatosPrellenados";
import type { DatosSubevento } from "../events/SolicitudEventos";

export interface DatosPrellenados {
  nombreSolicitante: string;
  alcanceEvento: string;
  descripcion: string;
  nombreEvento: string;
  justificacion: string;
  subeventos: DatosSubevento[];
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function obtenerTexto(registro: Record<string, unknown>, campo: string): string {
  const valor = registro[campo];
  if (typeof valor !== "string") {
    throw new Error(`La respuesta del servidor no contiene un texto válido para "${campo}".`);
  }
  return valor;
}

function obtenerNumero(registro: Record<string, unknown>, campo: string): number {
  const valor = registro[campo];
  if (typeof valor !== "number") {
    throw new Error(`La respuesta del servidor no contiene un número válido para "${campo}".`);
  }
  return valor;
}

function convertirAlcance(idAlcance: number): string {
  const alcances: Record<number, string> = {
    [AlcanceEvento.PUBLICO]: "publico",
    [AlcanceEvento.INTERNO]: "interno",
    [AlcanceEvento.PRIVADO]: "privado",
  };
  const alcance = alcances[idAlcance];
  if (!alcance) {
    throw new Error(`Alcance desconocido: ${idAlcance}.`);
  }
  return alcance;
}

function convertirSubevento(valor: unknown): DatosSubevento {
  if (!esRegistro(valor)) {
    throw new Error("La respuesta contiene un subevento inválido.");
  }

  const fecha = valor.fecha;
  if (!esRegistro(fecha)) {
    throw new Error("La respuesta contiene un subevento sin fecha.");
  }

  const idRecinto = obtenerNumero(valor, "idRecinto");
  
  const recintos: Record<number, string> = {
    [RecintoId.AUDITORIO]: "auditorio",
    [RecintoId.LABORATORIO_A]: "lab1104",
    [RecintoId.LABORATORIO_B]: "lab1105",
    [RecintoId.SALA_14]: "sala14",
  };
  
  const recinto = recintos[idRecinto];
  
  if (!recinto) {
    throw new Error(`Recinto desconocido: ${idRecinto}.`);
  }

  if (typeof valor.accesoQR !== "boolean") {
    throw new Error("La respuesta contiene un acceso QR inválido.");
  }

  return {
    id: obtenerNumero(valor, "idSubEvento"),
    fecha: obtenerTexto(fecha, "fecha"),
    horaInicio: obtenerTexto(fecha, "horaInicio"),
    horaFin: obtenerTexto(fecha, "horaFin"),
    recinto,
    accesoBoleto: valor.accesoQR ? "si" : "no",
    descripcion: obtenerTexto(valor, "descripcion"),
  };
}

function convertirSolicitud(valor: unknown): DatosPrellenados {
  if (!esRegistro(valor)) {
    throw new Error("Solicitud inválida.");
  }

  const solicitante = valor.solicitante;
  let nombreSolicitante = "No disponible";

  if (solicitante !== null) {
    if (!esRegistro(solicitante)) {
      throw new Error("La respuesta contiene datos de solicitante inválidos.");
    }
    nombreSolicitante = obtenerTexto(solicitante, "nombreCompleto");
  }

  if (!Array.isArray(valor.subeventos)) {
    throw new Error("La respuesta no contiene una lista válida de subeventos.");
  }

  return {
    nombreSolicitante,
    alcanceEvento: convertirAlcance(obtenerNumero(valor, "idAlcance")),
    descripcion: obtenerTexto(valor, "descripcion"),
    nombreEvento: obtenerTexto(valor, "nombre"),
    justificacion: obtenerTexto(valor, "justificacion"),
    subeventos: valor.subeventos.map(convertirSubevento),
  };
}

export function DetallesSolicitud() {
  const { id } = useParams();
  const [datos, setDatos] = useState<DatosPrellenados | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const cargarSolicitud = async () => {
      setCargando(true);
      setError(null);
      setDatos(null);

      if (!id || !/^\d+$/.test(id) || Number(id) < 1) {
        setError("El ID de la solicitud no es válido.");
        setCargando(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Error en inicio de sesión. No se ha iniciado sesión");
        setCargando(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/api/solicitudes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `No se pudo cargar la solicitud (HTTP ${response.status}).`,
          );
        }

        const respuesta: unknown = await response.json();
        setDatos(convertirSolicitud(respuesta));
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar la solicitud.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    void cargarSolicitud();
    return () => controller.abort();
  }, [id]);

  if (cargando) return <p>Cargando solicitud...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!datos) return <p role="alert">No se recibió información de la solicitud.</p>;

  return (
    <section className="mx-[clamp(1rem,8vw,6rem)] space-y-6 px-4">
      <h1 className="font-merriweather text-[36px] font-bold">
        Detalles del evento
      </h1>
      <SeccionDatosPrellenados datos={datos} />
      <div className="col-span-full mt-8 space-y-4">
        {datos.subeventos.map((subevento, index) => (
          <div key={subevento.id}>
            <CardSubevento subevento={subevento} index={index} readOnly />
          </div>
        ))}
      </div>
      <div id="botonesSolicitud" className="space-x-9">
        <Button
          id="botonRechazar"
          type="button"
          text="Rechazar"
          variant="danger"
        />
        <Button
          id="botonAceptar"
          type="button"
          text="Aceptar"
          variant="success"
        />
      </div>
    </section>
  );
}
