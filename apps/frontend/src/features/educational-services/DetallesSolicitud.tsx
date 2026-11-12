import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { AlcanceEvento, EstadoEvento } from "@eventos/shared";
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  CalendarDays,
  Clock,
  Users,
} from "lucide-react";
import Button from "../../components/atoms/Button/Button";
import { Modal } from "../../components/molecules/Modal";
import { FormField } from "../../components/molecules/FormField";
import { TextArea } from "../../components/atoms/TextArea/TextArea";
import { apiRequest } from "../../lib/apiClient";
import { EventBanner } from "../event-details/components/molecules/EventBanner";
import Input from "../../components/atoms/Input/Input";

export interface SubeventoDetalleItem {
  id: number;
  nombre: string;
  descripcion: string;
  accesoQR: boolean;
  nombreRecinto: string;
  aforo: number | string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
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
  const accesoQR = Boolean(valor.accesoQR);

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

  return {
    id,
    nombre,
    descripcion,
    accesoQR,
    nombreRecinto,
    aforo,
    fecha,
    horaInicio,
    horaFin,
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

  return {
    nombreSolicitante,
    idAlcance: String(idAlcanceNum),
    alcanceTexto,
    descripcion: typeof valor.descripcion === "string" ? valor.descripcion : "",
    nombre: typeof valor.nombre === "string" ? valor.nombre : "",
    justificacion:
      typeof valor.justificacion === "string" ? valor.justificacion : "",
    idEstadoEvento:
      typeof valor.idEstadoEvento === "number" ? valor.idEstadoEvento : undefined,
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

  const handleVolver = () => {
    if (location.state?.from === "pendientes") {
      navigate("/subdireccion/lista-solicitudes");
    } else if (location.state?.from === "aprobadas") {
      navigate("/subdireccion/solicitudes-aprobadas");
    } else if (esAprobada) {
      navigate("/subdireccion/solicitudes-aprobadas");
    } else {
      navigate("/subdireccion/lista-solicitudes");
    }
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
      setErrorAccion("El motivo de cancelación debe tener al menos 10 caracteres.");
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
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <button
          type="button"
          onClick={handleVolver}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-eventos-primary cursor-pointer transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
      </div>

      <h1 className="font-merriweather text-2xl sm:text-3xl font-bold text-gray-900">
        Detalles del evento
      </h1>

      <EventBanner posterUrl={datos.posterUrl ?? ""} eventName={datos.nombre} />



      <div className="bg-white rounded-md shadow-md p-4 space-y-5 ">
        <h2 className="font-merriweather text-xl font-bold text-secondary sm:text-2xl">
          {datos.nombre}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="font-merriweather text-base font-bold">Solicitante</h3>
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
        <div className="space-y-1  border border-red-200 bg-red-50 p-4 rounded-md shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <span className="font-merriweather text-base font-bold text-gray-900">
              Motivo de urgencia
            </span>
          </div>
          <p className="font-merriweather text-sm text-red-900 leading-relaxed text-justify">
            {datos.motivoUrgencia}
          </p>
        </div>
      )}

      {datos.esModificacion && datos.motivoModificacion && (
        <div className="space-y-1 space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-950 shadow-md">
          <h3 className="font-merriweather text-base font-bold text-gray-900">
            Motivo de modificación
          </h3>
          <p className="font-merriweather text-sm text-gray-700 leading-relaxed text-justify">
            {datos.motivoModificacion}
          </p>
        </div>
      )}

      <br></br>
      <div>
        <h2 className="font-merriweather font-bold text-2xl">Actividades</h2>
      </div>

      <div className="space-y-4 pt-2">
        {datos.subEventos.map((subevento) => (
          <div
            key={subevento.id}
            className="rounded-md bg-eventos-primary-light h-fit p-6 text-gray-900 shadow-sm border border-[#E4C5C6]"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-5 space-y-2">
                <h4 className="font-merriweather font-bold text-gray-900">
                  {subevento.nombre}
                </h4>
                <p className="font-merriweather text-xs sm:text-sm text-gray-700 leading-relaxed text-justify">
                  {subevento.descripcion}
                </p>
              </div>

              <div className="md:col-span-7 grid grid-cols-3 gap-y-5 gap-x-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                    <MapPin className="h-4 w-4 text-gray-700 shrink-0" />
                    <span>Espacio</span>
                  </div>
                  <p className="mt-1 font-merriweather text-xs   sm:text-sm text-gray-700">
                    {subevento.nombreRecinto || "-"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                    <CalendarDays className="h-4 w-4 text-gray-700 shrink-0" />
                    <span>Fecha</span>
                  </div>
                  <p className="mt-1 font-merriweather text-xs sm:text-sm text-gray-700">
                    {formatearFecha(subevento.fecha)}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-800">
                    Modalidad de cupo
                  </div>
                  <p className="mt-1 font-merriweather text-xs sm:text-sm text-gray-700">
                    {subevento.accesoQR ? "Boleto con QR" : "Acceso libre"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                    <Clock className="h-4 w-4 text-gray-700 shrink-0" />
                    <span>Hora de Inicio</span>
                  </div>
                  <p className="mt-1 font-merriweather text-xs sm:text-sm text-gray-700">
                    {formatearHora(subevento.horaInicio)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                    <Clock className="h-4 w-4 text-gray-700 shrink-0" />
                    <span>Hora de Finalización</span>
                  </div>
                  <p className="mt-1 font-merriweather text-xs sm:text-sm text-gray-700">
                    {formatearHora(subevento.horaFin)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                    <Users className="h-4 w-4 text-gray-700 shrink-0" />
                    <span>Aforo estimado</span>
                  </div>
                  <p className="mt-1 font-merriweather text-xs sm:text-sm text-gray-700">
                    {subevento.aforo ?? "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
          {errorAccion && (
            <p className="text-sm text-eventos-error mb-4" role="alert">
              {errorAccion}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              text="Cancelar"
              variant="danger"
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
            <FormField
              label="Motivo de rechazo"
              htmlFor="campoMotivoRechazo"            >
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
                disabled={motivoRechazo.trim().length === 0 || motivoRechazo.length > 500 || procesando}
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
