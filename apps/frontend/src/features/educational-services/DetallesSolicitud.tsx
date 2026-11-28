import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  AlcanceEvento,
  EstadoEvento,
  ModalidadAcceso,
  obtenerEtiquetaModalidad,
  type ImpactoCambioSubevento,
} from "@eventos/shared";
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  CalendarDays,
  Clock,
  Users,
} from "lucide-react";
import { Badge } from "../../components/atoms/Badge/Badge";
import Button from "../../components/atoms/Button/Button";
import { FeedbackNotice } from "../../components/molecules/FeedbackNotice";
import { Modal } from "../../components/molecules/Modal";
import { ModalidadAccesoHelp } from "../../components/molecules/ModalidadAccesoHelp";
import { FormField } from "../../components/molecules/FormField";
import { TextArea } from "../../components/atoms/TextArea/TextArea";
import { apiRequest } from "../../lib/apiClient";
import { EventBanner } from "../event-details/components/molecules/EventBanner";
import { InfoTooltip } from "../../components/atoms/InfoTooltip/InfoTooltip";
import { PageHeader } from "../../components/organisms/PageHeader/PageHeader";

export interface SubeventoDetalleItem {
  id: number;
  nombre: string;
  descripcion: string;
  idModalidadAcceso: ModalidadAcceso;
  nombreRecinto: string;
  aforo: number | string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  esNuevo?: boolean;
  boletosActivos?: number;
  nombreRecintoAnterior?: string | null;
  aforoAnterior?: number | string | null;
  modalidadAnterior?: ModalidadAcceso | null;
  fechaAnterior?: string | null;
  horaInicioAnterior?: string | null;
  horaFinAnterior?: string | null;
  impacto?: ImpactoCambioSubevento | null;
}

export interface DatosPrellenados {
  nombreSolicitante: string;
  idAlcance: string;
  alcanceTexto: string;
  descripcion: string;
  nombre: string;
  justificacion: string;
  idEstadoEvento?: number;
  esUrgente?: boolean;
  motivoUrgencia?: string | null;
  posterUrl?: string | null;
  esModificacion?: boolean;
  motivoModificacion?: string | null;
  subEventos: SubeventoDetalleItem[];
  actividadesEliminadas?: Array<{
    idSubEvento: number;
    nombre: string;
    boletosActivos: number;
  }>;
}

