import { CardMenuPrincipal } from "../../components/organisms/CardMenuPrincipal/CardMenuOrganizador";
import { useEffect, useMemo, useState } from "react";
import type { MisEventosItem } from "@eventos/shared";
import { PageContainer } from "../../components/templates/PageContainer";
import { PageHeader } from "../../components/organisms/PageHeader/PageHeader";
import { SearchField } from "../../components/molecules/SearchField";
import {
  FilterDropdown,
  type FilterOption,
} from "../../components/molecules/FilterDropdown";
import { DateRangeFields } from "../../components/molecules/DateRangeFields";
import { ClearFiltersButton } from "../../components/molecules/ClearFiltersButton";
import Button from "../../components/atoms/Button/Button";
import { useNavigate } from "react-router";
import { API_BASE_URL } from "../../lib/apiClient";
import {
  calcularClaveOrdenProximo,
  compararClavesOrdenProximo,
  obtenerAhoraCdmx,
} from "../../utils/fechaHorario";

import { EstadoEvento } from "@eventos/shared";

export type DateFilter =
  | "todas"
  | "proximos"
  | "mes_actual"
  | "mes_siguiente"
  | "personalizado";

const dateOptions: FilterOption[] = [
  { value: "proximos", label: "Próximos 7 días" },
  { value: "mes_actual", label: "Este mes" },
  { value: "mes_siguiente", label: "Próximo mes" },
  { value: "personalizado", label: "Rango personalizado" },
];

const estadoOptions: FilterOption[] = [
  { value: String(EstadoEvento.ACEPTADO), label: "Aceptado" },
  { value: String(EstadoEvento.ENPROCESO), label: "Pendiente" },
  { value: String(EstadoEvento.RECHAZADO), label: "Rechazado" },
  { value: String(EstadoEvento.CANCELADO), label: "Cancelado" },
  { value: String(EstadoEvento.FINALIZADO), label: "Finalizado" },
];

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

