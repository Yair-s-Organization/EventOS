import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { InfoTooltip } from "../../components/atoms/InfoTooltip/InfoTooltip";
import {
  AlcanceEvento,
  esModalidadConQr,
  EstadoEvento,
  EstadoSubEvento,
  ModalidadAcceso,
  obtenerEtiquetaModalidad,
  type EventoOrganizadorDetalle,
  type EventoOrganizadorDetalleSubevento,
  type PersonalLogisticaItem,
  type InvitadoEventoItem,
  type Ponente,
} from "@eventos/shared";
import Button from "../../components/atoms/Button/Button";
import { Table } from "../../components/organisms/Table/Table";
import type { Columna } from "../../components/organisms/Table/Table";
import { EventBanner } from "../event-details/components/molecules/EventBanner";
import { SpaceRequerimentsDialog } from "../../components/organisms/SpaceRequirementsDialog/SpaceRequerimentsDialog";
import { Modal } from "../../components/molecules/Modal";
import { TextArea } from "../../components/atoms/TextArea/TextArea";
import { FormField } from "../../components/molecules/FormField";
import { Navigate, useNavigate } from "react-router";
import { apiRequest } from "../../lib/apiClient";

import { Badge } from "../../components/atoms/Badge/Badge";
import { ModalidadAccesoHelp } from "../../components/molecules/ModalidadAccesoHelp";
import { PageHeader } from "../../components/organisms/PageHeader/PageHeader";
import { EnlaceInvitacionSubevento } from "./components/EnlaceInvitacionSubevento";

type TablaPonente = {
  id: number;
  nombre: string;
};

type TablaInvitados = InvitadoEventoItem;

type TablaPersonalLogistica = PersonalLogisticaItem;

const columnasPonente: Columna<TablaPonente>[] = [
  {
    id: "nombre",
    encabezado: "Nombre",
    render: (ponente) => ponente.nombre,
    className: "min-w-[12rem] sm:min-w-[13rem] break-all px-3",
  },
];

const columnasLogistica: Columna<TablaPersonalLogistica>[] = [
  {
    id: "correo",
    encabezado: "Correo",
    render: (personal) => personal.correo,
    className: "min-w-[12rem] sm:min-w-[13rem] break-all px-3",
  },
];

const columnasInvitados: Columna<TablaInvitados>[] = [
  {
    id: "correo",
    encabezado: "Correo",
    render: (invitado) => invitado.correo,
    className: "min-w-[12rem] break-all px-3",
  },
];

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

function obtenerTextoNullable(
  registro: Record<string, unknown>,
  campo: string,
): string | null {
  const valor = registro[campo];
  if (valor === null || typeof valor === "string") {
    return valor;
  }
  throw new Error(`La respuesta no contiene un texto válido para "${campo}".`);
}

function obtenerNumero(
  registro: Record<string, unknown>,
  campo: string,
): number {
  const valor = registro[campo];
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new Error(
      `La respuesta no contiene un número válido para "${campo}".`,
    );
  }
  return valor;
}

function obtenerBooleano(
  registro: Record<string, unknown>,
  campo: string,
): boolean {
  const valor = registro[campo];
  if (typeof valor !== "boolean") {
    throw new Error(
      `La respuesta no contiene un valor válido para "${campo}".`,
    );
  }
  return valor;
}

function convertirAlcance(valor: unknown): AlcanceEvento {
  switch (valor) {
    case AlcanceEvento.PUBLICO:
      return AlcanceEvento.PUBLICO;
    case AlcanceEvento.INTERNO:
      return AlcanceEvento.INTERNO;
    case AlcanceEvento.PRIVADO:
      return AlcanceEvento.PRIVADO;
    default:
      throw new Error("La respuesta contiene un alcance de evento inválido.");
  }
}

function convertirEstadoEvento(valor: unknown): EstadoEvento {
  switch (valor) {
    case EstadoEvento.RECHAZADO:
      return EstadoEvento.RECHAZADO;
    case EstadoEvento.ACEPTADO:
      return EstadoEvento.ACEPTADO;
    case EstadoEvento.ENPROCESO:
      return EstadoEvento.ENPROCESO;
    case EstadoEvento.CANCELADO:
      return EstadoEvento.CANCELADO;
    case EstadoEvento.FINALIZADO:
      return EstadoEvento.FINALIZADO;
    default:
      throw new Error("La respuesta contiene un estado de evento inválido.");
  }
}

