import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import {
  AlcanceEvento,
  EstadoEvento,
  InvitadoEventoItem,
  type PersonalLogisticaItem,
} from "@eventos/shared";
import { EventBanner } from "../event-details/components/molecules/EventBanner";
import { Table, type Columna } from "../../components/organisms/Table/Table";
import Button from "../../components/atoms/Button/Button";
import { Modal } from "../../components/molecules/Modal";
import { TextArea } from "../../components/atoms/TextArea/TextArea";
import { FormField } from "../../components/molecules/FormField";
import { apiRequest } from "../../lib/apiClient";
import {
  OrganizerSubeventCard,
  type OrganizerSubeventCardData,
} from "./components/OrganizerSubeventCard";
import { Badge } from "../../components/atoms/Badge/Badge";

interface EventoSubeventosVista {
  idEvento: number;
  nombre: string;
  descripcion: string;
  justificacion: string | null;
  posterUrl: string | null;
  idAlcance?: AlcanceEvento;
  idEstadoEvento?: number;
  motivoRechazo?: string | null;
  solicitudModificacionPendiente?: {
    idSolicitudModificacion: number;
    motivoModificacion: string;
    estado: string;
  } | null;
  personalLogistica: PersonalLogisticaItem[];
  invitados?: InvitadoEventoItem[];
  subEventos: OrganizerSubeventCardData[];
}

type TablaInvitados = InvitadoEventoItem;

const columnasInvitados: Columna<TablaInvitados>[] = [
  {
    id: "correo",
    encabezado: "Correo",
    render: (invitado) => (
      <span className="font-medium text-gray-800">{invitado.correo}</span>
    ),
    className: "min-w-[32rem] max-w-[32rem] break-all px-3",
  },
];

const columnasLogistica: Columna<PersonalLogisticaItem>[] = [
  {
    id: "correo",
    encabezado: "Correo",
    render: (personal) => personal.correo,
    className: "min-w-[32rem] max-w-[32rem] break-all px-3",
  },
];

