import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import {
  AlcanceEvento,
  EstadoSubEvento,
  RecintoId,
  type ActualizarInfoGeneralPayload,
  type EventoOrganizadorDetalle,
  type ModificarLogisticaPayload,
  type PersonalLogisticaItem,
  type Recinto,
  type SubEventoLogisticaPayload,
} from "@eventos/shared";
import { ArrowLeft, Pencil } from "lucide-react";
import { EventBanner } from "../event-details/components/molecules/EventBanner";
import { Input } from "../../components/atoms/Input/Input";
import { DateInput } from "../../components/atoms/DateInput/DateInput";
import { InputFile } from "../../components/atoms/InputFile/InputFile";
import { Select } from "../../components/atoms/Select/Select";
import { TextArea } from "../../components/atoms/TextArea/TextArea";
import Button from "../../components/atoms/Button/Button";
import { FormField } from "../../components/molecules/FormField";
import { Modal } from "../../components/molecules/Modal";
import { apiRequest } from "../../lib/apiClient";
import { ModalSubevento } from "../../components/organisms/ModalSubevento/ModalSubevento";
import { SpaceRequerimentsDialog } from "../../components/organisms/SpaceRequirementsDialog/SpaceRequerimentsDialog";
import {
  OrganizerSubeventCard,
  type OrganizerSubeventCardData,
} from "./components/OrganizerSubeventCard";
import { Table, type Columna } from "../../components/organisms/Table/Table";
import Badge from "../../components/atoms/Badge/Badge";
import { MARCADOR_MOTIVO_URGENCIA, ModalMotivo } from "./organism/ModalMotivo";
import { ModalMotivoUrgente } from "../../components/organisms/ModalMotivoUrgente/ModalMotivoUrgente";
import { AgregarLogistica } from "./components/AgregarLogistica";

interface ActividadEditable {
  llave: string;
  idSubEvento?: number;
  nombre: string;
  descripcion: string;
  idRecinto: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  accesoQR: boolean;
}

interface DatosGenerales {
  nombre: string;
  descripcion: string;
  justificacion: string;
  idAlcance: AlcanceEvento | "";
}

interface ErroresActividad {
  fecha?: string;
  idRecinto?: string;
  horaInicio?: string;
  horaFin?: string;
}

const ACCESOS = [
  { value: "true", label: "Acceso con QR" },
  { value: "false", label: "Entrada libre" },
];

const ALCANCES = [
  { value: String(AlcanceEvento.PUBLICO), label: "Público" },
  { value: String(AlcanceEvento.INTERNO), label: "Interno" },
  { value: String(AlcanceEvento.PRIVADO), label: "Privado" },
];

const HORAS_INICIO = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
].map((h) => ({ value: h, label: h }));

const HORAS_FIN = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
].map((h) => ({ value: h, label: h }));

function crearColumnasLogistica(
  onEliminar: (personal: PersonalLogisticaItem) => void,
): Columna<PersonalLogisticaItem>[] {
  return [
    {
      id: "correo",
      encabezado: "Correo",
      render: (personal) => personal.correo,
      className: "min-w-[16rem] max-w-[16rem] break-all px-3",
    },
    {
      id: "acciones",
      encabezado: "Acción",
      render: (personal) => {
        return (
          <Button
            text="Eliminar"
            variant="danger"
            type="button"
            onClick={() => onEliminar(personal)}
          />
        );
      },
      className: "min-w-[16rem] max-w-[16rem] break-all px-3",
    },
  ];
}

function separarMotivoUrgencia(motivo: string) {
  const indice = motivo.lastIndexOf(MARCADOR_MOTIVO_URGENCIA);
  if (indice < 0) {
    return { motivoModificacion: motivo, motivoUrgente: "" };
  }

  return {
    motivoModificacion: motivo.slice(0, indice),
    motivoUrgente: motivo.slice(indice + MARCADOR_MOTIVO_URGENCIA.length),
  };
}

function diasHastaFecha(fecha: string): number | null {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  if (!anio || !mes || !dia) return null;

  const hoy = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .split("-")
    .map(Number);

  const fechaUTC = Date.UTC(anio, mes - 1, dia);
  const hoyUTC = Date.UTC(hoy[0], hoy[1] - 1, hoy[2]);
  return (fechaUTC - hoyUTC) / 86_400_000;
}

function diferenciaEntreFechas(fechaInicio: string, fechaFin: string): number {
  const [y1, m1, d1] = fechaInicio.split("-").map(Number);
  const [y2, m2, d2] = fechaFin.split("-").map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

function sumarDias(fecha: string, dias: number): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

function obtenerMensajeError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}

function obtenerDatosGenerales(
  evento: EventoOrganizadorDetalle,
): DatosGenerales {
  return {
    nombre: evento.nombre,
    descripcion: evento.descripcion,
    justificacion: evento.justificacion ?? "",
    idAlcance: evento.idAlcance ?? "",
  };
}

