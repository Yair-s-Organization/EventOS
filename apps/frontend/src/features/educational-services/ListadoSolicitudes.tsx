import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { API_BASE_URL } from "../../lib/apiClient";
import { formatearFechaDdMmAaaa } from "../../utils/fechaHorario";
import { Button } from "../../components/atoms/Button/Button";
import { Table, type Columna } from "../../components/organisms/Table/Table";
import Badge from "../../components/atoms/Badge/Badge";
import { TriangleAlert, Calendar } from "lucide-react";
import { PageHeader } from "../../components/organisms/PageHeader/PageHeader";
import { SearchField } from "../../components/molecules/SearchField";
import {
  FilterDropdown,
  type FilterOption,
} from "../../components/molecules/FilterDropdown";
import { DateRangeFields } from "../../components/molecules/DateRangeFields";
import { obtenerAhoraCdmx } from "../../utils/fechaHorario";

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

const dateOptions: FilterOption[] = [
  { value: "proximos", label: "Próximos 7 días" },
  { value: "mes_actual", label: "Este mes" },
  { value: "mes_siguiente", label: "Próximo mes" },
  { value: "personalizado", label: "Rango personalizado" },
];

export type DateFilter =
  | "todas"
  | "proximos"
  | "mes_actual"
  | "mes_siguiente"
  | "personalizado";

const prioridadOptions: FilterOption[] = [
  { value: "urgente", label: "Urgente" },
  { value: "normal", label: "Normal" },
];

const tipoOptions: FilterOption[] = [
  { value: "solicitud", label: "Solicitud" },
  { value: "modificacion", label: "Modificación" },
];

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

function coincideFiltroFecha(
  fecha: string | null | undefined,
  filtro: DateFilter,
  inicioPersonalizado: string,
  finPersonalizado: string,
): boolean {
  if (filtro === "todas" || !filtro) {
    return true;
  }
  if (!fecha) {
    return false;
  }

  const fechaStr = fecha.slice(0, 10);
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  const fechaEvento = new Date(anio, mes - 1, dia);
  if (
    Number.isNaN(fechaEvento.getTime()) ||
    fechaEvento.getFullYear() !== anio ||
    fechaEvento.getMonth() !== mes - 1 ||
    fechaEvento.getDate() !== dia
  ) {
    return false;
  }

  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  if (filtro === "proximos") {
    const finProximos = new Date(inicioHoy);
    finProximos.setDate(finProximos.getDate() + 7);
    return fechaEvento >= inicioHoy && fechaEvento <= finProximos;
  }

  if (filtro === "mes_actual") {
    return (
      fechaEvento.getFullYear() === hoy.getFullYear() &&
      fechaEvento.getMonth() === hoy.getMonth()
    );
  }

  if (filtro === "mes_siguiente") {
    const siguienteMes = (hoy.getMonth() + 1) % 12;
    const anioSiguiente =
      hoy.getMonth() === 11 ? hoy.getFullYear() + 1 : hoy.getFullYear();
    return (
      fechaEvento.getFullYear() === anioSiguiente &&
      fechaEvento.getMonth() === siguienteMes
    );
  }

  if (filtro === "personalizado") {
    if (inicioPersonalizado && fechaStr < inicioPersonalizado) return false;
    if (finPersonalizado && fechaStr > finPersonalizado) return false;
    return true;
  }

  return true;
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

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX");
}