function obtenerTextoAlcance(alcance?: AlcanceEvento): string {
  switch (alcance) {
    case AlcanceEvento.PUBLICO:
      return "Público";
    case AlcanceEvento.INTERNO:
      return "Interno";
    case AlcanceEvento.PRIVADO:
      return "Privado";
    default:
      return "No especificado";
  }
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function convertirSubevento(valor: unknown): OrganizerSubeventCardData {
  if (
    !esRegistro(valor) ||
    typeof valor.idSubEvento !== "number" ||
    typeof valor.nombre !== "string" ||
    typeof valor.descripcion !== "string" ||
    typeof valor.accesoQR !== "boolean"
  ) {
    throw new Error("La respuesta contiene un subevento inválido.");
  }

  let fecha: OrganizerSubeventCardData["fecha"] = null;
  if (valor.fecha !== null) {
    if (
      !esRegistro(valor.fecha) ||
      typeof valor.fecha.fecha !== "string" ||
      typeof valor.fecha.horaInicio !== "string" ||
      typeof valor.fecha.horaFin !== "string"
    ) {
      throw new Error("La respuesta contiene una fecha de subevento inválida.");
    }
    fecha = {
      fecha: valor.fecha.fecha,
      horaInicio: valor.fecha.horaInicio,
      horaFin: valor.fecha.horaFin,
    };
  }

  let recinto: OrganizerSubeventCardData["recinto"] = null;
  if (valor.recinto !== null) {
    if (
      !esRegistro(valor.recinto) ||
      typeof valor.recinto.idRecinto !== "number" ||
      typeof valor.recinto.nombre !== "string" ||
      typeof valor.recinto.aforo !== "number"
    ) {
      throw new Error("La respuesta contiene un recinto inválido.");
    }
    recinto = {
      idRecinto: valor.recinto.idRecinto,
      nombre: valor.recinto.nombre,
      aforo: valor.recinto.aforo,
    };
  }

  return {
    idSubEvento: valor.idSubEvento,
    nombre: valor.nombre,
    descripcion: valor.descripcion,
    accesoQR: valor.accesoQR,
    estado: typeof valor.estado === "string" ? valor.estado : undefined,
    fecha,
    recinto,
  };
}

function convertirEvento(valor: unknown): EventoSubeventosVista {
  if (
    !esRegistro(valor) ||
    typeof valor.idEvento !== "number" ||
    typeof valor.nombre !== "string" ||
    typeof valor.descripcion !== "string" ||
    (typeof valor.posterUrl !== "string" && valor.posterUrl !== null) ||
    (typeof valor.justificacion !== "string" && valor.justificacion !== null) ||
    !Array.isArray(valor.subEventos)
  ) {
    throw new Error("La respuesta del evento tiene un formato inválido.");
  }

  let idAlcance: AlcanceEvento | undefined = undefined;
  if (
    valor.idAlcance === AlcanceEvento.PUBLICO ||
    valor.idAlcance === AlcanceEvento.INTERNO ||
    valor.idAlcance === AlcanceEvento.PRIVADO
  ) {
    idAlcance = valor.idAlcance;
  }

  let solicitudModificacionPendiente: EventoSubeventosVista["solicitudModificacionPendiente"] =
    null;
  if (
    esRegistro(valor.solicitudModificacionPendiente) &&
    typeof valor.solicitudModificacionPendiente.idSolicitudModificacion ===
      "number" &&
    typeof valor.solicitudModificacionPendiente.motivoModificacion ===
      "string" &&
    typeof valor.solicitudModificacionPendiente.estado === "string"
  ) {
    solicitudModificacionPendiente = {
      idSolicitudModificacion:
        valor.solicitudModificacionPendiente.idSolicitudModificacion,
      motivoModificacion:
        valor.solicitudModificacionPendiente.motivoModificacion,
      estado: valor.solicitudModificacionPendiente.estado,
    };
  }

  const personalLogistica: PersonalLogisticaItem[] = Array.isArray(
    valor.personalLogistica,
  )
    ? valor.personalLogistica
        .filter(
          (item): item is Record<string, unknown> =>
            esRegistro(item) &&
            typeof item.idUsuario === "number" &&
            typeof item.nombreCompleto === "string" &&
            typeof item.correo === "string" &&
            typeof item.tipoCuenta === "string",
        )
        .map((item) => ({
          idUsuario: item.idUsuario as number,
          nombreCompleto: item.nombreCompleto as string,
          correo: item.correo as string,
          tipoCuenta: item.tipoCuenta as string,
        }))
    : [];

  return {
    idEvento: valor.idEvento,
    nombre: valor.nombre,
    descripcion: valor.descripcion,
    justificacion: valor.justificacion,
    posterUrl: valor.posterUrl,
    idAlcance,
    idEstadoEvento:
      typeof valor.idEstadoEvento === "number"
        ? valor.idEstadoEvento
        : undefined,
    motivoRechazo:
      typeof valor.motivoRechazo === "string" ? valor.motivoRechazo : null,
    solicitudModificacionPendiente,
    personalLogistica,
    invitados: Array.isArray(valor.invitados)
      ? (valor.invitados as InvitadoEventoItem[])
      : [],
    subEventos: valor.subEventos.map(convertirSubevento),
  };
}

export function AdministracionEventoConSubeventos() {
  const { idEvento } = useParams();
  const navigate = useNavigate();
  const [datosEvento, setDatosEvento] = useState<EventoSubeventosVista | null>(
    null,
  );
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
  const [mostrarConfirmacionCancelar, setMostrarConfirmacionCancelar] =
    useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [errorMotivoCancelacion, setErrorMotivoCancelacion] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  async function confirmarCancelacion() {
    if (!idEvento) return;
    setCancelando(true);
    setError(null);
    try {
      await apiRequest(`eventos/${idEvento}/cancelar`, {
        method: "PATCH",
        body: JSON.stringify({ motivo: motivoCancelacion.trim() }),
      });
      setMostrarConfirmacionCancelar(false);
      setMensajeExito("El evento se ha cancelado exitosamente.");
      setDatosEvento((prev) =>
        prev ? { ...prev, idEstadoEvento: EstadoEvento.CANCELADO } : prev,
      );
    } catch (err: any) {
      setError(err?.message || "No se pudo cancelar el evento.");
      setMostrarConfirmacionCancelar(false);
    } finally {
      setCancelando(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    const cargarEvento = async () => {
      setCargando(true);
      setError(null);
      setDatosEvento(null);

      if (!idEvento || !/^\d+$/.test(idEvento) || Number(idEvento) < 1) {
        setError("El ID del evento no es válido.");
        setCargando(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Sesión no iniciada.");
        setCargando(false);
        return;
      }

      try {
        const respuesta = await apiRequest<unknown>(
          `eventos/${idEvento}/detalle-organizador`,
          { signal: controller.signal },
        );
        setDatosEvento(convertirEvento(respuesta));
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar el evento.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    void cargarEvento();
    return () => controller.abort();
  }, [idEvento]);

  const subeventosCompletos =
    datosEvento?.subEventos.filter(
      (subevento) =>
        subevento.estado !== "Cancelado" &&
        subevento.nombre.trim().length > 0 &&
        subevento.descripcion.trim().length > 0,
    ) ?? [];
  const invitados = datosEvento?.invitados ?? [];

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-10 lg:px-8">
      <button
        type="button"
        className="flex cursor-pointer items-center gap-2"
        onClick={() => navigate("/organizador/mis-eventos")}
      >
        <ArrowLeft size={20} aria-hidden="true" />
        <span>Volver</span>
      </button>

      <div className="space-y-4 sm:space-y-5">
        <h1 className="font-merriweather text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
          Administración y detalles de mi evento
        </h1>
        {datosEvento && (
          <EventBanner
            eventName={datosEvento.nombre}
            posterUrl={datosEvento.posterUrl}
          />
        )}
      </div>

      {cargando && (
        <p
          role="status"
          className="rounded-lg bg-gray-50 px-4 py-6 text-gray-600"
        >
          Cargando detalles del evento...
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-6 text-red-700">
          {error}
        </p>
      )}

      {datosEvento && (
        <>
          {datosEvento.idEstadoEvento === EstadoEvento.RECHAZADO && (
            <div className="flex flex-col space-y-2 border border-red-500 rounded-md bg-red-50 p-5 shadow-md">
              <div role="alert" className="flex flex-row justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-900">Motivo de rechazo</h2>
                </div>
                <div>
                  <Badge variant="error">Solicitud rechazada</Badge>
                </div>
              </div>
              <div>
                <p className="break-words text-base text-red-900  ">
                  {datosEvento.motivoRechazo ||
                    "No se especificó un motivo para el rechazo de la solicitud."}
                </p>
              </div>
            </div>
          )}

          {datosEvento.solicitudModificacionPendiente && (
            <div
              role="status"
              className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-950 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                  Solicitud en Revisión
                </span>
                <h2 className="text-base font-bold text-amber-950">
                  Modificación logística pendiente de evaluación por
                  Subdirección
                </h2>
              </div>
              <p className="text-sm text-amber-900">
                <span className="font-semibold">Motivo registrado:</span>{" "}
                {datosEvento.solicitudModificacionPendiente.motivoModificacion}
              </p>
              <p className="text-xs text-amber-800">
                Mientras Subdirección dictamina esta solicitud, el evento
                conserva vigentes sus fechas y espacios originales. Si realizas
                otro cambio logístico, se actualizará esta misma solicitud sin
                generar duplicados.
              </p>
            </div>
          )}

          <div className="space-y-5 border border-gray-200 bg-white p-5 shadow-md">
            <h2 className="font-merriweather text-xl font-bold text-secondary sm:text-2xl">
              {datosEvento.nombre}
            </h2>
            <div>
              <h2 className="font-bold">Descripción</h2>
              <p className="break-words">{datosEvento.descripcion}</p>
            </div>
            <div>
              <h2 className="font-bold">Alcance</h2>
              <p className="break-words">
                {obtenerTextoAlcance(datosEvento.idAlcance)}
              </p>
            </div>
            {datosEvento.justificacion && (
              <div>
                <h2 className="font-bold">Beneficio politécnico</h2>
                <p className="break-words">{datosEvento.justificacion}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold sm:text-2xl">
              Personal de logística del evento
            </h2>
            {datosEvento.personalLogistica.length > 0 ? (
              <div
                id="contenedorLogistica"
                className="shadow-md w-fit overflow-x-auto rounded-md"
              >
                <Table
                  columnas={columnasLogistica}
                  filas={datosEvento.personalLogistica}
                  obtenerClave={(personal) => personal.idUsuario}
                  className="bg-white text-left text-sm [&_tbody_tr]:h-12 [&_thead_tr]:h-10 [&_th]:py-2 [&_td]:py-2"
                />
              </div>
            ) : (
              <p className="rounded-lg bg-gray-50 px-4 py-6 text-gray-600">
                No hay personal de logística registrado para este evento.
              </p>
            )}
          </div>

          {datosEvento.idAlcance === AlcanceEvento.PRIVADO && (
            <div id="contenedorInvitados" className="space-y-4">
              <h2 className="text-xl font-bold sm:text-2xl">Tus invitados</h2>
              {invitados.length > 0 ? (
                <div className="shadow-md w-fit overflow-x-auto rounded-md">
                  <Table
                    columnas={columnasInvitados}
                    filas={invitados}
                    obtenerClave={(invitado) =>
                      invitado.idUsuario ??
                      invitado.idInvitacionEvento ??
                      invitado.correo
                    }
                    className="bg-white text-left text-sm [&_tbody_tr]:h-12 [&_thead_tr]:h-10 [&_th]:py-2 [&_td]:py-2"
                  />
                </div>
              ) : (
                <p className="rounded-lg bg-gray-50 px-4 py-6 text-gray-600">
                  No hay invitados registrados para este evento.
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-bold sm:text-2xl">Actividades</h2>
            {subeventosCompletos.length > 0 ? (
              <div className="space-y-4">
                {subeventosCompletos.map((subevento) => (
                  <OrganizerSubeventCard
                    key={subevento.idSubEvento}
                    idEvento={datosEvento.idEvento}
                    subevento={subevento}
                    detailsPath={`/organizador/administrar-evento/${datosEvento.idEvento}/subevento/${subevento.idSubEvento}`}
                    detailsLabel="Mostrar detalles"
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-gray-50 px-4 py-6 text-gray-600">
                Aún no hay actividades registradas.
              </p>
            )}
          </div>

          {mensajeExito && (
            <p
              role="status"
              className="rounded-lg bg-green-50 px-4 py-3 text-green-800"
            >
              {mensajeExito}
            </p>
          )}

          {datosEvento.idEstadoEvento !== EstadoEvento.RECHAZADO &&
            datosEvento.idEstadoEvento !== EstadoEvento.CANCELADO && (
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  text="Cancelar evento"
                  variant="danger"
                  type="button"
                  onClick={() => {
                    setMotivoCancelacion("");
                    setErrorMotivoCancelacion("");
                    setMostrarModalCancelar(true);
                  }}
                />
                <Button
                  text="Modificar evento"
                  variant="primary"
                  type="button"
                  onClick={() =>
                    navigate(
                      `/organizador/editar-evento-subeventos/${datosEvento.idEvento}`,
                    )
                  }
                />
              </div>
            )}

          {mostrarModalCancelar && (
            <Modal
              titulo="Motivo de cancelación"
              contenido="Por favor, ingresa el motivo por el cual cancelas este evento. Esta justificación será notificada a los asistentes."
              mostrarModal={mostrarModalCancelar}
              cerrarModal={() => setMostrarModalCancelar(false)}
            >
              <span className="text-xs text-gray-500">
                Máximo 500 caracteres
              </span>
              <FormField errorMessage={errorMotivoCancelacion}>
                <TextArea
                  id="contenedorMotivoCancelacion"
                  className="h-32 resize-none"
                  value={motivoCancelacion}
                  maxLength={500}
                  hasError={Boolean(errorMotivoCancelacion)}
                  onChange={(e) => {
                    setMotivoCancelacion(e.currentTarget.value);
                    if (errorMotivoCancelacion) setErrorMotivoCancelacion("");
                  }}
                />
              </FormField>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  text="Volver"
                  variant="secondary"
                  type="button"
                  onClick={() => setMostrarModalCancelar(false)}
                />
                <Button
                  text="Continuar"
                  variant="primary"
                  type="button"
                  onClick={() => {
                    const limpio = motivoCancelacion.trim();
                    if (!limpio) {
                      setErrorMotivoCancelacion(
                        "Dato requerido faltante. La justificación no puede estar vacía.",
                      );
                      return;
                    }
                    if (limpio.length > 500) {
                      setErrorMotivoCancelacion(
                        "La descripción excede el límite máximo de caracteres permitidos.",
                      );
                      return;
                    }
                    setMostrarModalCancelar(false);
                    setMostrarConfirmacionCancelar(true);
                  }}
                />
              </div>
            </Modal>
          )}

          {mostrarConfirmacionCancelar && (
            <Modal
              titulo="Confirmar cancelación"
              contenido="¿Desea confirmar la cancelación del evento seleccionado? Esta acción es irreversible y cancelará todos los subeventos asociados."
              mostrarModal={mostrarConfirmacionCancelar}
              cerrarModal={() => setMostrarConfirmacionCancelar(false)}
            >
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  text="Volver"
                  variant="secondary"
                  type="button"
                  disabled={cancelando}
                  onClick={() => setMostrarConfirmacionCancelar(false)}
                />
                <Button
                  text={cancelando ? "Cancelando..." : "Confirmar Cancelación"}
                  variant="danger"
                  type="button"
                  disabled={cancelando}
                  onClick={confirmarCancelacion}
                />
              </div>
            </Modal>
          )}
        </>
      )}
    </section>
  );
}
