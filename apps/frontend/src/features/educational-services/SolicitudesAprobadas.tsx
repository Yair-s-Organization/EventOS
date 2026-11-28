import { useEffect, useState } from "react";
import Button from "../../components/atoms/Button/Button";
import { Table } from "../../components/organisms/Table/Table";
import type { Columna } from "../../components/organisms/Table/Table";
import { Modal } from "../../components/molecules/Modal";
import { TextArea } from "../../components/atoms/TextArea/TextArea";
import { FormField } from "../../components/molecules/FormField";
import { useNavigate } from "react-router";
import { apiRequest } from "../../lib/apiClient";
import { formatearFechaDdMmAaaa } from "../../utils/fechaHorario";
import { PageHeader } from "../../components/organisms/PageHeader/PageHeader";
import { SearchField } from "../../components/molecules/SearchField";
import {
  FilterDropdown,
  type FilterOption,
} from "../../components/molecules/FilterDropdown";
import { DateRangeFields } from "../../components/molecules/DateRangeFields";
import { obtenerAhoraCdmx } from "../../utils/fechaHorario";
import Badge from "../../components/atoms/Badge/Badge";

type SolicitudesAprobadas = {
  idEvento: number;
  nombre: string;
  nombreSolicitante: string;
  fechaInicio: string | null;
  idAlcance: number;
  fechaFin: string | null;
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

const MAX_MOTIVO = 500;

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

function convertirSolicitud(valor: unknown): SolicitudesAprobadas {
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

  return {
    idEvento: obtenerNumero(valor, "idEvento"),
    nombre: obtenerTexto(valor, "nombre"),
    nombreSolicitante,
    idAlcance: obtenerNumero(valor, "idAlcance"),
    fechaInicio: fechas[0] ?? null,
    fechaFin: fechas[fechas.length - 1] ?? null,
  };
}

function convertirSolicitudes(valor: unknown): SolicitudesAprobadas[] {
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

export function SolicitudesAprobadas() {
  const [solicitudes, setSolicitudes] = useState<SolicitudesAprobadas[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<SolicitudesAprobadas | null>(null);
  const [motivo, setMotivo] = useState("");
  const [errorCancelacion, setErrorCancelacion] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const longitudMotivo = motivo.trim().length;
  const [mostrarModalCancelacion, setMostrarModalCancelacion] = useState(false);
  const [mostrarModalConfirmacion, setModalConfirmacion] = useState(false);
  const [mostrarModalExito, setModalExito] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
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
    if (
      !coincideFiltroFecha(
        solicitud.fechaInicio ?? solicitud.fechaFin,
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
        const respuesta = await apiRequest<unknown>(
          "/solicitudes?estado=Aprobado",
          {
            signal: controller.signal,
          },
        );
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

  const cerrarModalCancelacion = () => {
    setMostrarModalCancelacion(false);
    setModalConfirmacion(false);
    setSolicitudSeleccionada(null);
    setMotivo("");
    setErrorCancelacion(null);
  };

  const abrirConfirmacionCancelacion = () => {
    if (!motivo.trim()) {
      setErrorCancelacion("El motivo de cancelación es obligatorio.");
      return;
    }

    setErrorCancelacion(null);
    setMostrarModalCancelacion(false);
    setModalConfirmacion(true);
  };

  const cerrarModalConfirmacion = () => {
    setModalConfirmacion(false);
    setMostrarModalCancelacion(true);
  };

  const confirmarCancelacion = async () => {
    if (!solicitudSeleccionada) return;

    if (!motivo.trim()) {
      setErrorCancelacion("El motivo de cancelación es obligatorio.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorCancelacion("Debes iniciar sesión para cancelar el evento.");
      return;
    }

    setCancelando(true);
    setErrorCancelacion(null);

    try {
      await apiRequest(
        `/solicitudes/${solicitudSeleccionada.idEvento}/cancelar`,
        {
          method: "PATCH",
          body: JSON.stringify({ motivo: motivo.trim() }),
        },
      );

      const idCancelado = solicitudSeleccionada.idEvento;
      setSolicitudes((actuales) =>
        actuales.filter((solicitud) => solicitud.idEvento !== idCancelado),
      );
      cerrarModalCancelacion();
      setModalExito(true);
    } catch (error) {
      setErrorCancelacion(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al cancelar el evento.",
      );
      setMostrarModalCancelacion(true);
    } finally {
      setCancelando(false);
    }
  };

  const columnas: Columna<SolicitudesAprobadas>[] = [
    {
      id: "estado",
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
      className: "min-w-[12rem] lg:min-w-[10rem] px-4 text-left",
    },
    {
      id: "nombreSolicitante",
      encabezado: "Solicitante",
      render: (solicitud) => solicitud.nombreSolicitante,
      className: "min-w-[10rem] lg:min-w-[15rem] px-4 text-center sm:text-left",
    },
    {
      id: "fechaInicio",
      encabezado: "Fecha inicio",
      render: (solicitud) => mostrarFecha(solicitud.fechaInicio),
      className: "min-w-[10rem] px-3",
    },
    {
      id: "fechaFin",
      encabezado: "Fecha Fin",
      render: (solicitud) => mostrarFecha(solicitud.fechaFin),
      className: "min-w-[10rem] px-3",
    },
    {
      id: "acciones",
      encabezado: "Acciones",
      className: "whitespace-nowrap px-4 md:w-[10rem] text-center",
      render: (solicitud) => {
        return (
          <div id="contenedorCeldaBotones">
            <Button
              text="Ver detalles"
              variant="primary"
              type="button"
              onClick={() =>
                navigate(`/detalles-solicitud/${solicitud.idEvento}`, {
                  state: { from: "aprobadas" },
                })
              }
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
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
              title="Solicitudes aprobadas"
              description="Consulta y administra las solicitudes aprobadas"
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-calendar preview-icon"
            >
              <path d="M8 2v3" />
              <path d="M16 2v3" />
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
            </svg>
            <p className="merriweather text-[24px] font-semibold">
              Sin eventos aprobados
            </p>
            <p></p>
          </div>
        )}
        {!cargando &&
          !error &&
          solicitudes.length > 0 &&
          solicitudesFiltradas.length === 0 && (
            <div
              id="contenederIcono"
              className="flex min-h-[50vh] flex-col items-center justify-center text-center space-y-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-x preview-icon"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              <p className="merriweather text-[24px] font-semibold">
                Parece que no hay coincidencias
              </p>
              <p></p>
            </div>
          )}
        {!cargando && !error && solicitudesFiltradas.length > 0 && (
          <div
            id="contenedorTabla"
            className="rounded-md mx-auto w-full max-w-7xl overflow-x-auto shadow-md p-5 border border-gray-200 bg-white"
          >
            <Table
              columnas={columnas}
              filas={solicitudesFiltradas}
              obtenerClave={(solicitud) => solicitud.idEvento}
              className="table-auto w-full text-left [&_tbody_tr]:py-4 [&_thead_tr]:h-[80px]"
            />
          </div>
        )}
        <Modal
          titulo="Cancelación de evento"
          contenido={`Evento: ${solicitudSeleccionada?.nombre ?? ""}.`}
          mostrarModal={mostrarModalCancelacion}
          cerrarModal={cerrarModalCancelacion}
        >
          <div id="conetenedorMotivo" className="flex flex-col gap-5">
            <FormField
              htmlFor="campoMotivo"
              errorMessage={
                longitudMotivo >= 500
                  ? "El motivo no debe ser mayor a 500 caracteres"
                  : longitudMotivo < 10 && longitudMotivo > 0
                    ? "El motivo de cancelación es muy corto"
                    : ""
              }
            >
              <TextArea
                id="campoMotivo"
                placeholder="Ingresa el motivo de cancelación"
                className="resize-none h-40"
                value={motivo}
                hasError={longitudMotivo >= 500}
                onChange={(event) => {
                  setMotivo(event.target.value);
                  setErrorCancelacion(null);
                }}
                maxLength={MAX_MOTIVO}
              />
            </FormField>
          </div>
          <div id="contenedorBotones" className="flex gap-2 justify-end">
            <Button
              text="Volver"
              variant="primary"
              disabled={cancelando}
              onClick={cerrarModalCancelacion}
            />
            <Button
              text="Cancelar evento"
              variant="danger"
              onClick={abrirConfirmacionCancelacion}
              disabled={longitudMotivo < 10}
            />
          </div>
        </Modal>
      </section>
    </>
  );
}