function mapearPropuesta(
  actividad: SubEventoLogisticaPayload,
  actual?: EventoOrganizadorDetalle["subEventos"][number],
): ActividadEditable {
  const llave = actividad.idSubEvento
    ? `subevento-${actividad.idSubEvento}`
    : `nuevo-${crypto.randomUUID()}`;
  return {
    llave,
    ...(actividad.idSubEvento !== undefined
      ? { idSubEvento: actividad.idSubEvento }
      : {}),
    nombre: actividad.nombre,
    descripcion: actividad.descripcion,
    idRecinto: String(actividad.idRecinto),
    fecha: actividad.fecha.slice(0, 10),
    horaInicio: actividad.horaInicio.slice(0, 5),
    horaFin: actividad.horaFin.slice(0, 5),
    accesoQR: actividad.accesoQR ?? actual?.accesoQR ?? false,
  };
}

function obtenerActividades(
  evento: EventoOrganizadorDetalle,
): ActividadEditable[] {
  const propuesta = evento.solicitudModificacionPendiente?.subeventosPropuestos;
  if (propuesta) {
    return propuesta.map((item) =>
      mapearPropuesta(
        item,
        evento.subEventos.find(
          (subevento) => subevento.idSubEvento === item.idSubEvento,
        ),
      ),
    );
  }

  return evento.subEventos
    .filter((subevento) => subevento.estado !== EstadoSubEvento.CANCELADO)
    .map((subevento) => ({
      llave: `subevento-${subevento.idSubEvento}`,
      idSubEvento: subevento.idSubEvento,
      nombre: subevento.nombre,
      descripcion: subevento.descripcion,
      idRecinto: subevento.recinto ? String(subevento.recinto.idRecinto) : "",
      fecha: subevento.fecha?.fecha.slice(0, 10) ?? "",
      horaInicio: subevento.fecha?.horaInicio.slice(0, 5) ?? "",
      horaFin: subevento.fecha?.horaFin.slice(0, 5) ?? "",
      accesoQR: subevento.accesoQR,
    }));
}

function obtenerPayloadActividades(
  actividades: ActividadEditable[],
  nombreEvento: string,
  descripcionEvento: string,
): SubEventoLogisticaPayload[] {
  return actividades.map((actividad) => ({
    ...(actividad.idSubEvento !== undefined
      ? { idSubEvento: actividad.idSubEvento }
      : {}),
    nombre: actividad.nombre.trim() || nombreEvento.trim(),
    descripcion: actividad.descripcion.trim() || descripcionEvento.trim(),
    idRecinto: Number(actividad.idRecinto),
    accesoQR: actividad.accesoQR,
    fecha: actividad.fecha,
    horaInicio: actividad.horaInicio,
    horaFin: actividad.horaFin,
  }));
}