function convertirEstadoSubevento(valor: unknown): EstadoSubEvento {
  const estado = Object.values(EstadoSubEvento).find((item) => item === valor);
  if (!estado) {
    throw new Error("La respuesta contiene un estado de subevento inválido.");
  }
  return estado;
}

function convertirFecha(
  valor: unknown,
): EventoOrganizadorDetalleSubevento["fecha"] {
  if (valor === null) return null;
  if (!esRegistro(valor)) {
    throw new Error("La respuesta contiene una fecha de subevento inválida.");
  }

  return {
    idFecha: obtenerNumero(valor, "idFecha"),
    fecha: obtenerTexto(valor, "fecha"),
    horaInicio: obtenerTexto(valor, "horaInicio"),
    horaFin: obtenerTexto(valor, "horaFin"),
  };
}

function convertirRecinto(
  valor: unknown,
): EventoOrganizadorDetalleSubevento["recinto"] {
  if (valor === null) return null;
  if (!esRegistro(valor)) {
    throw new Error("La respuesta contiene un recinto inválido.");
  }

  return {
    idRecinto: obtenerNumero(valor, "idRecinto"),
    nombre: obtenerTexto(valor, "nombre"),
    aforo: obtenerNumero(valor, "aforo"),
  };
}

function convertirPonente(valor: unknown): Ponente {
  if (!esRegistro(valor)) {
    throw new Error("La respuesta contiene un ponente inválido.");
  }

  return {
    idPonente: obtenerNumero(valor, "idPonente"),
    nombre: obtenerTexto(valor, "nombre"),
    apellidoPa: obtenerTexto(valor, "apellidoPa"),
    apellidoMa: obtenerTextoNullable(valor, "apellidoMa"),
    correo: obtenerTexto(valor, "correo"),
    idSubEvento: obtenerNumero(valor, "idSubEvento"),
  };
}

function convertirPersonalLogistica(valor: unknown): PersonalLogisticaItem {
  if (!esRegistro(valor)) {
    throw new Error("La respuesta contiene personal de logística inválido.");
  }

  return {
    idUsuario: obtenerNumero(valor, "idUsuario"),
    nombreCompleto: obtenerTexto(valor, "nombreCompleto"),
    correo: obtenerTexto(valor, "correo"),
    tipoCuenta: obtenerTexto(valor, "tipoCuenta"),
  };
}

function convertirSubevento(valor: unknown): EventoOrganizadorDetalleSubevento {
  if (!esRegistro(valor) || !Array.isArray(valor.ponentes)) {
    throw new Error("La respuesta contiene un subevento inválido.");
  }

  return {
    idSubEvento: obtenerNumero(valor, "idSubEvento"),
    nombre: obtenerTexto(valor, "nombre"),
    descripcion: obtenerTexto(valor, "descripcion"),
    idModalidadAcceso: obtenerNumero(
      valor,
      "idModalidadAcceso",
    ) as ModalidadAcceso,
    estado: convertirEstadoSubevento(valor.estado),
    fecha: convertirFecha(valor.fecha),
    recinto: convertirRecinto(valor.recinto),
    ponentes: valor.ponentes.map(convertirPonente),
    boletosEmitidos: obtenerNumero(valor, "boletosEmitidos"),
    inscritosCount:
      typeof valor.inscritosCount === "number"
        ? valor.inscritosCount
        : obtenerNumero(valor, "boletosEmitidos"),
    ingresadosCount:
      valor.ingresadosCount === null
        ? null
        : typeof valor.ingresadosCount === "number"
          ? valor.ingresadosCount
          : undefined,
    tokenInvitacion:
      typeof valor.tokenInvitacion === "string"
        ? valor.tokenInvitacion
        : undefined,
    enlaceInvitacionActivo:
      typeof valor.enlaceInvitacionActivo === "boolean"
        ? valor.enlaceInvitacionActivo
        : undefined,
    invitados: Array.isArray(valor.invitados)
      ? (valor.invitados as InvitadoEventoItem[])
      : [],
  };
}

