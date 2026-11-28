import Button from "../../atoms/Button/Button";
import { Table } from "../Table/Table";
import { Columna } from "../Table/Table";
import { formatearFechaDdMmAaaa } from "../../../utils/fechaHorario";
import { API_BASE_URL } from "../../../lib/apiClient";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { TriangleAlert, Calendar } from "lucide-react";
import Badge from "../../../components/atoms/Badge/Badge";

type SolicitudTabla = {
  idEvento: number;
  nombre: string;
  nombreSolicitante: string;
  fechaInicio: string | null;
  fechaCierre: string | null;
  idAlcance: number;
  urgente: boolean;
  esModificacion: boolean;
};

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
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
function convertirFecha(valor: unknown): string | null {
  if (valor === null) {
    return null;
  }
  if (!esRegistro(valor)) {
    throw new Error("La respuesta contiene una fecha de subevento inválida.");
  }

  const fecha = obtenerTexto(valor, "fecha");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error("La respuesta contiene una fecha con formato inválido.");
  }
  return fecha;
}

function convertirSolicitud(valor: unknown): SolicitudTabla {
  if (!esRegistro(valor)) {
    throw new Error("La respuesta contiene una solicitud inválida.");
  }
  if (!Array.isArray(valor.subEventos)) {
    throw new Error("La respuesta no contiene una lista válida de subeventos.");
  }

  const fechas = valor.subEventos
    .map((subevento: unknown) => {
      if (!esRegistro(subevento)) {
        throw new Error("La respuesta contiene un subevento inválido.");
      }
      return convertirFecha(subevento.fecha);
    })
    .filter((fecha: string | null): fecha is string => fecha !== null)
    .sort();

  const solicitante = valor.solicitante;
  let nombreSolicitante = "No disponible";

  if (solicitante !== null && solicitante !== undefined) {
    if (!esRegistro(solicitante)) {
      throw new Error("La respuesta contiene datos de solicitante inválidos.");
    }
    nombreSolicitante = obtenerTexto(solicitante, "nombreCompleto");
  }

  const urgente = valor.esUrgente;
  if (typeof urgente !== "boolean") {
    throw new Error(
      'La respuesta no contiene un booleano válido para "esUrgente".',
    );
  }

  const esModificacion = valor.esModificacion;
  if (typeof esModificacion !== "boolean") {
    throw new Error(
      'La respuesta no contiene un booleano válido para "esModificacion".',
    );
  }

  return {
    idEvento: obtenerNumero(valor, "idEvento"),
    nombre: obtenerTexto(valor, "nombre"),
    nombreSolicitante,
    idAlcance: obtenerNumero(valor, "idAlcance"),
    fechaInicio: fechas[0] ?? null,
    fechaCierre: fechas[fechas.length - 1] ?? null,
    urgente,
    esModificacion,
  };
}

function convertirSolicitudes(valor: unknown): SolicitudTabla[] {
  if (!Array.isArray(valor)) {
    throw new Error(
      "La respuesta del servidor no contiene una lista de solicitudes.",
    );
  }
  return valor.map(convertirSolicitud);
}

function mostrarFecha(fecha: string | null): string {
  return formatearFechaDdMmAaaa(fecha, "No disponible");
}