const ALCANCES: Record<string | number, string> = {
  [AlcanceEvento.PUBLICO]: "Público",
  [AlcanceEvento.INTERNO]: "Interno",
  [AlcanceEvento.PRIVADO]: "Privado",
};

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function formatearFecha(fechaStr?: string | null): string {
  if (!fechaStr) return "-";
  const limpia = fechaStr.split("T")[0];
  const partes = limpia.split("-");
  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${anio}`;
  }
  return fechaStr;
}

function formatearHora(horaStr?: string | null): string {
  if (!horaStr) return "-";
  const limpia = horaStr.slice(0, 5);
  return `${limpia} hrs`;
}

function convertirSubevento(valor: unknown): SubeventoDetalleItem {
  if (!esRegistro(valor)) {
    throw new Error("La respuesta contiene un subevento inválido.");
  }

  const id =
    typeof valor.idSubEvento === "number"
      ? valor.idSubEvento
      : typeof valor.id === "number"
        ? valor.id
        : 0;

  const nombre = typeof valor.nombre === "string" ? valor.nombre : "";
  const descripcion =
    typeof valor.descripcion === "string" ? valor.descripcion : "";
  const idModalidadAcceso =
    typeof valor.idModalidadAcceso === "number"
      ? (valor.idModalidadAcceso as ModalidadAcceso)
      : ModalidadAcceso.ACCESO_LIBRE;

  let fecha = "";
  let horaInicio = "";
  let horaFin = "";

  if (esRegistro(valor.fecha)) {
    fecha = typeof valor.fecha.fecha === "string" ? valor.fecha.fecha : "";
    horaInicio =
      typeof valor.fecha.horaInicio === "string" ? valor.fecha.horaInicio : "";
    horaFin =
      typeof valor.fecha.horaFin === "string" ? valor.fecha.horaFin : "";
  } else if (typeof valor.fecha === "string") {
    fecha = valor.fecha;
    horaInicio = typeof valor.horaInicio === "string" ? valor.horaInicio : "";
    horaFin = typeof valor.horaFin === "string" ? valor.horaFin : "";
  }

  let nombreRecinto = "-";
  let aforo: number | string = "-";

  if (esRegistro(valor.espacio)) {
    if (typeof valor.espacio.nombre === "string") {
      nombreRecinto = valor.espacio.nombre;
    }
    if (typeof valor.espacio.aforo === "number") {
      aforo = valor.espacio.aforo;
    }
  } else if (esRegistro(valor.recinto)) {
    if (typeof valor.recinto.nombre === "string") {
      nombreRecinto = valor.recinto.nombre;
    }
    if (typeof valor.recinto.aforo === "number") {
      aforo = valor.recinto.aforo;
    }
  }

  const recintoAnt = esRegistro(valor.recintoAnterior)
    ? valor.recintoAnterior
    : null;
  const impacto = esRegistro(valor.impacto)
    ? (valor.impacto as unknown as ImpactoCambioSubevento)
    : null;

  return {
    id,
    nombre,
    descripcion,
    idModalidadAcceso,
    nombreRecinto,
    aforo,
    fecha,
    horaInicio,
    horaFin,
    esNuevo: Boolean(valor.esNuevo),
    boletosActivos:
      typeof valor.boletosActivos === "number" ? valor.boletosActivos : 0,
    nombreRecintoAnterior:
      recintoAnt && typeof recintoAnt.nombre === "string"
        ? recintoAnt.nombre
        : null,
    aforoAnterior:
      recintoAnt && typeof recintoAnt.aforo === "number"
        ? recintoAnt.aforo
        : null,
    modalidadAnterior:
      typeof valor.modalidadAnterior === "number"
        ? (valor.modalidadAnterior as ModalidadAcceso)
        : null,
    fechaAnterior:
      typeof valor.fechaAnterior === "string" ? valor.fechaAnterior : null,
    horaInicioAnterior:
      typeof valor.horaInicioAnterior === "string"
        ? valor.horaInicioAnterior
        : null,
    horaFinAnterior:
      typeof valor.horaFinAnterior === "string" ? valor.horaFinAnterior : null,
    impacto,
  };
}

function convertirSolicitud(valor: unknown): DatosPrellenados {
  if (!esRegistro(valor)) {
    throw new Error("Solicitud inválida.");
  }

  const solicitante = valor.solicitante;
  let nombreSolicitante = "No disponible";

  if (solicitante !== null && solicitante !== undefined) {
    if (esRegistro(solicitante)) {
      nombreSolicitante =
        typeof solicitante.nombreCompleto === "string"
          ? solicitante.nombreCompleto
          : `${solicitante.nombre ?? ""} ${solicitante.apellidoPa ?? ""}`.trim();
    } else if (typeof solicitante === "string") {
      nombreSolicitante = solicitante;
    }
  }

  const idAlcanceNum =
    typeof valor.idAlcance === "number"
      ? valor.idAlcance
      : Number(valor.idAlcance) || 1;

  const alcanceTexto = ALCANCES[idAlcanceNum] ?? "Público";

  const solMod = esRegistro(valor.solicitudModificacion)
    ? valor.solicitudModificacion
    : null;
  const tieneModificacionPendiente =
    Boolean(valor.esModificacion) &&
    (solMod === null || solMod.estado === "Pendiente");

  let rawSubeventos: unknown[] = [];
  if (
    tieneModificacionPendiente &&
    solMod &&
    Array.isArray(solMod.subeventosPropuestos) &&
    solMod.subeventosPropuestos.length > 0
  ) {
    rawSubeventos = solMod.subeventosPropuestos;
  } else if (Array.isArray(valor.subeventos)) {
    rawSubeventos = valor.subeventos;
  } else if (Array.isArray(valor.subEventos)) {
    rawSubeventos = valor.subEventos;
  }

  const posterUrl =
    typeof valor.posterUrl === "string"
      ? valor.posterUrl
      : typeof valor.poster_url === "string"
        ? valor.poster_url
        : null;

  const actividadesEliminadas =
    tieneModificacionPendiente &&
    solMod &&
    Array.isArray(solMod.actividadesEliminadas)
      ? solMod.actividadesEliminadas.filter(esRegistro).map((item) => ({
          idSubEvento: Number(item.idSubEvento) || 0,
          nombre: typeof item.nombre === "string" ? item.nombre : "Actividad",
          boletosActivos: Number(item.boletosActivos) || 0,
        }))
      : [];

  return {
    nombreSolicitante,
    idAlcance: String(idAlcanceNum),
    alcanceTexto,
    descripcion: typeof valor.descripcion === "string" ? valor.descripcion : "",
    nombre: typeof valor.nombre === "string" ? valor.nombre : "",
    justificacion:
      typeof valor.justificacion === "string" ? valor.justificacion : "",
    idEstadoEvento:
      typeof valor.idEstadoEvento === "number"
        ? valor.idEstadoEvento
        : undefined,
    esUrgente: Boolean(valor.esUrgente),
    motivoUrgencia:
      typeof valor.motivoUrgencia === "string" ? valor.motivoUrgencia : null,
    posterUrl,
    esModificacion: tieneModificacionPendiente,
    motivoModificacion:
      solMod && typeof solMod.motivoModificacion === "string"
        ? solMod.motivoModificacion
        : null,
    subEventos: rawSubeventos.map(convertirSubevento),
    actividadesEliminadas,
  };
}

export function DetallesSolicitud() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [datos, setDatos] = useState<DatosPrellenados | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mostrarModalAprobar, setMostrarModalAprobar] = useState(false);
  const [mostrarModalRechazar, setMostrarModalRechazar] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  const [procesando, setProcesando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [modalExito, setModalExito] = useState<{
    mensaje: string;
    redireccion: string;
  } | null>(null);

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

      try {
        const respuesta = await apiRequest<unknown>(`/solicitudes/${id}`, {
          signal: controller.signal,
        });
        setDatos(convertirSolicitud(respuesta));
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error
            ? err.message
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

  const esAprobada = (() => {
    // Si la navegación indica explícitamente el origen:
    if (location.state?.from === "pendientes") return false;
    if (location.state?.from === "aprobadas") return true;

    // Si tiene una modificación logística pendiente de evaluar por subdirección:
    if (datos?.esModificacion) return false;

    // Si el evento está aceptado y no hay modificación pendiente:
    if (datos?.idEstadoEvento === EstadoEvento.ACEPTADO) return true;

    return false;
  })();

  const rutaRetorno =
    location.state?.from === "aprobadas" || esAprobada
      ? "/subdireccion/solicitudes-aprobadas"
      : "/subdireccion/lista-solicitudes";

  const etiquetaRetorno =
    location.state?.from === "aprobadas" || esAprobada
      ? "Volver a solicitudes aprobadas"
      : "Volver a lista de solicitudes";

  const handleVolver = () => {
    navigate(rutaRetorno);
  };

  const handleConfirmarAprobar = async () => {
    if (!id) return;
    setProcesando(true);
    setErrorAccion(null);

    try {
      await apiRequest(`/solicitudes/${id}/aprobar`, {
        method: "PATCH",
      });
      setMostrarModalAprobar(false);
      setModalExito({
        mensaje: "Se ha aprobado exitosamente el evento.",
        redireccion: "/subdireccion/lista-solicitudes",
      });
    } catch (err) {
      setErrorAccion(
        err instanceof Error
          ? err.message
          : "No se pudo aprobar la solicitud del evento.",
      );
    } finally {
      setProcesando(false);
    }
  };

  const handleConfirmarRechazo = async () => {
    if (!id) return;
    setProcesando(true);
    setErrorAccion(null);

    try {
      await apiRequest(`/solicitudes/${id}/rechazar`, {
        method: "PATCH",
        body: JSON.stringify({
          motivo: motivoRechazo.trim() || undefined,
        }),
      });
      setMostrarModalRechazar(false);
      setModalExito({
        mensaje: "Se ha rechazado la solicitud del evento exitosamente.",
        redireccion: "/subdireccion/lista-solicitudes",
      });
    } catch (err) {
      setErrorAccion(
        err instanceof Error
          ? err.message
          : "No se pudo rechazar la solicitud del evento.",
      );
    } finally {
      setProcesando(false);
    }
  };

  const handleConfirmarCancelar = async () => {
    if (!id) return;
    const motivoLimpio = motivoCancelacion.trim();
    if (motivoLimpio.length < 10) {
      setErrorAccion(
        "El motivo de cancelación debe tener al menos 10 caracteres.",
      );
      return;
    }

    setProcesando(true);
    setErrorAccion(null);

    try {
      await apiRequest(`/solicitudes/${id}/cancelar`, {
        method: "PATCH",
        body: JSON.stringify({
          motivo: motivoLimpio,
        }),
      });
      setMostrarModalCancelar(false);
      setModalExito({
        mensaje: "Se ha cancelado exitosamente el evento.",
        redireccion: "/subdireccion/solicitudes-aprobadas",
      });
    } catch (err) {
      setErrorAccion(
        err instanceof Error
          ? err.message
          : "No se pudo cancelar el evento seleccionado.",
      );
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="font-merriweather text-gray-600">Cargando solicitud...</p>
      </div>
    );
  }

  if (error || !datos) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p role="alert" className="font-merriweather text-eventos-error">
          {error ?? "No se recibió información de la solicitud."}
        </p>
        <div className="pt-4">
          <Button text="Volver" variant="outline" onClick={handleVolver} />
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <div id="contenedorTituloBanner" className="space-y-4 sm:space-y-5">
        <PageHeader
          title="Detalles de la solicitud"
          description="Consulta los detalles de la solicitud enviada"
          back={{
            to: rutaRetorno,
            label: etiquetaRetorno,
          }}
        />
        <EventBanner
          posterUrl={datos.posterUrl ?? ""}
          eventName={datos.nombre}
        />
      </div>

      <div className="bg-white rounded-md shadow-md p-4 space-y-5 ">
        <h2 className="font-merriweather text-xl font-bold text-secondary sm:text-2xl">
          {datos.nombre}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="font-merriweather text-base font-bold">
              Solicitante
            </h3>
            <span>{datos.nombreSolicitante}</span>
          </div>
          <div>
            <h3 className="font-merriweather text-base font-bold">Alcance</h3>
            <span>{datos.alcanceTexto}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-merriweather text-base font-bold">
            Descripción del evento
          </h3>
          <p className="font-merriweather text-left leading-relaxed">
            {datos.descripcion}
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="font-merriweather text-base font-bold">
            Beneficio Politécnico
          </h3>
          <p className="font-merriweather text-left leading-relaxed">
            {datos.justificacion || "Sin información proporcionada."}
          </p>
        </div>
      </div>
      {datos.esUrgente && datos.motivoUrgencia && (
        <div className="space-y-2  border border-eventos-error bg-red-50 p-4 rounded-md shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <span className="font-merriweather text-base font-bold text-gray-900">
              Motivo de urgencia registrado por el organizador del evento
            </span>
          </div>
          <p className="font-merriweather text-base leading-relaxed text-red-900 leading-relaxed text-justify">
            {datos.motivoUrgencia}
          </p>
        </div>
      )}

      {datos.esModificacion && datos.motivoModificacion && (
        <div className="space-y-1 space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-950 shadow-md">
          <h3 className="font-merriweather text-base font-bold text-gray-900">
            Motivo de modificación registrado por el organizador del evento
          </h3>
          <p className="font-merriweather text-base text-gray-700 leading-relaxed text-justify">
            {datos.motivoModificacion}
          </p>
        </div>
      )}

      <br></br>
      <div>
        <h2 className="font-merriweather font-bold text-2xl">Actividades</h2>
      </div>

      <div className="space-y-4 pt-2">
        {datos.subEventos.map((subevento) => {
          const mostrarComparativa = Boolean(
            datos.esModificacion && !subevento.esNuevo,
          );
          const cambioRecinto = Boolean(
            mostrarComparativa &&
            subevento.nombreRecintoAnterior &&
            subevento.nombreRecintoAnterior !== subevento.nombreRecinto,
          );
          const cambioModalidad = Boolean(
            mostrarComparativa &&
            subevento.modalidadAnterior !== null &&
            subevento.modalidadAnterior !== undefined &&
            subevento.modalidadAnterior !== subevento.idModalidadAcceso,
          );
          const cambioFecha = Boolean(
            mostrarComparativa &&
            subevento.fechaAnterior &&
            subevento.fechaAnterior.slice(0, 10) !==
              subevento.fecha.slice(0, 10),
          );
          const cambioHoraInicio = Boolean(
            mostrarComparativa &&
            subevento.horaInicioAnterior &&
            subevento.horaInicioAnterior.slice(0, 5) !==
              subevento.horaInicio.slice(0, 5),
          );
          const cambioHoraFin = Boolean(
            mostrarComparativa &&
            subevento.horaFinAnterior &&
            subevento.horaFinAnterior.slice(0, 5) !==
              subevento.horaFin.slice(0, 5),
          );
          const cambioAforo = Boolean(
            mostrarComparativa &&
            subevento.aforoAnterior !== null &&
            subevento.aforoAnterior !== undefined &&
            String(subevento.aforoAnterior) !== String(subevento.aforo),
          );

          return (
            <div
              key={subevento.id}
              className="space-y-4 rounded-md bg-white h-fit p-6 text-gray-900 shadow-sm border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-5 space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-merriweather font-bold text-md text-gray-900">
                      {subevento.nombre}
                    </h4>
                    {datos.esModificacion && subevento.esNuevo && (
                      <Badge variant="neutral" className="py-1">
                        Nueva actividad
                      </Badge>
                    )}
                    {datos.esModificacion &&
                      (subevento.boletosActivos ?? 0) > 0 && (
                        <Badge variant="neutral" size="sm" className="py-1">
                          {subevento.boletosActivos} asistentes registrados
                        </Badge>
                      )}
                  </div>
                  <p className="font-merriweather text-sm sm:text-md text-gray-700 leading-relaxed">
                    {subevento.descripcion}
                  </p>
                </div>

                <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-y-5 gap-x-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-md font-semibold text-gray-800">
                      <MapPin size={20} className="text-gray-700 shrink-0" />
                      <span>Espacio</span>
                    </div>
                    <p className="mt-1 font-merriweather text-sm sm:text-md text-gray-700">
                      {subevento.nombreRecinto || "-"}
                    </p>
                    {cambioRecinto && (
                      <p className="mt-0.5 text-xs text-eventos-muted-text">
                        Antes: {subevento.nombreRecintoAnterior}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-md font-semibold text-gray-800">
                      <CalendarDays
                        size={20}
                        className="text-gray-700 shrink-0"
                      />
                      <span>Fecha</span>
                    </div>
                    <p className="mt-1 font-merriweather text-xs sm:text-sm text-gray-700">
                      {formatearFecha(subevento.fecha)}
                    </p>
                    {cambioFecha && (
                      <p className="mt-0.5 text-sm text-eventos-muted-text">
                        Antes: {formatearFecha(subevento.fechaAnterior)}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="text-md font-semibold text-gray-800">
                      Modalidad de acceso
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="mt-1 font-merriweather text-sm sm:text-md text-gray-700">
                        {obtenerEtiquetaModalidad(subevento.idModalidadAcceso)}
                      </span>
                      <InfoTooltip
                        ariaLabel="Información de modalidad de acceso"
                        content={
                          <ModalidadAccesoHelp
                            idModalidadAcceso={subevento.idModalidadAcceso}
                            embedded
                          />
                        }
                      />
                    </div>
                    {cambioModalidad && (
                      <p className="mt-0.5 text-xs text-eventos-muted-text">
                        Antes:{" "}
                        {obtenerEtiquetaModalidad(subevento.modalidadAnterior)}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-md font-semibold text-gray-800">
                      <Clock size={20} className="text-gray-700 shrink-0" />
                      <span>Hora de Inicio</span>
                    </div>
                    <p className="mt-1 font-merriweather text-sm sm:text-md text-gray-700">
                      {formatearHora(subevento.horaInicio)}
                    </p>
                    {cambioHoraInicio && (
                      <p className="mt-0.5 text-xs text-eventos-muted-text">
                        Antes: {formatearHora(subevento.horaInicioAnterior)}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-md font-semibold text-gray-800">
                      <Clock size={20} className="text-gray-700 shrink-0" />
                      <span>Hora de Cierre</span>
                    </div>
                    <p className="mt-1 font-merriweather text-sm sm:text-md text-gray-700">
                      {formatearHora(subevento.horaFin)}
                    </p>
                    {cambioHoraFin && (
                      <p className="mt-0.5 text-xs text-eventos-muted-text">
                        Antes: {formatearHora(subevento.horaFinAnterior)}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-md font-semibold text-gray-800">
                      <Users size={20} className="text-gray-700 shrink-0" />
                      <span>Aforo estimado</span>
                    </div>
                    <p className="mt-1 font-merriweather text-sm sm:text-md text-gray-700">
                      {subevento.aforo ?? "-"}
                    </p>
                    {cambioAforo && (
                      <p className="mt-0.5 text-xs text-eventos-muted-text">
                        Antes: {subevento.aforoAnterior}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {subevento.impacto?.resumenTexto && (
                <FeedbackNotice
                  variant="warning"
                  title="Impacto en reservas activas de esta actividad"
                >
                  {subevento.impacto.resumenTexto}
                </FeedbackNotice>
              )}
            </div>
          );
        })}
      </div>

      {datos.esModificacion &&
        (datos.actividadesEliminadas ?? []).some(
          (a) => a.boletosActivos > 0,
        ) && (
          <FeedbackNotice
            variant="warning"
            title="Actividades eliminadas con registros activos"
          >
            {(datos.actividadesEliminadas ?? [])
              .filter((a) => a.boletosActivos > 0)
              .map(
                (a) =>
                  `${a.nombre} (${a.boletosActivos} inscritos activos que serán cancelados al aprobar)`,
              )
              .join(" · ")}
          </FeedbackNotice>
        )}

      {esAprobada ? (
        <div className="flex justify-start gap-4 pt-2 pb-10">
          <Button
            id="botonCancelar"
            type="button"
            text="Cancelar"
            variant="danger"
            onClick={() => {
              setErrorAccion(null);
              setMotivoCancelacion("");
              setMostrarModalCancelar(true);
            }}
          />
        </div>
      ) : (
        <div className="flex justify-start gap-4 pt-2 pb-10">
          <Button
            id="botonRechazar"
            type="button"
            text="Rechazar"
            variant="danger"
            onClick={() => {
              setErrorAccion(null);
              setMotivoRechazo("");
              setMostrarModalRechazar(true);
            }}
          />
          <Button
            id="botonAprobar"
            type="button"
            text="Aprobar"
            variant="success"
            onClick={() => {
              setErrorAccion(null);
              setMostrarModalAprobar(true);
            }}
          />
        </div>
      )}

      {mostrarModalAprobar && (
        <Modal
          titulo="Atención"
          contenido="¿Desea aprobar el evento?"
          mostrarModal={mostrarModalAprobar}
          cerrarModal={() => {
            setMostrarModalAprobar(false);
            setErrorAccion(null);
          }}
        >
          {datos.esModificacion &&
            datos.subEventos.some((s) => Boolean(s.impacto?.resumenTexto)) && (
              <div className="mb-4">
                <FeedbackNotice
                  variant="warning"
                  title="Resumen de impacto al aprobar"
                >
                  <ul className="mt-2 text-sm leading-relaxed list-disc pl-4 space-y-1">
                    {datos.subEventos
                      .filter((s) => Boolean(s.impacto?.resumenTexto))
                      .map((s) => (
                        <li key={s.id}>
                          <strong>{s.nombre}:</strong> {s.impacto?.resumenTexto}
                        </li>
                      ))}
                  </ul>
                </FeedbackNotice>
              </div>
            )}
          {errorAccion && (
            <p className="text-sm text-eventos-error mb-4" role="alert">
              {errorAccion}
            </p>
          )}
          <div className="mt-8 flex justify-end gap-2">
            <Button
              text="Cancelar"
              variant="secondary"
              disabled={procesando}
              onClick={() => setMostrarModalAprobar(false)}
            />
            <Button
              text="Aceptar"
              variant="success"
              loading={procesando}
              loadingText="Aprobando..."
              onClick={handleConfirmarAprobar}
            />
          </div>
        </Modal>
      )}

      {mostrarModalRechazar && (
        <Modal
          titulo="Rechazar solicitud"
          mostrarModal={mostrarModalRechazar}
          contenido="Ingrese el motivo de rechazo para la solicitud"
          cerrarModal={() => {
            setMostrarModalRechazar(false);
            setErrorAccion(null);
          }}
        >
          <div className="space-y-4">
            <FormField label="Motivo de rechazo" htmlFor="campoMotivoRechazo">
              <TextArea
                id="campoMotivoRechazo"
                placeholder="Ingresa el motivo del rechazo"
                className="resize-none h-50"
                value={motivoRechazo}
                hasError={motivoRechazo.length >= 500}
                disabled={procesando}
                onChange={(e) => {
                  setMotivoRechazo(e.target.value);
                  setErrorAccion(null);
                }}
                maxLength={500}
              />
            </FormField>
            {errorAccion && (
              <p className="text-sm text-eventos-error" role="alert">
                {errorAccion}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                text="Cancelar"
                variant="secondary"
                disabled={procesando}
                onClick={() => setMostrarModalRechazar(false)}
              />
              <Button
                text="Rechazar"
                variant="danger"
                disabled={
                  motivoRechazo.trim().length === 0 ||
                  motivoRechazo.length > 500 ||
                  procesando
                }
                loading={procesando}
                loadingText="Rechazando..."
                onClick={handleConfirmarRechazo}
              />
            </div>
          </div>
        </Modal>
      )}

      {mostrarModalCancelar && (
        <Modal
          titulo="Cancelar evento"
          mostrarModal={mostrarModalCancelar}
          cerrarModal={() => {
            setMostrarModalCancelar(false);
            setErrorAccion(null);
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700 font-merriweather">
              Por favor ingrese el motivo de la cancelación del evento:
            </p>
            <FormField
              label="Motivo de cancelación *"
              htmlFor="campoMotivoCancelacion"
            >
              <TextArea
                id="campoMotivoCancelacion"
                placeholder="Ingresa el motivo de cancelación"
                className="resize-none h-32"
                value={motivoCancelacion}
                onChange={(e) => {
                  setMotivoCancelacion(e.target.value);
                  setErrorAccion(null);
                }}
                maxLength={500}
              />
            </FormField>
            {errorAccion && (
              <p className="text-sm text-eventos-error" role="alert">
                {errorAccion}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                text="Volver"
                variant="secondary"
                disabled={procesando}
                onClick={() => {
                  setMostrarModalCancelar(false);
                  setErrorAccion(null);
                }}
              />
              <Button
                text="Cancelar evento"
                variant="danger"
                disabled={motivoCancelacion.trim().length < 10 || procesando}
                loading={procesando}
                loadingText="Cancelando..."
                onClick={handleConfirmarCancelar}
              />
            </div>
          </div>
        </Modal>
      )}

      {modalExito && (
        <Modal
          titulo="Operación exitosa"
          contenido={modalExito.mensaje}
          mostrarModal={Boolean(modalExito)}
          cerrarModal={() => {
            const ruta = modalExito.redireccion;
            setModalExito(null);
            navigate(ruta);
          }}
        >
          <div className="flex justify-end">
            <Button
              text="Aceptar"
              variant="primary"
              type="button"
              onClick={() => {
                const ruta = modalExito.redireccion;
                setModalExito(null);
                navigate(ruta);
              }}
            />
          </div>
        </Modal>
      )}
    </section>
  );
}
