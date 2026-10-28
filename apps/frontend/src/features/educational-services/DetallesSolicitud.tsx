import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { AlcanceEvento } from "@eventos/shared";
import Button from "../../components/atoms/Button/Button";
import { CardSubevento } from "../../components/organisms/SolicitudEventos/CardSubevento";
import { SeccionDatosPrellenados } from "../../components/organisms/DetallesSolicitud/SeccionDatosPrellenados";
import type { SubeventoFormData } from "../events/SolicitudEventos";
import { Modal } from "../../components/molecules/Modal";

export interface DatosPrellenados {
  nombreSolicitante: string;
  idAlcance: string;
  descripcion: string;
  nombre: string;
  justificacion: string;
  subEventos: SubeventoDetalle[];
}

interface SubeventoDetalle extends SubeventoFormData {
  nombreRecinto?: string;
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function obtenerTexto(
  registro: Record<string, unknown>,
  campo: string,
): string {
  const valor = registro[campo];
  if (typeof valor !== "string") {
    throw new Error(
      `La respuesta no contiene un texto válido para "${campo}".`,
    );
  }
  return valor;
}

function obtenerNumero(
  registro: Record<string, unknown>,
  campo: string,
): number {
  const valor = registro[campo];
  if (typeof valor !== "number") {
    throw new Error(
      `La respuesta no contiene un número válido para "${campo}".`,
    );
  }
  return valor;
}

function obtenerHora(registro: Record<string, unknown>, campo: string): string {
  const valor = obtenerTexto(registro, campo);
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?$/.test(valor)) {
    throw new Error(
      `La respuesta no contiene una hora válida para "${campo}".`,
    );
  }
  return valor.slice(0, 5);
}

function convertirAlcance(idAlcance: number): string {
  const alcancesValidos = [
    AlcanceEvento.PUBLICO,
    AlcanceEvento.INTERNO,
    AlcanceEvento.PRIVADO,
  ];
  if (!alcancesValidos.includes(idAlcance)) {
    throw new Error(`Alcance desconocido: ${idAlcance}.`);
  }
  return String(idAlcance);
}

function convertirSubevento(valor: unknown): SubeventoDetalle {
  if (!esRegistro(valor)) {
    throw new Error("La respuesta contiene un subevento inválido.");
  }

  const fecha = valor.fecha;
  if (!esRegistro(fecha)) {
    throw new Error("La respuesta contiene un subevento sin fecha.");
  }

  if (typeof valor.accesoQR !== "boolean") {
    throw new Error("La respuesta contiene un acceso QR inválido.");
  }

  const espacio = valor.espacio;
  const nombreRecinto =
    esRegistro(espacio) && typeof espacio.nombre === "string"
      ? espacio.nombre
      : undefined;

  return {
    id: obtenerNumero(valor, "idSubEvento"),
    nombre: typeof valor.nombre === "string" ? valor.nombre : "",
    descripcion: obtenerTexto(valor, "descripcion"),
    idRecinto: obtenerNumero(valor, "idRecinto"),
    nombreRecinto,
    accesoQR: valor.accesoQR,
    fecha: obtenerTexto(fecha, "fecha"),
    horaInicio: obtenerHora(fecha, "horaInicio"),
    horaFin: obtenerHora(fecha, "horaFin"),
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
    idAlcance: convertirAlcance(obtenerNumero(valor, "idAlcance")),
    descripcion: obtenerTexto(valor, "descripcion"),
    nombre: obtenerTexto(valor, "nombre"),
    justificacion: obtenerTexto(valor, "justificacion"),
    subEventos: valor.subeventos.map(convertirSubevento),
  };
}

export function DetallesSolicitud() {
  const { id } = useParams();
  const [datos, setDatos] = useState<DatosPrellenados | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accion, setAccion] = useState<"aprobar" | "rechazar" | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

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
  if (!datos)
    return <p role="alert">No se recibió información de la solicitud.</p>;

  const confirmarAccion = async () => {
    if (!id || !accion) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorAccion("No hay sesión iniciada.");
      return;
    }

    setErrorAccion(null);

    try {
      const response = await fetch(
        `http://localhost:3000/api/solicitudes/${id}/${accion}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`La acción falló (HTTP ${response.status}).`);
      }

      setAccion(null);
    } catch (error) {
      setErrorAccion(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la solicitud.",
      );
    }
  };

  return (
    <section className="mx-[clamp(1rem,8vw,6rem)] space-y-6 px-4">
      <h1 className="font-merriweather text-[36px] font-bold">
        Detalles del evento
      </h1>
      <SeccionDatosPrellenados datos={datos} />
      <div className="col-span-full mt-8 space-y-4">
        {datos.subEventos.map((subevento, index) => (
          <div key={subevento.id}>
            <CardSubevento
              subevento={subevento}
              index={index}
              nombreRecinto={subevento.nombreRecinto}
              readOnly
            />
          </div>
        ))}
      </div>
      <div id="botonesSolicitud" className="flex justify-start gap-3">
        <Button
          id="botonRechazar"
          type="button"
          text="Rechazar"
          variant="danger"
          onClick={() => {
            setErrorAccion(null);
            setAccion("rechazar");
          }}
        />
        <Button
          id="botonAprobar"
          type="button"
          text="Aprobar"
          variant="success"
          onClick={() => {
            setErrorAccion(null);
            setAccion("aprobar");
          }}
        />
      </div>
      {accion && (
        <Modal
          titulo="Atención"
          contenido={
            accion === "aprobar"
              ? "¿Desea aprobar el evento?"
              : "¿Desea rechazar el evento?"
          }
          mostrarModal
          cerrarModal={() => {
            setAccion(null);
            setErrorAccion(null);
          }}>
          {errorAccion && <p role="alert">{errorAccion}</p>}
          <div className="flex justify-end gap-3">
            <Button
              text="Cancelar"
              type="button"
              variant="danger"
              onClick={() => {
                setAccion(null);
                setErrorAccion(null);
              }}
            />
            <Button
              text="Aceptar"
              type="button"
              variant="success"
              onClick={confirmarAccion}
            />
          </div>
        </Modal>
      )}
    </section>
  );
}