export function SeccionSolicitudesPendientes() {
  const [solicitudes, setSolicitudes] = useState<SolicitudTabla[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const solicitudesRecientes = [...solicitudes]
    .sort((a, b) => b.idEvento - a.idEvento)
    .slice(0, 3);

  useEffect(() => {
    const controller = new AbortController();

    const cargarSolicitudes = async () => {
      setCargando(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Debes iniciar sesión para ver las solicitudes.");
        setCargando(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/solicitudes?estado=Pendiente`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `No se pudieron cargar las solicitudes (HTTP ${response.status}).`,
          );
        }

        const respuesta: unknown = await response.json();
        setSolicitudes(convertirSolicitudes(respuesta));
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar las solicitudes.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    void cargarSolicitudes();
    return () => controller.abort();
  }, []);

  const columnas: Columna<SolicitudTabla>[] = [
    {
      id: "prioridad",
      encabezado: "Prioridad",
      className: "text-center w-[7rem]",
      render: (solicitud) => (
        <div className="min-w-[10rem] lg:min-w-[8rem] flex w-fit mx-auto justify-center">
          <Badge
            size="sm"
            variant={solicitud.urgente === true ? "error" : "success"}
            className={solicitud.urgente === false ? "px-5 !py-1" : "!py-1"}
          >
            <div className="flex gap-1">
              {solicitud.urgente == true && (
                <TriangleAlert size={16}></TriangleAlert>
              )}
              {solicitud.urgente === true ? "Urgente" : "Normal"}
            </div>
          </Badge>
        </div>
      ),
    },

    {
      id: "tipo",
      encabezado: "Tipo",
      className: "text-center w-[6rem]",
      render: (solicitud) => (
        <div className="min-w-[8rem] lg:min-w-[5rem] flex w-fit mx-auto justify-center">
          <Badge
            size="sm"
            variant={solicitud.esModificacion === true ? "warning" : "primary"}
            className={
              solicitud.esModificacion === false ? "px-5 !py-1" : "!py-1"
            }
          >
            <div className="flex gap-1">
              {solicitud.esModificacion === true ? "Modificación" : "Solicitud"}
            </div>
          </Badge>
        </div>
      ),
    },

    {
      id: "alcance",
      encabezado: "Alcance",
      className: "text-center",
      render: (solicitud) => (
        <div className="min-w-[10rem] lg:min-w-[8rem] flex w-fit mx-auto justify-center">
          <Badge
            variant={
              solicitud.idAlcance === 1
                ? "scope-public"
                : solicitud.idAlcance === 2
                  ? "scope-internal"
                  : "scope-private"
            }
            className="!py-1"
          >
            <div className="flex gap-1 !mx-3">
              {solicitud.idAlcance === 1
                ? "Público"
                : solicitud.idAlcance === 2
                  ? "Interno"
                  : "Privado"}
            </div>
          </Badge>
        </div>
      ),
    },

    {
      id: "nombre",
      encabezado: "Nombre del evento",
      render: (solicitud) => solicitud.nombre,
      className: "min-w-[12rem] lg:min-w-[10rem] px-4 text-left",
    },
    {
      id: "nombreSolicitante",
      encabezado: "Solicitante",
      render: (solicitud) => solicitud.nombreSolicitante,
      className: "min-w-[10rem] lg:min-w-[12rem] px-4 text-center sm:text-left",
    },
    {
      id: "fechaInicio",
      encabezado: "Fecha inicio",
      render: (solicitud) => mostrarFecha(solicitud.fechaInicio),
      className: "min-w-[8rem] px-3",
    },

    {
      id: "fechaFin",
      encabezado: "Fecha fin",
      render: (solicitud) => mostrarFecha(solicitud.fechaCierre),
      className: "min-w-[8rem] px-3",
    },

    {
      id: "acciones",
      encabezado: "Acciones",
      className: "whitespace-nowrap px-4 md:w-[10rem]",
      render: (solicitud) => {
        return (
          <Button
            text="Ver detalles"
            variant="primary"
            onClick={() =>
              navigate(`/detalles-solicitud/${solicitud.idEvento}`, {
                state: { from: "pendientes" },
              })
            }
          />
        );
      },
    },
  ];

  return (
    <div
      id="contenedorSeccionTabla"
      className="mx-auto w-full max-w-7xl overflow-x-auto bg-white shadow-md border border-gray-200 rounded-md"
    >
      <Table
        columnas={columnas}
        filas={solicitudesRecientes}
        obtenerClave={(solicitud) => solicitud.idEvento}
        className="table-auto min-w-full text-center [&_tbody_tr]:py-4 [&_thead_tr]:h-[80px] [&_th]:sticky [&_th]:top-0 [&_th]:bg-white [&_th]:z-10"
      />
    </div>
  );
}