export function MisEventos() {
  const [eventos, setEventos] = useState<MisEventosItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroFecha, setFiltroFecha] = useState<DateFilter>("todas");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [filtroRecinto, setFiltroRecinto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const navigate = useNavigate();

  const recintos = useMemo(
    () =>
      [
        ...new Set(
          eventos.flatMap((evento) =>
            (evento.subeventos ?? [])
              .map((sub) => sub.nombreRecinto)
              .filter((nombre): nombre is string => Boolean(nombre)),
          ),
        ),
      ].sort((a, b) => a.localeCompare(b, "es")),
    [eventos],
  );

  const busquedaNormalizada = normalizarTexto(busqueda.trim());
  const ahoraCdmx = obtenerAhoraCdmx();

  const solicitudesFiltradas = useMemo(() => {
    return eventos
      .filter((evento) => {
        const listaSubeventos = evento.subeventos || [];
        const nombreFiltrado =
          !busquedaNormalizada ||
          normalizarTexto(evento.nombre).includes(busquedaNormalizada);
        const recintoFiltrado =
          !filtroRecinto ||
          listaSubeventos.some(
            (sub) =>
              normalizarTexto(sub.nombreRecinto ?? "") ===
              normalizarTexto(filtroRecinto),
          );
        const estadoFiltrado =
          !filtroEstado || evento.idEstadoEvento === Number(filtroEstado);
        const fechaFiltrada =
          filtroFecha === "todas" ||
          listaSubeventos.some((sub) =>
            coincideFiltroFecha(sub.fecha, filtroFecha, rangeStart, rangeEnd),
          );

        return (
          nombreFiltrado && recintoFiltrado && fechaFiltrada && estadoFiltrado
        );
      })
      .sort((a, b) => {
        const cmp = compararClavesOrdenProximo(
          calcularClaveOrdenProximo(a.subeventos ?? [], ahoraCdmx),
          calcularClaveOrdenProximo(b.subeventos ?? [], ahoraCdmx),
        );
        return cmp !== 0 ? cmp : b.idEvento - a.idEvento;
      });
  }, [
    eventos,
    busquedaNormalizada,
    filtroRecinto,
    filtroEstado,
    filtroFecha,
    rangeStart,
    rangeEnd,
    ahoraCdmx,
  ]);

  const hasFilters =
    busqueda.trim() !== "" ||
    filtroFecha !== "todas" ||
    filtroRecinto !== "" ||
    rangeStart !== "" ||
    filtroEstado !== "" ||
    rangeEnd !== "";

  const resetFilters = () => {
    setBusqueda("");
    setFiltroFecha("todas");
    setFiltroRecinto("");
    setRangeStart("");
    setFiltroEstado("");
    setRangeEnd("");
  };

  useEffect(() => {
    const controller = new AbortController();
    const cargarEventos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Sesión no iniciada");
        }
        const response = await fetch(`${API_BASE_URL}/eventos/mis-eventos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            `No se pudieron cargar los eventos (HTTP ${response.status})`,
          );
        }
        const respuesta: unknown = await response.json();
        if (!Array.isArray(respuesta)) {
          throw new Error(
            "La respuesta del servidor no contiene una lista de eventos",
          );
        }
        setEventos(respuesta as MisEventosItem[]);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : "Ocurrió un error al cargar los eventos",
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

  const usuarioRaw = localStorage.getItem("usuario");
  const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : {};
  const tipoCuenta = String(usuario.tipoCuenta ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  const isSubdireccion = tipoCuenta.includes("subdireccion");

  const backLink = isSubdireccion
    ? {
        to: "/subdireccion/menu-principal",
        label: "Volver al menú principal",
      }
    : {
        to: "/menu-asistente",
        label: "Volver al menú principal",
      };

  return (
    <PageContainer>
      <div
        className={
          filtroFecha === "personalizado"
            ? "mb-4 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between"
            : "mb-6 flex flex-col gap-6 lg:mb-8 xl:flex-row xl:items-start xl:justify-between"
        }
      >
        <div className="min-w-0 xl:max-w-sm xl:shrink-0">
          <PageHeader
            title="Mis eventos"
            description="Consulta y administra tus eventos"
            back={backLink}
          />
        </div>

        <div className="w-full min-w-0 space-y-3 xl:max-w-5xl">
          <SearchField
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por nombre"
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

            <div className="min-w-0">
              <FilterDropdown
                label="Espacio"
                allLabel="Todos los espacios"
                value={filtroRecinto}
                options={recintos.map((name) => ({
                  value: name,
                  label: name,
                }))}
                onChange={setFiltroRecinto}
              />
            </div>

            <div className="min-w-0">
              <FilterDropdown
                label="Estado"
                allLabel="Todos los estados"
                value={filtroEstado}
                options={estadoOptions}
                onChange={setFiltroEstado}
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
      <div className="flex justify-end ">
        <div className="w-fit mb-6 flex flex-col gap-4">
          <div>
            {hasFilters && <ClearFiltersButton onClick={resetFilters} />}
          </div>
          <div>
            <Button
              text="Solicitar evento"
              variant="primary"
              type="button"
              onClick={() => navigate("/solicitud-evento")}
            />
          </div>
        </div>
      </div>

      {cargando && (
        <p
          role="status"
          className="rounded-lg bg-gray-50 px-4 py-6 text-gray-600"
        >
          Cargando eventos...
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-6 text-red-700">
          {error}
        </p>
      )}
      {!cargando && !error && solicitudesFiltradas.length > 0 && (
        <div
          id="contenedorEventos"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {solicitudesFiltradas.map((evento) => (
            <CardMenuPrincipal key={evento.idEvento} {...evento} />
          ))}
        </div>
      )}
      {!cargando &&
        !error &&
        eventos.length > 0 &&
        solicitudesFiltradas.length === 0 && (
          <p className="rounded-lg border border-dashed border-gray-300 px-4 py-10 text-center text-gray-600">
            No hay eventos que coincidan con los filtros seleccionados.
          </p>
        )}
      {!cargando && !error && eventos.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-10 text-center text-gray-600">
          No tienes eventos organizados.
        </p>
      )}
    </PageContainer>
  );
}