export function ListadoSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<SolicitudTabla[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  const [filtroPrioridad, setFiltroPrioridad] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroFecha, setFiltroFecha] = useState<DateFilter>("todas");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const busquedaNormalizada = normalizarTexto(busqueda.trim());
  const ahoraCdmx = obtenerAhoraCdmx();

  const solicitudesFiltradas = solicitudes.filter((solicitud) => {
    if (busquedaNormalizada) {
      const coincideBusqueda = [
        solicitud.nombre,
        solicitud.nombreSolicitante,
      ].some((texto) => normalizarTexto(texto).includes(busquedaNormalizada));
      if (!coincideBusqueda) return false;
    }
    if (filtroPrioridad === "urgente" && !solicitud.urgente) return false;
    if (filtroPrioridad === "normal" && solicitud.urgente) return false;
    if (filtroTipo === "solicitud" && solicitud.esModificacion) return false;
    if (filtroTipo === "modificacion" && !solicitud.esModificacion)
      return false;

    if (
      !coincideFiltroFecha(
        solicitud.fechaInicio ?? solicitud.fechaCierre,
        filtroFecha,
        rangeStart,
        rangeEnd,
      )
    ) {
      return false;
    }

    return true;
  });

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
      className: "text-center",
      render: (solicitud) => (
        <div className="min-w-[8rem] lg:min-w-[8rem] flex w-fit mx-auto justify-center">
          <Badge
            className="min-w-[6rem] !py-1"
            variant={solicitud.urgente === true ? "error" : "success"}
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
      className: "text-center",
      render: (solicitud) => (
        <div className="min-w-[8rem] lg:min-w-[8rem] flex w-fit mx-auto justify-center">
          <Badge
            className="min-w-[6rem] !py-1"
            variant={solicitud.esModificacion === true ? "warning" : "primary"}
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
        <div className="min-w-[8rem] lg:min-w-[8rem] flex w-fit mx-auto justify-center">
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
      className: "min-w-[12rem] lg:min-w-[10rem] px-4",
    },
    {
      id: "solicitante",
      encabezado: "Solicitante",
      render: (solicitud) => solicitud.nombreSolicitante,
      className: "min-w-[12rem] max-w-[10rem] px-4 ",
    },
    {
      id: "fechaInicio",
      encabezado: "Fecha inicio",
      render: (solicitud) => mostrarFecha(solicitud.fechaInicio),
      className: "min-w-[8rem] px-3 text-center whitespace-nowrap",
    },
    {
      id: "fechaCierre",
      encabezado: "Fecha fin",
      render: (solicitud) => mostrarFecha(solicitud.fechaCierre),
      className: "min-w-[8rem] px-3 text-center whitespace-nowrap",
    },
    {
      id: "acciones",
      encabezado: "Acciones",
      className: "px-3 whitespace-nowrap text-center",
      render: (solicitud) => (
        <Button
          text="Ver detalles"
          type="button"
          onClick={() =>
            navigate(`/detalles-solicitud/${solicitud.idEvento}`, {
              state: { from: "pendientes" },
            })
          }
        />
      ),
    },
  ];

  return (
    <section className="space-y-5">
      <div
        className={
          filtroFecha === "personalizado"
            ? "mb-4 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between"
            : "mb-6 flex flex-col gap-6 lg:mb-8 xl:flex-row xl:items-start xl:justify-between"
        }
      >
        <div className="min-w-0 xl:max-w-sm xl:shrink-0">
          <PageHeader
            title="Solicitudes pendientes"
            description="Consulta y administra las solicitudes pendientes"
          />
        </div>

        <div className="w-full min-w-0 space-y-3 xl:max-w-5xl">
          <SearchField
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por nombre del evento o por solicitante"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="min-w-0">
              <FilterDropdown
                label="Prioridad"
                allLabel="Todas las prioridades"
                value={filtroPrioridad}
                options={prioridadOptions}
                onChange={setFiltroPrioridad}
              />
            </div>
            <div className="min-w-0">
              <FilterDropdown
                label="Tipo"
                allLabel="Todos los tipos"
                value={filtroTipo}
                options={tipoOptions}
                onChange={setFiltroTipo}
              />
            </div>
            <div className="min-w-0">
              <FilterDropdown
                label="Fecha"
                allLabel="Todas las fechas"
                allValue="todas"
                value={filtroFecha}
                options={dateOptions}
                onChange={(value) => setFiltroFecha(value as DateFilter)}
              />
            </div>
          </div>
        </div>
      </div>

      {filtroFecha === "personalizado" && (
        <DateRangeFields
          startDate={rangeStart}
          endDate={rangeEnd}
          onStartDateChange={setRangeStart}
          onEndDateChange={setRangeEnd}
          className="mb-3"
        />
      )}
      {cargando && <p role="status">Cargando solicitudes...</p>}
      {error && <p role="alert">{error}</p>}
      {!cargando && !error && solicitudes.length === 0 && (
        <div
          id="contenederIcono"
          className="flex min-h-[50vh] flex-col items-center justify-center text-center space-y-2"
        >
          <Calendar></Calendar>
          <p className="merriweather text-[24px] font-semibold">
            Sin solicitudes pendientes.
          </p>
          <p></p>
        </div>
      )}
      {!cargando &&
        !error &&
        solicitudes.length > 0 &&
        solicitudesFiltradas.length === 0 && (
          <div
            id="contenedorSinResultados"
            className="flex min-h-[30vh] flex-col items-center justify-center text-center space-y-2"
          >
            <Calendar size={40} className="text-gray-400" />
            <p className="font-merriweather text-lg font-semibold text-gray-700">
              No se encontraron cioncidencias
            </p>
          </div>
        )}

      {!cargando && !error && solicitudesFiltradas.length > 0 && (
        <div
          id="contenedorTabla"
          className="mx-auto w-full max-w-7xl overflow-x-auto max-w-[1250px] shadow-md p-5 border border-gray-200 bg-white rounded-md"
        >
          <Table
            columnas={columnas}
            filas={solicitudesFiltradas}
            obtenerClave={(solicitud) => solicitud.idEvento}
            className="table-auto w-full text-left [&_tbody_tr]:py-4 [&_thead_tr]:h-[80px]"
          />
        </div>
      )}
    </section>
  );
}