function convertirEvento(valor: unknown): EventoOrganizadorDetalle {
  if (
    !esRegistro(valor) ||
    !Array.isArray(valor.subEventos) ||
    !Array.isArray(valor.personalLogistica)
  ) {
    throw new Error("La respuesta del evento tiene un formato inválido.");
  }

  const idAlcance =
    valor.idAlcance === undefined
      ? undefined
      : convertirAlcance(valor.idAlcance);
  const idEstadoEvento =
    valor.idEstadoEvento === undefined
      ? undefined
      : convertirEstadoEvento(valor.idEstadoEvento);
  const solicitudModificacionPendiente =
    esRegistro(valor.solicitudModificacionPendiente) &&
    typeof valor.solicitudModificacionPendiente.idSolicitudModificacion ===
      "number" &&
    typeof valor.solicitudModificacionPendiente.motivoModificacion ===
      "string" &&
    typeof valor.solicitudModificacionPendiente.estado === "string" &&
    Array.isArray(valor.solicitudModificacionPendiente.subeventosPropuestos)
      ? {
          idSolicitudModificacion:
            valor.solicitudModificacionPendiente.idSolicitudModificacion,
          motivoModificacion:
            valor.solicitudModificacionPendiente.motivoModificacion,
          subeventosPropuestos:
            valor.solicitudModificacionPendiente.subeventosPropuestos,
          estado: valor.solicitudModificacionPendiente.estado,
        }
      : null;

  return {
    idEvento: obtenerNumero(valor, "idEvento"),
    nombre: obtenerTexto(valor, "nombre"),
    descripcion: obtenerTexto(valor, "descripcion"),
    justificacion: obtenerTextoNullable(valor, "justificacion"),
    poster: obtenerTexto(valor, "poster"),
    posterUrl: obtenerTextoNullable(valor, "posterUrl"),
    ...(idAlcance !== undefined ? { idAlcance } : {}),
    ...(idEstadoEvento !== undefined ? { idEstadoEvento } : {}),
    esUrgente: obtenerBooleano(valor, "esUrgente"),
    motivoUrgencia: obtenerTextoNullable(valor, "motivoUrgencia"),
    motivoRechazo: obtenerTextoNullable(valor, "motivoRechazo"),
    solicitudModificacionPendiente,
    idOrganizador: obtenerNumero(valor, "idOrganizador"),
    cupoMaximo: obtenerNumero(valor, "cupoMaximo"),
    boletosActivosCount: obtenerNumero(valor, "boletosActivosCount"),
    subEventos: valor.subEventos.map(convertirSubevento),
    personalLogistica: valor.personalLogistica.map(convertirPersonalLogistica),
    logisticaCount: obtenerNumero(valor, "logisticaCount"),
    invitados: Array.isArray(valor.invitados)
      ? (valor.invitados as InvitadoEventoItem[])
      : [],
  };
}

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

function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return "No especificada";
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha);
  return coincidencia
    ? `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`
    : fecha;
}

function formatearHora(hora: string | null | undefined): string {
  return hora ? hora.slice(0, 5) : "No especificada";
}