export function EditarEventoConSubeventos() {
  const { idEvento } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState<EventoOrganizadorDetalle | null>(null);
  const [datosGenerales, setDatosGenerales] = useState<DatosGenerales | null>(
    null,
  );
  const [datosGeneralesIniciales, setDatosGeneralesIniciales] =
    useState<DatosGenerales | null>(null);
  const [actividades, setActividades] = useState<ActividadEditable[]>([]);
  const [actividadesIniciales, setActividadesIniciales] = useState<
    ActividadEditable[]
  >([]);
  const [recintos, setRecintos] = useState<Recinto[]>([]);
  const [archivoPoster, setArchivoPoster] = useState<File | null>(null);
  const [motivo, setMotivo] = useState("");
  const [motivoUrgente, setMotivoUrgente] = useState("");
  const [mostrarModalMotivo, setMostrarModalMotivo] = useState(false);
  const [mostrarModalAviso, setMostrarModalAviso] = useState(false);
  const [mostrarModalUrgente, setMostrarModalUrgente] = useState(false);
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  const [intentoMotivo, setIntentoMotivo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [erroresActividades, setErroresActividades] = useState<
    Record<string, ErroresActividad>
  >({});
  const [modalSubeventoAbierto, setModalSubeventoAbierto] = useState<
    string | null
  >(null);
  const [modalEspacio, setModalEspacio] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [personalAEliminar, setPersonalAEliminar] =
    useState<PersonalLogisticaItem | null>(null);
  const [eliminandoPersonal, setEliminandoPersonal] = useState(false);

  const columnasLogistica = useMemo(
    () => crearColumnasLogistica(setPersonalAEliminar),
    [],
  );

  const handleEliminarPersonalLogistica = async () => {
    if (!personalAEliminar || !idEvento) return;
    try {
      setEliminandoPersonal(true);
      await apiRequest(
        `eventos/${idEvento}/personal-logistica/${personalAEliminar.idUsuario}`,
        { method: "DELETE" },
      );
      setEvento((prev) =>
        prev
          ? {
              ...prev,
              personalLogistica: (prev.personalLogistica ?? []).filter(
                (p) => p.idUsuario !== personalAEliminar.idUsuario,
              ),
            }
          : prev,
      );
      setPersonalAEliminar(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar al personal de logística.",
      );
    } finally {
      setEliminandoPersonal(false);
    }
  };

  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const esSubdireccion = usuarioGuardado?.tipoCuenta === "Subdirección";

  useEffect(() => {
    const controller = new AbortController();
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        if (!idEvento || !/^\d+$/.test(idEvento) || Number(idEvento) < 1) {
          throw new Error("El ID del evento no es válido.");
        }
        if (!localStorage.getItem("token")) {
          throw new Error("Sesión no iniciada.");
        }
        const [detalle, listaRecintos] = await Promise.all([
          apiRequest<EventoOrganizadorDetalle>(
            `eventos/${idEvento}/detalle-organizador`,
            { signal: controller.signal },
          ),
          apiRequest<Recinto[]>("espacios/disponibles", {
            signal: controller.signal,
          }),
        ]);
        if (controller.signal.aborted) return;

        const generales = obtenerDatosGenerales(detalle);
        const listaActividades = obtenerActividades(detalle);
        setEvento(detalle);
        setDatosGenerales(generales);
        setDatosGeneralesIniciales(generales);
        setActividades(listaActividades);
        setActividadesIniciales(listaActividades);
        setRecintos(listaRecintos);
        const motivos = separarMotivoUrgencia(
          detalle.solicitudModificacionPendiente?.motivoModificacion ?? "",
        );
        setMotivo(motivos.motivoModificacion);
        setMotivoUrgente(motivos.motivoUrgente);
      } catch (errorCarga) {
        if (!controller.signal.aborted) {
          setError(obtenerMensajeError(errorCarga));
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    };

    void cargar();
    return () => controller.abort();
  }, [idEvento]);

  const anioActual = new Date().getFullYear();
  const FECHA_FIN_SEMESTRE = `${anioActual}-12-19`;
  const fechaHoy = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const primeraFecha = actividades[0]?.fecha;
  const minFecha =
    primeraFecha && primeraFecha > fechaHoy ? primeraFecha : fechaHoy;
  const maxFecha15 = primeraFecha
    ? sumarDias(primeraFecha, 14)
    : FECHA_FIN_SEMESTRE;
  const maxFecha =
    maxFecha15 < FECHA_FIN_SEMESTRE ? maxFecha15 : FECHA_FIN_SEMESTRE;

  const cambiosGenerales = Boolean(
    datosGenerales &&
    datosGeneralesIniciales &&
    (datosGenerales.nombre !== datosGeneralesIniciales.nombre ||
      datosGenerales.descripcion !== datosGeneralesIniciales.descripcion ||
      datosGenerales.justificacion !== datosGeneralesIniciales.justificacion ||
      datosGenerales.idAlcance !== datosGeneralesIniciales.idAlcance ||
      archivoPoster),
  );
  const payloadActividades = obtenerPayloadActividades(
    actividades,
    datosGenerales?.nombre ?? "",
    datosGenerales?.descripcion ?? "",
  );
  const actividadesInicialesPayload = obtenerPayloadActividades(
    actividadesIniciales,
    datosGeneralesIniciales?.nombre ?? "",
    datosGeneralesIniciales?.descripcion ?? "",
  );
  const cambiosActividades =
    JSON.stringify(payloadActividades) !==
    JSON.stringify(actividadesInicialesPayload);

  const esModificacionUrgente = actividades.some((act) => {
    const dias = diasHastaFecha(act.fecha);
    return dias !== null && dias >= 0 && dias <= 7;
  });

  function calcularErroresActividades(listaActividades: ActividadEditable[]): {
    errores: Record<string, ErroresActividad>;
    hayErrores: boolean;
  } {
    const errores: Record<string, ErroresActividad> = {};
    let hayErrores = false;
    const baseFecha = listaActividades[0]?.fecha;

    listaActividades.forEach((act, idx) => {
      if (act.idSubEvento === undefined) {
        const err: ErroresActividad = {};
        if (!act.fecha) {
          err.fecha = "Selecciona la fecha del evento";
        } else if (act.fecha > FECHA_FIN_SEMESTRE) {
          err.fecha =
            "La fecha no debe exceder el fin de semestre (19 de diciembre)";
        } else if (
          idx > 0 &&
          baseFecha &&
          diferenciaEntreFechas(baseFecha, act.fecha) > 14
        ) {
          err.fecha = "Máximo 15 días a partir de la fecha de inicio";
        }

        if (!act.idRecinto) {
          err.idRecinto = "Selecciona un espacio para el evento";
        }

        if (!act.horaInicio) {
          err.horaInicio = "Selecciona la hora de inicio";
        }

        if (!act.horaFin) {
          err.horaFin = "Selecciona la hora final";
        } else if (
          act.horaInicio &&
          act.horaFin &&
          act.horaInicio >= act.horaFin
        ) {
          err.horaFin =
            "La hora de finalización debe ser posterior a la de inicio";
        }

        if (Object.keys(err).length > 0) {
          errores[act.llave] = err;
          hayErrores = true;
        }
      }
    });

    return { errores, hayErrores };
  }

  function agregarActividad() {
    const primeraActividad = actividades[0];
    setActividades((actuales) => [
      ...actuales,
      {
        llave: `nuevo-${crypto.randomUUID()}`,
        nombre: "",
        descripcion: "",
        idRecinto: "",
        fecha: primeraActividad?.fecha ?? "",
        horaInicio: "",
        horaFin: "",
        accesoQR: false,
      },
    ]);
  }

  function quitarActividad(llave: string) {
    setActividades((actuales) =>
      actuales.filter((item) => item.llave !== llave),
    );
    setErroresActividades((prev) => {
      const nuevo = { ...prev };
      delete nuevo[llave];
      return nuevo;
    });
  }

  function actualizarActividad(
    llave: string,
    campo: keyof ActividadEditable,
    valor: unknown,
  ) {
    setActividades((actuales) =>
      actuales.map((item) =>
        item.llave === llave ? { ...item, [campo]: valor } : item,
      ),
    );
    if (erroresActividades[llave]?.[campo as keyof ErroresActividad]) {
      setErroresActividades((prev) => ({
        ...prev,
        [llave]: {
          ...prev[llave],
          [campo]: undefined,
        },
      }));
    }
  }

  function solicitarConfirmacionLogistica() {
    setIntentoMotivo(true);
    if (!motivo.trim() || motivo.trim().length > 500) {
      return;
    }

    setMostrarModalMotivo(false);
    if (esModificacionUrgente) {
      setMostrarModalUrgente(true);
    } else {
      setMostrarModalAviso(true);
    }
  }

  function confirmarEnvioLogistica() {
    setMostrarModalAviso(false);
    void ejecutarGuardadoFinal(true);
  }

  async function ejecutarGuardadoFinal(enviarLogistica: boolean) {
    if (!idEvento || !evento || !datosGenerales) return;

    setGuardando(true);
    let generalesGuardados = false;
    let logisticaEnviada = false;

    try {
      if (cambiosGenerales) {
        const payload: ActualizarInfoGeneralPayload = {};
        if (datosGenerales.nombre !== datosGeneralesIniciales?.nombre) {
          payload.nombre = datosGenerales.nombre.trim();
        }
        if (
          datosGenerales.descripcion !== datosGeneralesIniciales?.descripcion
        ) {
          payload.descripcion = datosGenerales.descripcion.trim();
        }
        if (
          datosGenerales.justificacion !==
          datosGeneralesIniciales?.justificacion
        ) {
          payload.justificacion = datosGenerales.justificacion.trim();
        }
        if (
          datosGenerales.idAlcance !== datosGeneralesIniciales?.idAlcance &&
          datosGenerales.idAlcance !== ""
        ) {
          payload.idAlcance = datosGenerales.idAlcance;
        }

        if (archivoPoster) {
          const formData = new FormData();
          for (const [campo, valor] of Object.entries(payload)) {
            if (valor !== undefined) formData.append(campo, String(valor));
          }
          formData.append("poster", archivoPoster);
          await apiRequest(`eventos/${idEvento}/info-general`, {
            method: "PATCH",
            body: formData,
          });
        } else {
          await apiRequest(`eventos/${idEvento}/info-general`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        }
        generalesGuardados = true;
        setDatosGeneralesIniciales(datosGenerales);
        setArchivoPoster(null);
      }

      if (enviarLogistica && cambiosActividades) {
        const motivoCompleto = esSubdireccion
          ? undefined
          : esModificacionUrgente
            ? `${motivo.trim()}${MARCADOR_MOTIVO_URGENCIA}${motivoUrgente.trim()}`
            : motivo.trim();

        const payload: ModificarLogisticaPayload = {
          motivoModificacion: motivoCompleto,
          subeventos: payloadActividades,
        };
        await apiRequest(`eventos/${idEvento}/logistica`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        logisticaEnviada = true;
        setActividadesIniciales(actividades);
      }

      const detalleActualizado = await apiRequest<EventoOrganizadorDetalle>(
        `eventos/${idEvento}/detalle-organizador`,
      );
      setEvento(detalleActualizado);
      const listaActividades = obtenerActividades(detalleActualizado);
      setActividades(listaActividades);
      setActividadesIniciales(listaActividades);
      const motivos = separarMotivoUrgencia(
        detalleActualizado.solicitudModificacionPendiente?.motivoModificacion ??
          "",
      );
      setMotivo(motivos.motivoModificacion);
      setMotivoUrgente(motivos.motivoUrgente);
      setIntentoGuardar(false);
      setIntentoMotivo(false);

      setMensaje(
        logisticaEnviada
          ? esSubdireccion
            ? "Los cambios se aplicaron directamente con éxito."
            : generalesGuardados
              ? "La información general se guardó y la modificación de actividades fue enviada a revisión."
              : "La modificación de actividades fue enviada a revisión de Subdirección."
          : "Los cambios se guardaron correctamente.",
      );
    } catch (errorGuardado) {
      const detalle = obtenerMensajeError(errorGuardado);
      setError(
        generalesGuardados
          ? `La información general se guardó, pero no se pudo enviar la modificación de actividades: ${detalle}`
          : detalle,
      );
    } finally {
      setGuardando(false);
    }
  }

  function manejarEnvio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMensaje(null);

    const { errores, hayErrores: hayErroresActividades } =
      calcularErroresActividades(actividades);
    setErroresActividades(errores);

    const hayErroresGenerales = Boolean(
      !datosGenerales ||
      !datosGenerales.nombre.trim() ||
      datosGenerales.nombre.trim().length > 150 ||
      !datosGenerales.descripcion.trim() ||
      datosGenerales.descripcion.trim().length > 500 ||
      !datosGenerales.justificacion.trim() ||
      datosGenerales.justificacion.trim().length > 500,
    );

    if (hayErroresGenerales || hayErroresActividades) {
      setIntentoGuardar(true);
      return;
    }

    if (actividades.length === 0) {
      setError("El evento debe conservar al menos una actividad.");
      return;
    }

    if (!cambiosGenerales && !cambiosActividades) {
      setMensaje("No hay cambios para guardar.");
      return;
    }

    if (!cambiosActividades) {
      void ejecutarGuardadoFinal(false);
      return;
    }

    if (esSubdireccion) {
      void ejecutarGuardadoFinal(true);
      return;
    }

    setIntentoMotivo(false);
    setMostrarModalMotivo(true);
  }

  if (cargando) {
    return (
      <p role="status" className="mx-auto max-w-7xl px-4 py-8 text-gray-600">
        Cargando datos del evento...
      </p>
    );
  }

  const { hayErrores: formularioInvalido } =
    calcularErroresActividades(actividades);
  const formularioGeneralInvalido = Boolean(
    !datosGenerales ||
    !datosGenerales.nombre.trim() ||
    !datosGenerales.descripcion.trim() ||
    !datosGenerales.justificacion.trim(),
  );

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-10 lg:px-8">
      <button
        type="button"
        className="flex cursor-pointer items-center gap-2"
        onClick={() =>
          navigate(`/organizador/administrar-evento-subeventos/${idEvento}`)
        }
      >
        <ArrowLeft size={20} aria-hidden="true" />
        <span>Volver</span>
      </button>

      <h1 className="font-merriweather text-2xl font-semibold leading-tight sm:text-3xl">
        Modificar detalles del evento
      </h1>
      {evento?.posterUrl && (
        <EventBanner
          eventName={datosGenerales?.nombre ?? evento.nombre}
          posterUrl={evento.posterUrl}
        />
      )}

      {error && (
        <Modal
          titulo="Error"
          contenido={error}
          mostrarModal={Boolean(error)}
          cerrarModal={() => setError(null)}
        >
          <Button
            text="Cerrar"
            variant="primary"
            type="button"
            onClick={() => setError(null)}
          />
        </Modal>
      )}

      {mensaje && (
        <div>
          <Badge variant="success">{mensaje}</Badge>
        </div>
      )}

      {intentoGuardar && (formularioInvalido || formularioGeneralInvalido) && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800"
        >
          Por favor, completa todos los campos obligatorios resaltados para
          continuar
        </div>
      )}

      {evento?.solicitudModificacionPendiente && (
        <div
          role="status"
          className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-950 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
              Solicitud en Revisión
            </span>
            <h2 className="text-base font-bold text-amber-950">
              Modificación logística pendiente de evaluación por Subdirección
            </h2>
          </div>
          <p className="text-sm text-amber-900">
            <span className="font-semibold">Motivo registrado:</span>{" "}
            {separarMotivoUrgencia(
              evento.solicitudModificacionPendiente.motivoModificacion,
            ).motivoModificacion || "Sin motivo especificado"}
          </p>
          <p className="text-xs text-amber-800">
            Mientras Subdirección dictamina esta solicitud, el evento conserva
            vigentes sus fechas y espacios originales. Si realizas otro cambio
            logístico, se actualizará esta misma solicitud sin generar
            duplicados.
          </p>
        </div>
      )}

      {datosGenerales && (
        <form
          data-editar-evento-subeventos
          onSubmit={manejarEnvio}
          className="space-y-8"
        >
          <fieldset disabled={guardando} className="space-y-8 border-0 p-0">
            <section className="space-y-4 border border-gray-200 bg-white p-5 shadow-md">
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                <div className="w-fit">
                  <FormField
                    className="!font-bold !text-black"
                    label="Banner del evento"
                    mensajeAyuda="Resolución: 2048 x 1152"
                  >
                    <InputFile
                      id="campoPoster"
                      accept=".jpg"
                      disabled={guardando}
                      onChange={(event) =>
                        setArchivoPoster(event.currentTarget.files?.[0] ?? null)
                      }
                    />
                  </FormField>
                </div>
                <div id="contenedorAlcance" className="max-w-xs">
                  <FormField
                    label="Alcance"
                    htmlFor="campoAlcance"
                    className="!font-bold !text-black"
                  >
                    <Select
                      id="campoAlcance"
                      placeholder="Selecciona una opción"
                      options={ALCANCES}
                      value={
                        datosGenerales.idAlcance === ""
                          ? ""
                          : String(datosGenerales.idAlcance)
                      }
                      disabled={guardando}
                      onChange={(event) => {
                        const valor = Number(event.currentTarget.value);
                        if (
                          valor === AlcanceEvento.PUBLICO ||
                          valor === AlcanceEvento.INTERNO ||
                          valor === AlcanceEvento.PRIVADO
                        ) {
                          setDatosGenerales({
                            ...datosGenerales,
                            idAlcance: valor,
                          });
                        }
                      }}
                    />
                  </FormField>
                </div>
              </div>
              <div id="contenedorNombre" className="relative">
                <Pencil
                  size={18}
                  aria-hidden="true"
                  className="absolute right-3 top-10 text-gray-500"
                />
                <FormField
                  label="Nombre del evento"
                  className="!font-bold !text-black"
                  errorMessage={
                    intentoGuardar && !datosGenerales.nombre.trim()
                      ? "El nombre del evento es obligatorio"
                      : datosGenerales.nombre.trim().length > 150
                        ? "El nombre no puede exceder los 150 caracteres"
                        : undefined
                  }
                >
                  <Input
                    id="campoNombre"
                    className="pr-10 font-merriweather text-xl font-bold text-secondary sm:text-2xl"
                    value={datosGenerales.nombre}
                    maxLength={150}
                    hasError={
                      Boolean(
                        intentoGuardar && !datosGenerales.nombre.trim(),
                      ) || datosGenerales.nombre.trim().length > 150
                    }
                    onChange={(event) =>
                      setDatosGenerales({
                        ...datosGenerales,
                        nombre: event.currentTarget.value,
                      })
                    }
                  />
                </FormField>
              </div>

              <div id="contenedorDescripcion" className="relative">
                <Pencil
                  size={18}
                  aria-hidden="true"
                  className="absolute right-3 top-10 text-gray-500"
                />
                <FormField
                  label="Descripción del evento"
                  className="!font-bold !text-black"
                  errorMessage={
                    intentoGuardar && !datosGenerales.descripcion.trim()
                      ? "La descripción es obligatoria"
                      : datosGenerales.descripcion.trim().length >= 500
                        ? "La descripción no puede exceder los 500 caracteres"
                        : ""
                  }
                >
                  <TextArea
                    value={datosGenerales.descripcion}
                    maxLength={500}
                    className="resize-none"
                    hasError={
                      Boolean(
                        intentoGuardar && !datosGenerales.descripcion.trim(),
                      ) || datosGenerales.descripcion.trim().length >= 500
                    }
                    onChange={(event) =>
                      setDatosGenerales({
                        ...datosGenerales,
                        descripcion: event.currentTarget.value,
                      })
                    }
                  />
                </FormField>
              </div>

              <div id="contenedorJustificacion" className="relative">
                <Pencil
                  size={18}
                  aria-hidden="true"
                  className="absolute right-3 top-10 text-gray-500"
                />
                <FormField
                  label="Beneficio politécnico"
                  className="!font-bold !text-black"
                  errorMessage={
                    intentoGuardar && !datosGenerales.justificacion.trim()
                      ? "La justificación debe ser obligatoria"
                      : datosGenerales.justificacion.trim().length >= 500
                        ? "La justificación no puede exceder los 500 caracteres"
                        : undefined
                  }
                >
                  <TextArea
                    value={datosGenerales.justificacion}
                    maxLength={500}
                    className="resize-none"
                    hasError={
                      Boolean(
                        intentoGuardar && !datosGenerales.justificacion.trim(),
                      ) || datosGenerales.justificacion.trim().length >= 500
                    }
                    onChange={(event) =>
                      setDatosGenerales({
                        ...datosGenerales,
                        justificacion: event.currentTarget.value,
                      })
                    }
                  />
                </FormField>
              </div>
            </section>

            {personalAEliminar && (
              <Modal
                mostrarModal={Boolean(personalAEliminar)}
                titulo="Confirmar eliminación"
                cerrarModal={() => {
                  if (!eliminandoPersonal) setPersonalAEliminar(null);
                }}
              >
                <div className="space-y-4">
                  <p className="text-gray-700">
                    ¿Estás seguro que deseas eliminar al personal
                    <strong className="text-gray-900">
                      {personalAEliminar.correo}
                    </strong>
                    ?
                  </p>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      text="Cancelar"
                      variant="secondary"
                      type="button"
                      disabled={eliminandoPersonal}
                      onClick={() => setPersonalAEliminar(null)}
                    />
                    <Button
                      text={eliminandoPersonal ? "Eliminando..." : "Eliminar"}
                      variant="danger"
                      type="button"
                      disabled={eliminandoPersonal}
                      onClick={() => void handleEliminarPersonalLogistica()}
                    />
                  </div>
                </div>
              </Modal>
            )}

            <div id="contenedorLogistica" className="space-y-5 pt-2">
              <h3 className="text-xl font-bold sm:text-2xl">
                Personal de logística del evento
              </h3>
              {(evento?.personalLogistica ?? []).length > 0 ? (
                <div className="shadow-md w-fit overflow-x-auto rounded-md">
                  <Table
                    columnas={columnasLogistica}
                    filas={evento?.personalLogistica ?? []}
                    obtenerClave={(personal) => personal.idUsuario}
                    className="bg-white text-left text-sm [&_tbody_tr]:h-12 [&_thead_tr]:h-10 [&_th]:py-2 [&_td]:py-2"
                  />
                </div>
              ) : (
                <p className="text-gray-600">
                  No hay personal de logística registrado para este evento.
                </p>
              )}
              <Button
                text="Agregar personal de logística"
                variant="primary"
                type="button"
                onClick={() => {
                  navigate(
                    `/organizador/administrar-evento/${idEvento}/agregar-logistica`,
                  );
                }}
              />
            </div>

            <section className="space-y-5">
              <h2 className="text-xl font-bold sm:text-2xl">Actividades</h2>

              {actividades.map((actividad, indice) => {
                const recinto = recintos.find(
                  (item) => String(item.idRecinto) === actividad.idRecinto,
                );
                if (actividad.idSubEvento !== undefined) {
                  const subevento: OrganizerSubeventCardData = {
                    idSubEvento: actividad.idSubEvento,
                    nombre: actividad.nombre,
                    descripcion: actividad.descripcion,
                    accesoQR: actividad.accesoQR,
                    fecha: actividad.fecha
                      ? {
                          fecha: actividad.fecha,
                          horaInicio: actividad.horaInicio,
                          horaFin: actividad.horaFin,
                        }
                      : null,
                    recinto: recinto
                      ? {
                          idRecinto: recinto.idRecinto,
                          nombre: recinto.nombre,
                          aforo: recinto.aforo,
                        }
                      : null,
                  };

                  return (
                    <OrganizerSubeventCard
                      key={actividad.llave}
                      idEvento={Number(idEvento)}
                      subevento={subevento}
                      onCancel={(motivoCancelacion) => {
                        setMotivo(motivoCancelacion);
                        quitarActividad(actividad.llave);
                      }}
                    />
                  );
                }

                const errorAct = intentoGuardar
                  ? erroresActividades[actividad.llave]
                  : undefined;
                const recintoSeleccionado = recintos.find(
                  (r) => String(r.idRecinto) === actividad.idRecinto,
                );

                return (
                  <div
                    key={actividad.llave}
                    className="grid min-w-0 grid-cols-1 gap-4 rounded-md bg-eventos-primary-light p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 lg:px-10 lg:py-8"
                  >
                    <FormField
                      label="Fecha"
                      htmlFor={`selectFecha-${indice}`}
                      required
                      mensajeAyuda={
                        primeraFecha
                          ? "Máximo 15 días a partir de la fecha de inicio"
                          : undefined
                      }
<<<<<<< HEAD
                      errorMessage={errorAct?.fecha}
                    >
                      <Input
=======
                      errorMessage={errorAct?.fecha}>
                      <DateInput
>>>>>>> origin/develop
                        id={`selectFecha-${indice}`}
                        min={minFecha}
                        max={maxFecha}
                        value={actividad.fecha}
                        hasError={Boolean(errorAct?.fecha)}
                        onValueChange={(fecha) =>
                          actualizarActividad(
                            actividad.llave,
                            "fecha",
                            fecha,
                          )
                        }
                      />
                    </FormField>

                    <FormField
                      label="Espacio deseado"
                      htmlFor={`selectRecinto-${indice}`}
                      required
                      mensajeAyuda={
                        recintoSeleccionado && recintoSeleccionado.aforo > 0
                          ? `Capacidad: ${recintoSeleccionado.aforo} ${
                              recintoSeleccionado.idRecinto !==
                                RecintoId.AUDITORIO &&
                              recintoSeleccionado.idRecinto !==
                                RecintoId.SALA_14
                                ? "equipos / personas"
                                : "personas / asientos"
                            }`
                          : undefined
                      }
                      errorMessage={errorAct?.idRecinto}
                    >
                      <Select
                        id={`selectRecinto-${indice}`}
                        placeholder="Selecciona un espacio"
                        options={recintos.map((r) => ({
                          value: String(r.idRecinto),
                          label: r.nombre,
                        }))}
                        value={actividad.idRecinto}
                        hasError={Boolean(errorAct?.idRecinto)}
                        onChange={(e) => {
                          const idRecintoNum = Number(e.target.value);
                          actualizarActividad(
                            actividad.llave,
                            "idRecinto",
                            e.target.value,
                          );
                          if (idRecintoNum === RecintoId.SALA_14) {
                            actualizarActividad(
                              actividad.llave,
                              "accesoQR",
                              false,
                            );
                          } else if (idRecintoNum !== RecintoId.AUDITORIO) {
                            actualizarActividad(
                              actividad.llave,
                              "accesoQR",
                              true,
                            );
                          }
                        }}
                      />
                    </FormField>

                    <FormField
                      label="Hora inicio"
                      htmlFor={`selectHoraInicio-${indice}`}
                      required
                      errorMessage={errorAct?.horaInicio}
                    >
                      <Select
                        id={`selectHoraInicio-${indice}`}
                        placeholder="Selecciona la hora de inicio"
                        options={HORAS_INICIO}
                        value={actividad.horaInicio}
                        disabled={!actividad.fecha || !actividad.idRecinto}
                        hasError={Boolean(errorAct?.horaInicio)}
                        onChange={(e) =>
                          actualizarActividad(
                            actividad.llave,
                            "horaInicio",
                            e.target.value,
                          )
                        }
                      />
                    </FormField>

                    <FormField
                      label="Hora Fin"
                      htmlFor={`selectHoraFinal-${indice}`}
                      required
                      errorMessage={errorAct?.horaFin}
                    >
                      <Select
                        id={`selectHoraFinal-${indice}`}
                        placeholder="Selecciona la hora final"
                        options={
                          actividad.horaInicio
                            ? HORAS_FIN.filter(
                                (h) => h.value > actividad.horaInicio,
                              )
                            : HORAS_FIN
                        }
                        value={actividad.horaFin}
                        disabled={
                          !actividad.fecha ||
                          !actividad.idRecinto ||
                          !actividad.horaInicio
                        }
                        hasError={Boolean(errorAct?.horaFin)}
                        onChange={(e) =>
                          actualizarActividad(
                            actividad.llave,
                            "horaFin",
                            e.target.value,
                          )
                        }
                      />
                    </FormField>

                    <FormField
                      label="Acceso con boleto"
                      htmlFor={`selectBoleto-${indice}`}
                      required={
                        Number(actividad.idRecinto) !== RecintoId.SALA_14
                      }
                      mensajeAyuda={
                        Number(actividad.idRecinto) === RecintoId.SALA_14
                          ? "Al elegir la sala 14 el acceso es libre"
                          : Number(actividad.idRecinto) !==
                                RecintoId.AUDITORIO &&
                              Boolean(actividad.idRecinto)
                            ? "Al elegir un laboratorio el cupo pasa a ser limitado"
                            : ""
                      }
                    >
                      <Select
                        id={`selectBoleto-${indice}`}
                        placeholder="Selecciona una opción"
                        options={ACCESOS}
                        className="disabled:cursor-not-allowed disabled:text-gray-500"
                        value={
                          actividad.accesoQR !== undefined
                            ? String(actividad.accesoQR)
                            : ""
                        }
                        disabled={
                          Number(actividad.idRecinto) !== RecintoId.AUDITORIO
                        }
                        onChange={(e) =>
                          actualizarActividad(
                            actividad.llave,
                            "accesoQR",
                            e.target.value === "true",
                          )
                        }
                      />
                    </FormField>

                    <FormField
                      label={undefined}
                      htmlFor={`botonEspacio-${indice}`}
                    >
                      <Button
                        id={`botonEspacio-${indice}`}
                        text="Ver detalles del laboratorio"
                        type="button"
                        disabled={
                          Number(actividad.idRecinto) === RecintoId.SALA_14 ||
                          Number(actividad.idRecinto) === RecintoId.AUDITORIO ||
                          !actividad.idRecinto
                        }
                        className="w-full sm:w-auto"
                        onClick={() =>
                          setModalEspacio({
                            id: Number(actividad.idRecinto),
                            nombre:
                              recintos.find(
                                (r) =>
                                  String(r.idRecinto) === actividad.idRecinto,
                              )?.nombre ?? "Espacio seleccionado",
                          })
                        }
                      />
                    </FormField>

                    <div className="col-span-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div id="contenedorBotonesCard">
                        <Button
                          text="Nombre y descripción del subevento"
                          id={`botonVerInformacion-${actividad.llave}`}
                          type="button"
                          className="w-full sm:w-auto"
                          onClick={() =>
                            setModalSubeventoAbierto(actividad.llave)
                          }
                        />
                      </div>

                      <ModalSubevento
                        mostrar={modalSubeventoAbierto === actividad.llave}
                        nombre={actividad.nombre}
                        descripcion={actividad.descripcion}
                        errores={{}}
                        cambiarNombre={(valor) =>
                          actualizarActividad(actividad.llave, "nombre", valor)
                        }
                        cambiarDescripcion={(valor) =>
                          actualizarActividad(
                            actividad.llave,
                            "descripcion",
                            valor,
                          )
                        }
                        cerrar={() => setModalSubeventoAbierto(null)}
                      />

                      <Button
                        text="Eliminar fecha"
                        id={`botonEliminar-${actividad.llave}`}
                        type="button"
                        variant="danger"
                        className="w-full sm:w-auto"
                        onClick={() => quitarActividad(actividad.llave)}
                      />
                    </div>
                  </div>
                );
              })}
            </section>
          </fieldset>

          <div id="contenedorBotones" className="flex justify-end gap-3">
            <Button
              text="Agregar actividad"
              variant="primary"
              type="button"
              onClick={agregarActividad}
            />
            <Button
              text="Guardar cambios"
              variant="primary"
              type="submit"
              loading={guardando}
              loadingText="Guardando..."
            />
          </div>
        </form>
      )}

      {(mostrarModalMotivo || mostrarModalAviso) && (
        <ModalMotivo
          mostrarModal={mostrarModalMotivo}
          mostrarModalAviso={mostrarModalAviso}
          intentoMotivo={intentoMotivo}
          esUrgente={esModificacionUrgente}
          logistica={{ motivoModificacion: motivo } as any}
          onCerrar={() => setMostrarModalMotivo(false)}
          onCerrarAviso={() => {
            setMostrarModalAviso(false);
            if (esModificacionUrgente) {
              setMostrarModalUrgente(true);
            } else {
              setMostrarModalMotivo(true);
            }
          }}
          onCambioMotivo={(m) => setMotivo(m)}
          onSolicitarConfirmacion={solicitarConfirmacionLogistica}
          onConfirmar={confirmarEnvioLogistica}
        />
      )}

      <ModalMotivoUrgente
        mostrar={mostrarModalUrgente}
        motivo={motivoUrgente}
        maxLength={500}
        contenido="La fecha propuesta está dentro de los próximos 7 días. Explica por qué la modificación se solicita con carácter urgente."
        cerrar={() => {
          setMostrarModalUrgente(false);
          setMostrarModalMotivo(true);
        }}
        onMotivoChange={setMotivoUrgente}
        continuar={() => {
          setMostrarModalUrgente(false);
          setMostrarModalAviso(true);
        }}
      />

      {modalEspacio && (
        <SpaceRequerimentsDialog
          mostrar={Boolean(modalEspacio)}
          laboratorio={modalEspacio.nombre}
          id={modalEspacio.id}
          cerrar={() => setModalEspacio(null)}
        />
      )}
    </section>
  );
}
