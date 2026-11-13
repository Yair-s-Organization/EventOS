import { CardMenuPrincipal } from "../../components/organisms/CardMenuPrincipal/CardMenuOrganizador";
import { useEffect, useState } from "react";
import type { MisEventosItem } from "@eventos/shared";
import { SearchBar } from "../../components/molecules/SearchBar";
import Button from "../../components/atoms/Button/Button";
import { useNavigate } from "react-router";
import { API_BASE_URL } from "../../lib/apiClient";
import Select from "../../components/atoms/Select/Select";
import {
  calcularClaveOrdenProximo,
  compararClavesOrdenProximo,
  obtenerAhoraCdmx,
} from "../../utils/fechaHorario";

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX");
}

function coincideFiltroFecha(fecha: string | null | undefined, filtro: string): boolean {
  if (!filtro) {
    return true;
  }
  if (!fecha) {
    return false;
  }

  const [anio, mes, dia] = fecha.split("-").map(Number);
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
  if (filtro === "esteMes") {
    return (
      fechaEvento.getFullYear() === hoy.getFullYear() &&
      fechaEvento.getMonth() === hoy.getMonth()
    );
  }

  if (filtro === "estaSemana") {
    const inicioSemana = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
    );
    const diasDesdeLunes = (inicioSemana.getDay() + 6) % 7;
    inicioSemana.setDate(inicioSemana.getDate() - diasDesdeLunes);
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(finSemana.getDate() + 7);

    return fechaEvento >= inicioSemana && fechaEvento < finSemana;
  }

  return true;
}

const FECHAS = [
  { value: "estaSemana", label: "Esta semana" },
  { value: "esteMes", label: "Este mes" },
];

const RECINTOS = [
  { value: "Auditorio Principal", label: "Auditorio Principal" },
  { value: "Sala 14", label: "Sala 14" },
  { value: "Laboratorio 2104", label: "Laboratorio 2104" },
  { value: "Laboratorio 2105", label: "Laboratorio 2105" },
  { value: "Laboratorio 2106", label: "Laboratorio 2106" },
  { value: "Laboratorio 2107", label: "Laboratorio 2107" },
];

export function MisEventos() {
  const [eventos, setEventos] = useState<MisEventosItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroRecinto, setFiltroRecinto] = useState("");
  const busquedaNormalizada = normalizarTexto(busqueda.trim());
  const ahoraCdmx = obtenerAhoraCdmx();
  const solicitudesFiltradas = eventos
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
      const fechaFiltrada =
        !filtroFecha ||
        listaSubeventos.some((sub) =>
          coincideFiltroFecha(sub.fecha, filtroFecha),
        );

      return nombreFiltrado && recintoFiltrado && fechaFiltrada;
    })
    .sort((a, b) => {
      const cmp = compararClavesOrdenProximo(
        calcularClaveOrdenProximo(a.subeventos ?? [], ahoraCdmx),
        calcularClaveOrdenProximo(b.subeventos ?? [], ahoraCdmx),
      );
      return cmp !== 0 ? cmp : b.idEvento - a.idEvento;
    });

  useEffect(() => {
    const controller = new AbortController();
    const cargarEventos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Sesión no iniciada");
        }
        const response = await fetch(
          `${API_BASE_URL}/eventos/mis-eventos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );
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
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div
        id="contenedorFiltros"
        className="flex flex-col gap-50 lg:flex-row lg:items-center">
        <h1 className="font-merriweather text-4xl font-bold sm:text-4xl">
          Mis eventos
        </h1>
        <div className="grid w-full min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
          <SearchBar
            classname="w-full min-w-0"
            texto="Buscar por nombre"
            value={busqueda}
            onChangeEvent={(e) => setBusqueda(e.target.value)}
            handle={(event) => event.preventDefault()}
          />
          <Select
            id="selectFiltroFechas"
            className="w-full min-w-0 shadow-md border-none focus-visible:ring-transparent"
            placeholder="Fecha"
            options={FECHAS}
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
          <Select
            id="selectRecinto"
            className="w-full min-w-0 shadow-md border-none focus-visible:ring-transparent"
            placeholder="Espacio"
            options={RECINTOS}
            value={filtroRecinto}
            onChange={(e) => setFiltroRecinto(e.target.value)}
          />
        </div>
      </div>
      <div id="contenedorBoton" className="flex sm:justify-end">
        <Button
          text="Solicitar evento"
          variant="primary"
          type="button"
          onClick={() => navigate("/solicitud-evento")}></Button>
      </div>
      {cargando && (
        <p
          role="status"
          className="rounded-lg bg-gray-50 px-4 py-6 text-gray-600">
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
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    </section>
  );
}