export function AdministracionEvento() {
  const { idEvento, idSubEvento } = useParams();
  const idSubEventoSeleccionado = idSubEvento ? Number(idSubEvento) : undefined;
  const [datosEvento, setDatosEvento] =
    useState<EventoOrganizadorDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const subeventosActivos =
    datosEvento?.subEventos.filter(
      (item) => item.estado !== EstadoSubEvento.CANCELADO,
    ) ?? [];

  const subevento = datosEvento
    ? idSubEventoSeleccionado
      ? (subeventosActivos.find(
          (item) => item.idSubEvento === idSubEventoSeleccionado,
        ) ?? null)
      : subeventosActivos.length === 1
        ? subeventosActivos[0]
        : null
    : null;
  const personalLogistica =
    subevento && datosEvento ? (datosEvento.personalLogistica ?? []) : [];
  const invitados = subevento
    ? (subevento.invitados ?? datosEvento?.invitados ?? [])
    : [];
  const navigate = useNavigate();

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
      if (
        idSubEvento &&
        (!/^\d+$/.test(idSubEvento) || Number(idSubEvento) < 1)
      ) {
        setError("El ID de la actividad no es válido.");
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
  }, [idEvento, idSubEvento]);

  const ponentes: TablaPonente[] = (subevento?.ponentes ?? []).map(
    (ponente) => ({
      id: ponente.idPonente,
      nombre:
        `${ponente.nombre} ${ponente.apellidoPa} ${ponente.apellidoMa ?? ""}`.trim(),
    }),
  );

  if (datosEvento && !idSubEventoSeleccionado && subeventosActivos.length > 1) {
    return (
      <Navigate
        to={`/organizador/administrar-evento-subeventos/${idEvento}`}
        replace
      />
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-10 lg:px-8">
      <div id="contenedorTituloBanner" className="space-y-4 sm:space-y-5">
        <PageHeader
          title="Administración y detalles de mi evento"
          back={
            idSubEvento
              ? {
                  to: `/organizador/administrar-evento-subeventos/${idEvento}`,
                  label: "Volver a evento",
                }
              : {
                  to: "/organizador/mis-eventos",
                  label: "Volver a mis eventos",
                }
          }
        />
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
            <div
              role="alert"
              className="space-y-3 rounded-md border border-eventos-error bg-red-50 p-5 shadow-md"
            >
              <div className="flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold sm:text-lg">
                    Subdirección ha determinado que tu solictud sea rechazada
                  </h2>
                </div>
                <div>
                  <Badge className="py-1" variant="error">
                    Solicitud rechazada
                  </Badge>
                </div>
              </div>
              <div className="text-[16px] text-justify break-words">
                <span className="font-semibold">Motivo de rechazo: </span>
                {datosEvento.motivoRechazo ||
                  "No se especificó un motivo para el rechazo de la solicitud."}
              </div>
              <div className="space-y-2 text-justify">
                <p className="text-xs "></p>
              </div>
            </div>
          )}

          {datosEvento.solicitudModificacionPendiente && (
            <div
              role="status"
              className="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-5 shadow-md"
            >
              <div className="flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold sm:text-lg">
                    Modificación logística pendiente de evaluación por
                    Subdirección
                  </h2>
                </div>
                <div>
                  <Badge className="py-1" variant="warning">
                    Solicitud en revisión
                  </Badge>
                </div>
              </div>
              <div className="text-[16px] text-justify break-words">
                <span className="font-semibold">Motivo registrado: </span>
                {datosEvento.solicitudModificacionPendiente.motivoModificacion}
              </div>
              <div className="space-y-2 text-justify">
                <hr className="text-gray-400" />
                <p className="text-xs ">
                  Mientras Subdirección dictamina esta solicitud, el evento
                  conserva vigentes sus fechas y espacios originales. Si
                  realizas otro cambio logístico, se actualizará esta misma
                  solicitud sin generar duplicados.
                </p>
              </div>
            </div>
          )}

          <div
            id="contenedorTitulo"
            className="space-y-3 border border-gray-200 bg-white shadow-md p-5"
          >
            <span className="block font-merriweather text-xl font-bold text-secondary sm:text-2xl">
              {datosEvento.nombre}
            </span>
            <p className="break-words">{datosEvento.descripcion}</p>
          </div>
          {idSubEvento && subevento && (
            <section className="space-y-2 border border-gray-200 bg-white p-5 shadow-md">
              <h2 className="font-merriweather text-xl font-bold text-secondary sm:text-2xl">
                {subevento.nombre}
              </h2>
              <div>
                <h3 className="font-bold">Descripción de la actividad</h3>
                <p className="break-words">{subevento.descripcion}</p>
              </div>
            </section>
          )}
          {idSubEvento && datosEvento && !subevento && !cargando && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-6 text-red-700"
            >
              La actividad seleccionada fue cancelada o no pertenece a este
              evento.
            </p>
          )}
          {subevento && (
            <div
              id="contenedorDatos"
              className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)] xl:gap-12"
            >
              <div
                id="contenedorIzquierda"
                className="w-full min-w-0 space-y-6"
              >
                <div id="contenedorPonentes">
                  <h2 className="text-xl font-bold sm:text-2xl">Ponentes</h2>
                  {ponentes.length > 0 ? (
                    <div className="mt-4 w-full overflow-x-auto overflow-y-auto max-h-[200px] rounded-md border border-gray-200 shadow-md">
                      <Table
                        columnas={columnasPonente}
                        filas={ponentes}
                        obtenerClave={(ponente) => ponente.id}
                        className="table-auto min-w-full bg-white text-left text-sm [&_tbody_tr]:h-12 [&_thead_tr]:h-10 [&_th]:py-2 [&_td]:py-2"
                      />
                    </div>
                  ) : (
                    <p className="mt-3 text-gray-600">
                      No hay ponentes registrados para esta actividad.
                    </p>
                  )}
                </div>

                <div id="contenedorLogistica">
                  <h2 className="text-xl font-bold sm:text-2xl">
                    Personal de logística
                  </h2>
                  {personalLogistica.length > 0 ? (
                    <div className="mt-4 w-full overflow-x-auto overflow-y-auto max-h-[200px] rounded-md border border-gray-200 shadow-md">
                      <Table
                        columnas={columnasLogistica}
                        filas={personalLogistica}
                        obtenerClave={(personal) => personal.idUsuario}
                        className="table-auto min-w-full bg-white text-left text-sm [&_tbody_tr]:h-12 [&_thead_tr]:h-10 [&_th]:py-2 [&_td]:py-2"
                      />
                    </div>
                  ) : (
                    <p className="mt-3 text-gray-600">
                      No hay personal de logística registrado para este evento.
                    </p>
                  )}
                </div>

                {datosEvento.idAlcance === AlcanceEvento.PRIVADO &&
                  subevento && (
                    <div id="contenedorInvitados" className="space-y-4">
                      <h2 className="text-xl font-bold sm:text-2xl">
                        Tus invitados
                      </h2>
                      {invitados.length > 0 ? (
                        <div className="w-full overflow-x-auto overflow-y-auto max-h-[200px] rounded-md border border-gray-200 shadow-md">
                          <Table
                            columnas={columnasInvitados}
                            filas={invitados}
                            obtenerClave={(invitado) =>
                              invitado.correo ||
                              (invitado.idInvitacionEvento
                                ? String(invitado.idInvitacionEvento)
                                : "") ||
                              String(invitado.idUsuario)
                            }
                            encabezadoClassName="h-10 border-b border-gray-300"
                            filaClassName="h-12"
                            className="table-auto min-w-full bg-white text-left text-sm [&_th]:py-2 [&_td]:py-2"
                          />
                        </div>
                      ) : (
                        <p className="mt-3 text-gray-600">
                          No hay invitados registrados para este evento.
                        </p>
                      )}
                      <EnlaceInvitacionSubevento
                        idEvento={datosEvento.idEvento}
                        idSubEvento={subevento.idSubEvento}
                        tokenInvitacion={subevento.tokenInvitacion}
                        enlaceInvitacionActivo={
                          subevento.enlaceInvitacionActivo
                        }
                        onActualizado={(datos) => {
                          setDatosEvento((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  subEventos: prev.subEventos.map((s) =>
                                    s.idSubEvento === datos.idSubEvento
                                      ? {
                                          ...s,
                                          tokenInvitacion:
                                            datos.tokenInvitacion,
                                          enlaceInvitacionActivo:
                                            datos.enlaceInvitacionActivo,
                                        }
                                      : s,
                                  ),
                                }
                              : prev,
                          );
                        }}
                      />
                    </div>
                  )}
              </div>

              <div
                id="contenedorDerecha"
                className="w-full h-full min-w-0 space-y-4"
              >
                {subevento && (
                  <article
                    key={subevento.idSubEvento}
                    className="grid min-w-0 h-full content-start grid-cols-1 gap-x-6 gap-y-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6 text-gray-900"
                  >
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="font-bold">Espacio</span>
                      <span>{subevento.recinto?.nombre}</span>
                    </div>
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="font-bold">Fecha</span>
                      <span>{formatearFecha(subevento.fecha?.fecha)}</span>
                    </div>
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="font-bold">Hora de inicio</span>
                      <span>{formatearHora(subevento.fecha?.horaInicio)}</span>
                    </div>
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="font-bold">Hora de finalización</span>
                      <span>{formatearHora(subevento.fecha?.horaFin)}</span>
                    </div>

                    <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
                      <span className="font-bold">Modalidad de acceso</span>
                      <div className="flex items-center gap-1.5">
                        <span>
                          {obtenerEtiquetaModalidad(
                            subevento.idModalidadAcceso,
                          )}
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
                    </div>

                    {!idSubEvento && (
                      <div className="flex min-w-0 flex-col gap-2">
                        <span className="font-bold">Alcance</span>
                        <span>
                          {obtenerTextoAlcance(datosEvento.idAlcance)}
                        </span>
                      </div>
                    )}
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="font-bold">Aforo del espacio</span>
                      <span>
                        {subevento.recinto?.aforo ?? datosEvento.cupoMaximo}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="font-bold">Inscritos</span>
                      <span>
                        {subevento.inscritosCount ?? subevento.boletosEmitidos}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="font-bold">Ingresados</span>
                      <span>
                        {subevento.ingresadosCount !== null &&
                        subevento.ingresadosCount !== undefined
                          ? subevento.ingresadosCount
                          : esModalidadConQr(subevento.idModalidadAcceso)
                            ? 0
                            : "No aplica (sin QR)"}
                      </span>
                    </div>

                    {!idSubEvento && (
                      <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
                        <span className="font-bold">Beneficio politécnico</span>
                        <p className="mt-2 break-words">
                          {datosEvento.justificacion || "No especificado"}
                        </p>
                      </div>
                    )}
                  </article>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:justify-end sm:flex-row sm:flex-wrap sm:justify-end">
            {datosEvento.idEstadoEvento !== EstadoEvento.RECHAZADO &&
              datosEvento.idEstadoEvento !== EstadoEvento.CANCELADO &&
              subevento?.estado !== "Finalizado" &&
              !idSubEvento && (
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
              )}
            {subevento?.recinto &&
              subevento.recinto.nombre !== "Auditorio Principal" &&
              subevento.recinto.nombre !== "Sala 14" && (
                <Button
                  text="Ver detalles de laboratorio"
                  variant="primary"
                  type="button"
                  onClick={() => setMostrarModal(true)}
                />
              )}

            {subevento &&
              datosEvento.idEstadoEvento !== EstadoEvento.RECHAZADO &&
              datosEvento.idEstadoEvento !== EstadoEvento.CANCELADO &&
              subevento.estado !== "Finalizado" && (
                <Button
                  text={
                    idSubEvento ? "Modificar actividad" : "Modificar Evento"
                  }
                  variant="primary"
                  type="button"
                  onClick={() =>
                    navigate(
                      idSubEventoSeleccionado
                        ? `/organizador/editar-evento/${idEvento}/subevento/${idSubEventoSeleccionado}`
                        : `/organizador/editar-evento/${idEvento}`,
                    )
                  }
                />
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

          {subevento?.recinto && (
            <SpaceRequerimentsDialog
              laboratorio={subevento.recinto.nombre}
              id={subevento.recinto.idRecinto}
              mostrar={mostrarModal}
              cerrar={() => setMostrarModal(false)}
            />
          )}

          {mostrarModalCancelar && (
            <Modal
              titulo="Cancelación del evento"
              contenido="Por favor, ingresa el motivo por el cual cancelas este evento. Esta justificación será notificada a los asistentes."
              mostrarModal={mostrarModalCancelar}
              cerrarModal={() => setMostrarModalCancelar(false)}
            >
              <FormField
                label="Motivo de cancelación"
                required
                errorMessage={errorMotivoCancelacion}
              >
                <span className="text-xs text-gray-500">
                  Máximo 500 caracteres y mínimo 10 caracteres
                </span>
                <TextArea
                  id="contenedorMotivoCancelacion"
                  className="h-32 resize-none"
                  value={motivoCancelacion}
                  maxLength={500}
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
                  disabled={motivoCancelacion.trim().length < 10}
                  onClick={() => {
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
                  onClick={() => {
                    setMostrarConfirmacionCancelar(false);
                    setMostrarModalCancelar(true);
                  }}
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
