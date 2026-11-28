import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Evento,
  AlcanceEvento,
  ETIQUETAS_MODALIDAD,
  EstadoSubEvento,
  InvitadoEventoItem,
  ModalidadAcceso,
  calcularImpactoCambioSubevento,
  esLaboratorioRecinto,
  modalidadPorDefectoRecinto,
  obtenerModalidadesPermitidasPorRecinto,
  RecintoId,
  validarModalidadEnRecinto,
  type ActualizarInfoGeneralPayload,
  type EventoOrganizadorDetalle,
  type ImpactoCambioSubevento,
  type ModificarLogisticaPayload,
  type PersonalLogisticaItem,
  type Recinto,
  type SubEventoLogisticaPayload,
} from "@eventos/shared";
import { EventBanner } from "../event-details/components/molecules/EventBanner";
import { Input } from "../../components/atoms/Input/Input";
import { DateInput } from "../../components/atoms/DateInput/DateInput";
import { InputFile } from "../../components/atoms/InputFile/InputFile";
import { Select } from "../../components/atoms/Select/Select";
import { TextArea } from "../../components/atoms/TextArea/TextArea";
import Button from "../../components/atoms/Button/Button";
import { FeedbackNotice } from "../../components/molecules/FeedbackNotice";
import {
  TOOLTIP_ALCANCE_EVENTO,
  TOOLTIP_BANNER_EVENTO,
  TOOLTIP_FECHA_ANTICIPACION,
} from "../../components/molecules/EventoTooltipsContent";
import { FormField } from "../../components/molecules/FormField";
import { Modal } from "../../components/molecules/Modal";
import { ModalidadAccesoHelp } from "../../components/molecules/ModalidadAccesoHelp";
import { apiRequest } from "../../lib/apiClient";
import { ModalSubevento } from "../../components/organisms/ModalSubevento/ModalSubevento";
import { SpaceRequerimentsDialog } from "../../components/organisms/SpaceRequirementsDialog/SpaceRequerimentsDialog";
import {
  OrganizerSubeventCard,
  type OrganizerSubeventCardData,
} from "./components/OrganizerSubeventCard";
import { EnlaceInvitacionSubevento } from "./components/EnlaceInvitacionSubevento";
import { Table, type Columna } from "../../components/organisms/Table/Table";
import Badge from "../../components/atoms/Badge/Badge";
import { MARCADOR_MOTIVO_URGENCIA, ModalMotivo } from "./organism/ModalMotivo";
import { ModalMotivoUrgente } from "../../components/organisms/ModalMotivoUrgente/ModalMotivoUrgente";
import {
  ModalInvitados,
  type TablaInvitados as TablaInvitadosModal,
} from "./organism/ModalInvitados";
import { PageHeader } from "../../components/organisms/PageHeader/PageHeader";
import {
  agregarInvitadosLocales,
  normalizarCorreo,
  sincronizarInvitadosYLogistica,
  tienenCambiosInvitados,
  tienenCambiosPersonalLogistica,
} from "./deferredOrganizerSync";

interface ActividadEditable {
  llave: string;
  idSubEvento?: number;
  nombre: string;
  descripcion: string;
  idRecinto: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  idModalidadAcceso: ModalidadAcceso;
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

interface HorarioOcupadoAgenda {
  horaInicio: string;
  horaFin: string;
  idEvento?: number;
  idSubEvento?: number;
}

function horaEnMinutos(hora: string): number {
  if (!hora) return 0;
  const [horas, minutos] = hora.slice(0, 5).split(":").map(Number);
  return (horas || 0) * 60 + (minutos || 0);
}

function seTraslapan(
  horaInicio1: string,
  horaFin1: string,
  horaInicio2: string,
  horaFin2: string,
): boolean {
  return (
    horaEnMinutos(horaInicio1) < horaEnMinutos(horaFin2) &&
    horaEnMinutos(horaInicio2) < horaEnMinutos(horaFin1)
  );
}

function crearColumnasLogistica(
  onEliminar: (personal: PersonalLogisticaItem) => void,
): Columna<PersonalLogisticaItem>[] {
  return [
    {
      id: "correo",
      encabezado: "Correo",
      render: (personal) => personal.correo,
      className: "min-w-[12rem] md:w-[19rem] break-all px-4 py-3",
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
            className="w-full sm:w-auto text-sm"
            onClick={() => onEliminar(personal)}
          />
        );
      },
      className: "text-center min-w-[7rem] sm:min-w-[8rem] px-3 py-3",
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
    idModalidadAcceso:
      actividad.idModalidadAcceso ??
      actual?.idModalidadAcceso ??
      ModalidadAcceso.ACCESO_LIBRE,
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
      idModalidadAcceso: subevento.idModalidadAcceso,
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
    idModalidadAcceso: actividad.idModalidadAcceso,
    fecha: actividad.fecha,
    horaInicio: actividad.horaInicio,
    horaFin: actividad.horaFin,
  }));
}

interface FilaActividadEditableProps {
  actividad: ActividadEditable;
  indice: number;
  minFecha: string;
  maxFecha: string;
  primeraFecha?: string;
  errorAct?: ErroresActividad;
  recintos: Recinto[];
  otrasActividades: ActividadEditable[];
  actualizarActividad: (
    llave: string,
    campo: keyof ActividadEditable,
    valor: any,
  ) => void;
  quitarActividad: (llave: string) => void;
  setModalEspacio: (info: { id: number; nombre: string }) => void;
  impactoActividad?: ImpactoCambioSubevento;
  modalSubeventoAbierto: string | null;
  setModalSubeventoAbierto: (llave: string | null) => void;
}

function FilaActividadEditable({
  actividad,
  indice,
  minFecha,
  maxFecha,
  primeraFecha,
  errorAct,
  recintos,
  otrasActividades,
  actualizarActividad,
  quitarActividad,
  setModalEspacio,
  impactoActividad,
  modalSubeventoAbierto,
  setModalSubeventoAbierto,
}: FilaActividadEditableProps) {
  const [agendaOcupada, setAgendaOcupada] = useState<HorarioOcupadoAgenda[]>(
    [],
  );

  useEffect(() => {
    if (!actividad.idRecinto || !actividad.fecha) {
      setAgendaOcupada([]);
      return;
    }

    const controller = new AbortController();

    const cargarAgenda = async () => {
      try {
        const respuesta = await apiRequest<{
          agenda?: Array<{
            idSubEvento?: number;
            horaInicio: string;
            horaFin: string;
          }>;
        }>(
          `espacios/${actividad.idRecinto}/horarios-disponibles?fecha=${encodeURIComponent(actividad.fecha)}`,
        );

        if (!controller.signal.aborted) {
          const agendaFiltrada = (respuesta?.agenda ?? []).filter(
            (item) => item.idSubEvento !== actividad.idSubEvento,
          );
          setAgendaOcupada(agendaFiltrada);
        }
      } catch {
        if (!controller.signal.aborted) {
          setAgendaOcupada([]);
        }
      }
    };

    void cargarAgenda();
    return () => controller.abort();
  }, [actividad.idRecinto, actividad.fecha, actividad.idSubEvento]);

  const otrosMismoRecintoYFecha = otrasActividades.filter(
    (otra) =>
      otra.llave !== actividad.llave &&
      otra.fecha === actividad.fecha &&
      otra.idRecinto === actividad.idRecinto &&
      otra.horaInicio &&
      otra.horaFin,
  );

  const bloquesOcupados: HorarioOcupadoAgenda[] = [
    ...agendaOcupada,
    ...otrosMismoRecintoYFecha.map((otro) => ({
      horaInicio: otro.horaInicio,
      horaFin: otro.horaFin,
    })),
  ];

  const horaDisponible = (horaInicio: string, horaFin: string) =>
    !bloquesOcupados.some((bloque) =>
      seTraslapan(horaInicio, horaFin, bloque.horaInicio, bloque.horaFin),
    );

  const horasInicioDisponibles = HORAS_INICIO.filter(
    ({ value: horaInicio }) => {
      return HORAS_FIN.some(
        ({ value: horaFin }) =>
          horaEnMinutos(horaFin) > horaEnMinutos(horaInicio) &&
          horaDisponible(horaInicio, horaFin),
      );
    },
  );

  const horasFinDisponibles = HORAS_FIN.filter(
    ({ value: horaFin }) =>
      actividad.horaInicio &&
      horaEnMinutos(horaFin) > horaEnMinutos(actividad.horaInicio) &&
      horaDisponible(actividad.horaInicio, horaFin),
  );

  const opcionesHoraInicio = horasInicioDisponibles.some(
    (h) => h.value === actividad.horaInicio,
  )
    ? horasInicioDisponibles
    : actividad.horaInicio
      ? [
          { value: actividad.horaInicio, label: actividad.horaInicio },
          ...horasInicioDisponibles,
        ]
      : horasInicioDisponibles;

  const opcionesHoraFin = horasFinDisponibles.some(
    (h) => h.value === actividad.horaFin,
  )
    ? horasFinDisponibles
    : actividad.horaFin
      ? [
          { value: actividad.horaFin, label: actividad.horaFin },
          ...horasFinDisponibles,
        ]
      : horasFinDisponibles;

  const recintoSeleccionado = recintos.find(
    (r) => String(r.idRecinto) === actividad.idRecinto,
  );
  /* bg-white border border-gray-200 shadow-sm
   */ return (
    <div className="grid min-w-0 grid-cols-1 gap-4 rounded-md bg-eventos-primary-light p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 lg:px-10 lg:py-8">
      <FormField
        label="Fecha"
        htmlFor={`selectFecha-${indice}`}
        required
        tooltip={TOOLTIP_FECHA_ANTICIPACION}
        mensajeAyuda={
          primeraFecha
            ? "Máximo 15 días a partir de la fecha de inicio"
            : undefined
        }
        errorMessage={errorAct?.fecha}
      >
        <DateInput
          id={`selectFecha-${indice}`}
          min={minFecha}
          max={maxFecha}
          value={actividad.fecha}
          hasError={Boolean(errorAct?.fecha)}
          onValueChange={(fecha) => {
            actualizarActividad(actividad.llave, "fecha", fecha);
            actualizarActividad(actividad.llave, "horaInicio", "");
            actualizarActividad(actividad.llave, "horaFin", "");
          }}
        />
      </FormField>

      <FormField
        label="Espacio deseado"
        htmlFor={`selectRecinto-${indice}`}
        required
        tooltipLabel="Información del espacio seleccionado"
        tooltip={
          <ModalidadAccesoHelp
            idRecinto={Number(actividad.idRecinto) || undefined}
            emptyText="Selecciona un espacio para consultar las modalidades de acceso disponibles según el recinto (Auditorio, Sala 14 o Laboratorios)."
            embedded
          />
        }
        mensajeAyuda={
          recintoSeleccionado && recintoSeleccionado.aforo > 0
            ? `Capacidad: ${recintoSeleccionado.aforo} ${
                recintoSeleccionado.idRecinto !== RecintoId.AUDITORIO &&
                recintoSeleccionado.idRecinto !== RecintoId.SALA_14
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
            actualizarActividad(actividad.llave, "idRecinto", e.target.value);
            actualizarActividad(actividad.llave, "horaInicio", "");
            actualizarActividad(actividad.llave, "horaFin", "");
            const permitidas =
              obtenerModalidadesPermitidasPorRecinto(idRecintoNum);
            if (
              !permitidas.includes(actividad.idModalidadAcceso) ||
              validarModalidadEnRecinto(
                idRecintoNum,
                actividad.idModalidadAcceso,
              ) !== null
            ) {
              actualizarActividad(
                actividad.llave,
                "idModalidadAcceso",
                esLaboratorioRecinto(idRecintoNum)
                  ? ModalidadAcceso.QR_GENERAL
                  : modalidadPorDefectoRecinto(idRecintoNum, true),
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
          options={opcionesHoraInicio}
          value={actividad.horaInicio}
          disabled={!actividad.fecha || !actividad.idRecinto}
          hasError={Boolean(errorAct?.horaInicio)}
          onChange={(e) => {
            actualizarActividad(actividad.llave, "horaInicio", e.target.value);
            actualizarActividad(actividad.llave, "horaFin", "");
          }}
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
          options={opcionesHoraFin}
          value={actividad.horaFin}
          disabled={
            !actividad.fecha || !actividad.idRecinto || !actividad.horaInicio
          }
          hasError={Boolean(errorAct?.horaFin)}
          onChange={(e) =>
            actualizarActividad(actividad.llave, "horaFin", e.target.value)
          }
        />
      </FormField>

      <FormField
        label="Modalidad de acceso"
        htmlFor={`selectBoleto-${indice}`}
        required={!esLaboratorioRecinto(Number(actividad.idRecinto))}
        tooltipLabel="Información de modalidad de acceso"
        tooltip={
          <ModalidadAccesoHelp
            idModalidadAcceso={actividad.idModalidadAcceso}
            emptyText={
              actividad.idRecinto
                ? "Selecciona una modalidad para ver cómo funcionará el registro y el acceso al evento."
                : "Primero selecciona un espacio. Después elige una modalidad para ver cómo funcionará el registro y acceso."
            }
            embedded
          />
        }
      >
        <Select
          id={`selectBoleto-${indice}`}
          placeholder="Selecciona una opción"
          options={obtenerModalidadesPermitidasPorRecinto(
            Number(actividad.idRecinto) || RecintoId.AUDITORIO,
          ).map((modalidad) => ({
            value: String(modalidad),
            label: ETIQUETAS_MODALIDAD[modalidad],
          }))}
          className="disabled:cursor-not-allowed disabled:text-gray-500"
          value={
            actividad.idModalidadAcceso !== undefined
              ? String(actividad.idModalidadAcceso)
              : ""
          }
          disabled={esLaboratorioRecinto(Number(actividad.idRecinto))}
          onChange={(e) =>
            actualizarActividad(
              actividad.llave,
              "idModalidadAcceso",
              Number(e.target.value) as ModalidadAcceso,
            )
          }
        />
      </FormField>

      <FormField label={undefined} htmlFor={`botonEspacio-${indice}`}>
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
              nombre: recintoSeleccionado?.nombre ?? "Espacio seleccionado",
            })
          }
        />
      </FormField>

      {impactoActividad && (
        <div className="col-span-full">
          <FeedbackNotice
            variant="warning"
            title="Aviso de impacto en registros actuales"
          >
            {impactoActividad.resumenTexto}
          </FeedbackNotice>
        </div>
      )}

      <div className="col-span-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div id="contenedorBotonesCard" className="w-full sm:w-auto">
          <Button
            text="Nombre y descripción del subevento"
            id={`botonVerInformacion-${actividad.llave}`}
            type="button"
            className="w-full sm:w-auto"
            onClick={() => setModalSubeventoAbierto(actividad.llave)}
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
            actualizarActividad(actividad.llave, "descripcion", valor)
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
  const [previewPosterUrl, setPreviewPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!archivoPoster) {
      setPreviewPosterUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(archivoPoster);
    setPreviewPosterUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [archivoPoster]);
  const [motivo, setMotivo] = useState("");
  const [motivoUrgente, setMotivoUrgente] = useState("");
  const [mostrarModalMotivo, setMostrarModalMotivo] = useState(false);
  const [mostrarModalAviso, setMostrarModalAviso] = useState(false);
  const [mostrarModalUrgente, setMostrarModalUrgente] = useState(false);
  const [mostrarModalRegreso, setMostrarModalRegreso] = useState(false);
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
  const [personalLogistica, setPersonalLogistica] = useState<
    PersonalLogisticaItem[]
  >([]);
  const [personalLogisticaInicial, setPersonalLogisticaInicial] = useState<
    PersonalLogisticaItem[]
  >([]);
  const [personalAEliminar, setPersonalAEliminar] =
    useState<PersonalLogisticaItem | null>(null);
  const [subeventoModalInvitados, setSubeventoModalInvitados] = useState<
    number | null
  >(null);
  const [invitadosPorSubevento, setInvitadosPorSubevento] = useState<
    Record<number, InvitadoEventoItem[]>
  >({});
  const [invitadosInicialesPorSubevento, setInvitadosInicialesPorSubevento] =
    useState<Record<number, InvitadoEventoItem[]>>({});
  const [invitadoAEliminar, setInvitadoAEliminar] =
    useState<InvitadoEventoItem | null>(null);

  const columnasLogistica = useMemo(
    () => crearColumnasLogistica(setPersonalAEliminar),
    [],
  );

  const confirmarEliminarPersonalLogistica = () => {
    if (!personalAEliminar) return;
    setPersonalLogistica((prev) =>
      prev.filter((p) => p.idUsuario !== personalAEliminar.idUsuario),
    );
    setPersonalAEliminar(null);
  };

  const handleGuardarInvitados = (nuevosInvitados: TablaInvitadosModal[]) => {
    if (subeventoModalInvitados === null) return;
    setError(null);
    const idSub = subeventoModalInvitados;
    setInvitadosPorSubevento((prev) => ({
      ...prev,
      [idSub]: agregarInvitadosLocales(
        prev[idSub] ?? [],
        nuevosInvitados,
        idSub,
      ),
    }));
  };

  const handleReenviarInvitado = async (invitado: InvitadoEventoItem) => {
    if (!idEvento) return;
    setError(null);
    const idSub = invitado.idSubEvento;
    if (!idSub) {
      setError("No se pudo determinar el subevento de la invitación.");
      return;
    }
    try {
      if (invitado.idInvitacionEvento) {
        await apiRequest(
          `eventos/${idEvento}/subeventos/${idSub}/invitados/${invitado.idInvitacionEvento}/reenviar`,
          { method: "POST" },
        );
        setMensaje(`Invitación reenviada correctamente a ${invitado.correo}.`);
        setInvitadosPorSubevento((prev) => ({
          ...prev,
          [idSub]: (prev[idSub] ?? []).map((i) =>
            i.idInvitacionEvento === invitado.idInvitacionEvento
              ? { ...i, puedeReenviar: false, horasRestantesCooldown: 8 }
              : i,
          ),
        }));
      }
    } catch (err) {
      setError(obtenerMensajeError(err));
    }
  };

  const confirmarEliminarInvitado = () => {
    if (!invitadoAEliminar) return;
    const idSub = invitadoAEliminar.idSubEvento;
    if (!idSub) {
      setInvitadoAEliminar(null);
      return;
    }
    const correoObjetivo = normalizarCorreo(invitadoAEliminar.correo);
    setInvitadosPorSubevento((prev) => ({
      ...prev,
      [idSub]: (prev[idSub] ?? []).filter(
        (i) => normalizarCorreo(i.correo) !== correoObjetivo,
      ),
    }));
    setInvitadoAEliminar(null);
  };

  const columnasInvitados: Columna<InvitadoEventoItem>[] = useMemo(
    () => [
      {
        id: "correo",
        encabezado: "Correo",
        render: (invitado) => (
          <span className="font-medium text-gray-800">{invitado.correo}</span>
        ),
        className: "min-w-[12rem] break-all px-4 py-3",
      },
      {
        id: "acciones",
        encabezado: "Acciones",
        render: (invitado) => (
          <div className="flex flex-row items-center justify-center gap-2 sm:flex-nowrap">
            <Button
              text={
                !invitado.idInvitacionEvento
                  ? "Pendiente de envío"
                  : invitado.puedeReenviar
                    ? "Reenviar"
                    : `Reenviar (${invitado.horasRestantesCooldown ?? 8}h)`
              }
              variant={
                invitado.idInvitacionEvento && invitado.puedeReenviar
                  ? "primary"
                  : "secondary"
              }
              disabled={!invitado.idInvitacionEvento || !invitado.puedeReenviar}
              type="button"
              className="text-xs sm:text-sm"
              onClick={() => handleReenviarInvitado(invitado)}
            />
            <Button
              text="Eliminar"
              variant="danger"
              type="button"
              className="text-xs sm:text-sm"
              onClick={() => setInvitadoAEliminar(invitado)}
            />
          </div>
        ),
        className: "text-center min-w-[13rem] sm:min-w-[15rem] px-3 py-3",
      },
    ],
    [idEvento],
  );

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
        const mapaInvitados = Object.fromEntries(
          detalle.subEventos.map((sub) => [
            sub.idSubEvento,
            (sub.invitados ?? []).map((inv) => ({
              ...inv,
              idSubEvento: inv.idSubEvento ?? sub.idSubEvento,
            })),
          ]),
        );
        setInvitadosPorSubevento(mapaInvitados);
        setInvitadosInicialesPorSubevento(mapaInvitados);
        setPersonalLogistica(detalle.personalLogistica ?? []);
        setPersonalLogisticaInicial(detalle.personalLogistica ?? []);
        setRecintos(listaRecintos);
        setMotivo("");
        setMotivoUrgente("");
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

  const fechaManana = sumarDias(fechaHoy, 1);
  const primeraFecha = actividades[0]?.fecha;
  const minFecha =
    primeraFecha && primeraFecha > fechaManana ? primeraFecha : fechaManana;
  const maxFecha15 = primeraFecha
    ? sumarDias(primeraFecha, 14)
    : FECHA_FIN_SEMESTRE;
  const maxFecha =
    maxFecha15 < FECHA_FIN_SEMESTRE ? maxFecha15 : FECHA_FIN_SEMESTRE;

  const subeventosConCambiosInvitados = useMemo(() => {
    const ids = new Set<number>([
      ...Object.keys(invitadosPorSubevento).map(Number),
      ...Object.keys(invitadosInicialesPorSubevento).map(Number),
    ]);
    return Array.from(ids).filter((idSub) =>
      tienenCambiosInvitados(
        invitadosPorSubevento[idSub] ?? [],
        invitadosInicialesPorSubevento[idSub] ?? [],
      ),
    );
  }, [invitadosPorSubevento, invitadosInicialesPorSubevento]);

  const invitadosModificados = subeventosConCambiosInvitados.length > 0;

  const personalLogisticaModificado = tienenCambiosPersonalLogistica(
    personalLogistica,
    personalLogisticaInicial,
  );

  const soloCamposGeneralesModificados = Boolean(
    datosGenerales &&
    datosGeneralesIniciales &&
    (datosGenerales.nombre !== datosGeneralesIniciales.nombre ||
      datosGenerales.descripcion !== datosGeneralesIniciales.descripcion ||
      datosGenerales.justificacion !== datosGeneralesIniciales.justificacion ||
      datosGenerales.idAlcance !== datosGeneralesIniciales.idAlcance ||
      Boolean(archivoPoster)),
  );

  const cambiosGenerales = Boolean(
    soloCamposGeneralesModificados ||
    invitadosModificados ||
    personalLogisticaModificado,
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

  const actividadesEliminadasConReservas = (evento?.subEventos ?? []).filter(
    (s) =>
      s.estado !== EstadoSubEvento.CANCELADO &&
      (s.boletosEmitidos ?? 0) > 0 &&
      !actividades.some((a) => a.idSubEvento === s.idSubEvento),
  );
  const avisoImpactoEliminacion =
    actividadesEliminadasConReservas.length > 0
      ? `Se eliminarán actividades con registros activos (${actividadesEliminadasConReservas
          .map((s) => `${s.nombre}: ${s.boletosEmitidos}`)
          .join(
            ", ",
          )}). Si Subdirección aprueba el cambio, esos boletos se cancelarán y se notificará a los asistentes.`
      : null;

  const impactosPorActividad = useMemo(() => {
    const mapa = new Map<string, ImpactoCambioSubevento>();
    for (const act of actividades) {
      if (act.idSubEvento === undefined || !act.idRecinto) continue;
      const subOriginal = evento?.subEventos.find(
        (s) => s.idSubEvento === act.idSubEvento,
      );
      if (!subOriginal || (subOriginal.boletosEmitidos ?? 0) <= 0) continue;

      const recintoDest =
        recintos.find((r) => String(r.idRecinto) === act.idRecinto) ??
        subOriginal.recinto;
      const impacto = calcularImpactoCambioSubevento({
        idSubEvento: subOriginal.idSubEvento,
        nombreSubEvento: act.nombre.trim() || subOriginal.nombre,
        inscritosActivos: subOriginal.boletosEmitidos ?? 0,
        aforoDestino: recintoDest?.aforo ?? 0,
        idRecintoOrigen: subOriginal.recinto?.idRecinto ?? 0,
        idRecintoDestino: Number(act.idRecinto) || 0,
        modalidadOrigen: subOriginal.idModalidadAcceso,
        modalidadDestino: act.idModalidadAcceso,
      });

      if (impacto && impacto.resumenTexto) {
        mapa.set(act.llave, impacto);
      }
    }
    return mapa;
  }, [actividades, evento, recintos]);

  const partesAvisoImpacto = [
    ...(avisoImpactoEliminacion ? [avisoImpactoEliminacion] : []),
    ...Array.from(impactosPorActividad.values()).map(
      (imp) => `${imp.nombreSubEvento}: ${imp.resumenTexto}`,
    ),
  ];
  const avisoImpactoTotal =
    partesAvisoImpacto.length > 0 ? partesAvisoImpacto.join(" ") : null;

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
        } else if (act.fecha < fechaManana) {
          err.fecha = "La fecha debe ser a partir de mañana";
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

        if (act.fecha && act.idRecinto && act.horaInicio && act.horaFin) {
          const hayConflicto = listaActividades.some(
            (otra, oIdx) =>
              oIdx !== idx &&
              otra.fecha === act.fecha &&
              otra.idRecinto === act.idRecinto &&
              otra.horaInicio &&
              otra.horaFin &&
              seTraslapan(
                act.horaInicio,
                act.horaFin,
                otra.horaInicio,
                otra.horaFin,
              ),
          );
          if (hayConflicto) {
            err.horaInicio =
              "El horario se traslapa con otra actividad en el mismo espacio y fecha";
          }
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
        idModalidadAcceso: ModalidadAcceso.ACCESO_LIBRE,
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
    let erroresDiferidos: string[] = [];
    const invitadosFallidosPorSubevento: Record<number, InvitadoEventoItem[]> =
      {};

    try {
      if (soloCamposGeneralesModificados) {
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

      const alcanceFinal =
        datosGenerales.idAlcance !== ""
          ? datosGenerales.idAlcance
          : evento.idAlcance;
      const sincronizarInvitados =
        invitadosModificados && alcanceFinal === AlcanceEvento.PRIVADO;

      if (sincronizarInvitados) {
        for (let i = 0; i < subeventosConCambiosInvitados.length; i += 1) {
          const idSub = subeventosConCambiosInvitados[i];
          const resultadoSync = await sincronizarInvitadosYLogistica({
            idEvento,
            idSubEvento: idSub,
            invitadosActuales: invitadosPorSubevento[idSub] ?? [],
            invitadosIniciales: invitadosInicialesPorSubevento[idSub] ?? [],
            personalActual:
              i === 0 && personalLogisticaModificado ? personalLogistica : [],
            personalInicial:
              i === 0 && personalLogisticaModificado
                ? personalLogisticaInicial
                : [],
          });
          if (resultadoSync.huboCambiosAplicados) {
            generalesGuardados = true;
          }
          erroresDiferidos = [...erroresDiferidos, ...resultadoSync.errores];
          if (resultadoSync.invitadosNuevosFallidos.length > 0) {
            invitadosFallidosPorSubevento[idSub] =
              resultadoSync.invitadosNuevosFallidos;
          }
        }
      } else if (personalLogisticaModificado) {
        const resultadoSync = await sincronizarInvitadosYLogistica({
          idEvento,
          invitadosActuales: [],
          invitadosIniciales: [],
          personalActual: personalLogistica,
          personalInicial: personalLogisticaInicial,
        });
        if (resultadoSync.huboCambiosAplicados) {
          generalesGuardados = true;
        }
        erroresDiferidos = resultadoSync.errores;
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
      const mapaServidor = Object.fromEntries(
        detalleActualizado.subEventos.map((sub) => [
          sub.idSubEvento,
          (sub.invitados ?? []).map((inv) => ({
            ...inv,
            idSubEvento: inv.idSubEvento ?? sub.idSubEvento,
          })),
        ]),
      );
      const mapaConFallidos = Object.fromEntries(
        detalleActualizado.subEventos.map((sub) => [
          sub.idSubEvento,
          [
            ...(mapaServidor[sub.idSubEvento] ?? []),
            ...(invitadosFallidosPorSubevento[sub.idSubEvento] ?? []),
          ],
        ]),
      );
      setInvitadosPorSubevento(mapaConFallidos);
      setInvitadosInicialesPorSubevento(mapaServidor);
      setPersonalLogistica(detalleActualizado.personalLogistica ?? []);
      setPersonalLogisticaInicial(detalleActualizado.personalLogistica ?? []);
      const listaActividades = obtenerActividades(detalleActualizado);
      setActividades(listaActividades);
      setActividadesIniciales(listaActividades);
      setMotivo("");
      setMotivoUrgente("");
      setIntentoGuardar(false);
      setIntentoMotivo(false);

      if (erroresDiferidos.length > 0) {
        setError(erroresDiferidos.join(". "));
      } else {
        setMensaje(
          logisticaEnviada
            ? esSubdireccion
              ? "Los cambios se aplicaron directamente con éxito."
              : generalesGuardados
                ? "La información general se guardó y la modificación de actividades fue enviada a revisión."
                : "La modificación de actividades fue enviada a revisión de Subdirección."
            : "Los cambios se guardaron correctamente.",
        );
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    setMotivo("");
    setMotivoUrgente("");
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
    <section className="mx-auto w-full min-w-0 max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-10 lg:px-8">
      {mostrarModalRegreso && (
        <Modal
          mostrarModal={mostrarModalRegreso}
          titulo="Advertencia"
          contenido="¿Estás seguro que deseas regresar? Los cambios realizados se perderán"
          cerrarModal={() => setMostrarModalRegreso(false)}
        >
          <div className="flex justify-end gap-3">
            <Button
              text="Cancelar"
              variant="secondary"
              type="button"
              onClick={() => setMostrarModalRegreso(false)}
            />
            <Button
              text="Aceptar"
              variant="success"
              type="button"
              onClick={() =>
                navigate(
                  `/organizador/administrar-evento-subeventos/${idEvento}`,
                )
              }
            />
          </div>
        </Modal>
      )}

      <div id="contenedorTituloBanner" className="space-y-4 sm:space-y-5">
        <PageHeader
          title="Modificar detalles de evento"
          back={{
            to: `/organizador/administrar-evento-subeventos/${idEvento}`,
            label: "Volver a detalles de mi evento",
            onClick: (e) => {
              if (cambiosGenerales || cambiosActividades) {
                e.preventDefault();
                setMostrarModalRegreso(true);
              }
            },
          }}
        />
        {(previewPosterUrl ?? evento?.posterUrl) && evento && (
          <EventBanner
            eventName={datosGenerales?.nombre ?? evento.nombre}
            posterUrl={previewPosterUrl ?? evento.posterUrl}
          />
        )}
      </div>

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
          className="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-5 shadow-md"
        >
          <div className="flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold sm:text-lg">
                Modificación logística pendiente de evaluación por Subdirección
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
            {evento.solicitudModificacionPendiente.motivoModificacion}
          </div>
          <div className="space-y-2 text-justify">
            <hr className="text-gray-400" />
            <p className="text-xs ">
              Mientras Subdirección dictamina esta solicitud, el evento conserva
              vigentes sus fechas y espacios originales. Si realizas otro cambio
              logístico, se actualizará esta misma solicitud sin generar
              duplicados.
            </p>
          </div>
        </div>
      )}

      {datosGenerales && (
        <form
          data-editar-evento-subeventos
          onSubmit={manejarEnvio}
          className="w-full min-w-0 space-y-8"
        >
          <fieldset
            disabled={guardando}
            className="w-full min-w-0 space-y-8 border-0 p-0"
          >
            <section
              id="sectionEventos"
              className="space-y-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6 sm:shadow-md"
            >
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                <div className="w-full min-w-0">
                  <FormField
                    className="!font-bold !text-black"
                    label="Banner del evento"
                    tooltip={TOOLTIP_BANNER_EVENTO}
                    mensajeAyuda="Resolución: 2048 x 1152"
                  >
                    <InputFile
                      id="campoPoster"
                      accept=".jpg"
                      disabled={guardando}
                      className=""
                      onChange={(event) =>
                        setArchivoPoster(event.currentTarget.files?.[0] ?? null)
                      }
                    />
                  </FormField>
                </div>
                <div
                  id="contenedorAlcance"
                  className="w-full min-w-0 sm:max-w-xs"
                >
                  <FormField
                    label="Alcance"
                    htmlFor="campoAlcance"
                    className="!font-bold !text-black"
                    tooltipLabel="Información sobre el alcance del evento"
                    tooltip={TOOLTIP_ALCANCE_EVENTO}
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
                <FormField
                  label="Nombre del evento"
                  className="!font-bold !text-black"
                  editable
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
                <FormField
                  label="Descripción del evento"
                  className="!font-bold !text-black"
                  editable
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
                <FormField
                  label="Beneficio politécnico"
                  className="!font-bold !text-black"
                  editable
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
                cerrarModal={() => setPersonalAEliminar(null)}
              >
                <div className="space-y-4">
                  <p className="text-gray-700">
                    ¿Estás seguro que deseas eliminar al personal{" "}
                    <strong className="text-gray-900">
                      {personalAEliminar.correo}
                    </strong>
                    ? El cambio se aplicará al guardar los cambios.
                  </p>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      text="Cancelar"
                      variant="secondary"
                      type="button"
                      onClick={() => setPersonalAEliminar(null)}
                    />
                    <Button
                      text="Eliminar"
                      variant="danger"
                      type="button"
                      onClick={confirmarEliminarPersonalLogistica}
                    />
                  </div>
                </div>
              </Modal>
            )}

            <div id="contenedorLogistica" className="space-y-7 pt-2">
              <h3 className="text-lg font-bold sm:text-xl md:text-2xl">
                Personal de logística del evento
              </h3>
              {personalLogistica.length > 0 ? (
                <div className="w-full max-w-full overflow-x-auto rounded-md border border-gray-200 shadow-sm lg:w-150">
                  <Table
                    columnas={columnasLogistica}
                    filas={personalLogistica}
                    obtenerClave={(personal) => personal.idUsuario}
                    encabezadoClassName="h-10 border-b border-gray-300"
                    filaClassName="h-12"
                    className="w-full min-w-full bg-white text-left text-sm [&_th]:py-2 [&_td]:py-2"
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
                className="w-fit sm:w-auto"
                onClick={() => {
                  navigate(
                    `/organizador/administrar-evento/${idEvento}/agregar-logistica`,
                    {
                      state: {
                        returnTo: `/organizador/editar-evento-subeventos/${idEvento}`,
                      },
                    },
                  );
                }}
              />
            </div>

            {subeventoModalInvitados !== null &&
              (() => {
                const actividadModal = actividades.find(
                  (a) => a.idSubEvento === subeventoModalInvitados,
                );
                const recintoModal = recintos.find(
                  (r) => String(r.idRecinto) === actividadModal?.idRecinto,
                );
                const invitadosActualesModal =
                  invitadosPorSubevento[subeventoModalInvitados] ?? [];

                return (
                  <ModalInvitados
                    mostrarModal={subeventoModalInvitados !== null}
                    idEvento={idEvento}
                    idSubEvento={subeventoModalInvitados}
                    numeroInvitados={invitadosActualesModal.length}
                    foroRecinto={recintoModal?.aforo}
                    correosExistentes={invitadosActualesModal.map(
                      (i) => i.correo,
                    )}
                    cerrarModal={() => setSubeventoModalInvitados(null)}
                    guardar={handleGuardarInvitados}
                    onEnvioCompletado={(exitosos) => {
                      const idSub = subeventoModalInvitados;
                      const fusionar = (prev: InvitadoEventoItem[]) => {
                        const existentes = new Set(
                          prev.map((i) => normalizarCorreo(i.correo)),
                        );
                        const nuevos = exitosos
                          .map((ex) => ({
                            ...ex,
                            idSubEvento: ex.idSubEvento ?? idSub,
                          }))
                          .filter(
                            (ex) =>
                              !existentes.has(normalizarCorreo(ex.correo)),
                          );
                        return nuevos.length > 0 ? [...prev, ...nuevos] : prev;
                      };
                      setInvitadosPorSubevento((prev) => ({
                        ...prev,
                        [idSub]: fusionar(prev[idSub] ?? []),
                      }));
                      setInvitadosInicialesPorSubevento((prev) => ({
                        ...prev,
                        [idSub]: fusionar(prev[idSub] ?? []),
                      }));
                    }}
                  />
                );
              })()}

            {invitadoAEliminar && (
              <Modal
                mostrarModal={Boolean(invitadoAEliminar)}
                titulo="Confirmar eliminación"
                cerrarModal={() => setInvitadoAEliminar(null)}
              >
                <div className="space-y-4">
                  <p className="text-gray-700">
                    ¿Estás seguro de que deseas eliminar al invitado{" "}
                    <strong className="text-gray-900">
                      {invitadoAEliminar.correo}
                    </strong>
                    ? Al guardar los cambios se revocará su acceso a este evento
                    privado y, si ya había reservado boleto, este será
                    cancelado.
                  </p>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      text="Cancelar"
                      variant="secondary"
                      type="button"
                      onClick={() => setInvitadoAEliminar(null)}
                    />
                    <Button
                      text="Eliminar"
                      variant="danger"
                      type="button"
                      onClick={confirmarEliminarInvitado}
                    />
                  </div>
                </div>
              </Modal>
            )}

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
                    idModalidadAcceso: actividad.idModalidadAcceso,
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
                    <div key={actividad.llave} className="space-y-3">
                      <OrganizerSubeventCard
                        idEvento={Number(idEvento)}
                        subevento={subevento}
                        onCancel={(motivoCancelacion) => {
                          setMotivo(motivoCancelacion);
                          quitarActividad(actividad.llave);
                        }}
                      />
                    </div>
                  );
                }

                const errorAct = intentoGuardar
                  ? erroresActividades[actividad.llave]
                  : undefined;
                const impactoActividad = impactosPorActividad.get(
                  actividad.llave,
                );

                return (
                  <FilaActividadEditable
                    key={actividad.llave}
                    actividad={actividad}
                    indice={indice}
                    minFecha={minFecha}
                    maxFecha={maxFecha}
                    primeraFecha={primeraFecha}
                    errorAct={errorAct}
                    recintos={recintos}
                    otrasActividades={actividades}
                    actualizarActividad={actualizarActividad}
                    quitarActividad={quitarActividad}
                    setModalEspacio={setModalEspacio}
                    impactoActividad={impactoActividad}
                    modalSubeventoAbierto={modalSubeventoAbierto}
                    setModalSubeventoAbierto={setModalSubeventoAbierto}
                  />
                );
              })}
            </section>
          </fieldset>

          {avisoImpactoEliminacion && (
            <FeedbackNotice
              variant="warning"
              title="Aviso de impacto en registros actuales"
            >
              {avisoImpactoEliminacion}
            </FeedbackNotice>
          )}

          <div
            id="contenedorBotones"
            className="w-full flex flex-col w-fit justify-end md:flex-row md:justify-end gap-2"
          >
            <Button
              text="Agregar actividad"
              variant="primary"
              type="button"
              className="whitespace-nowrap sm:w-auto"
              onClick={agregarActividad}
            />
            <Button
              text="Guardar cambios"
              variant="primary"
              type="submit"
              className="whitespace-nowrap sm:w-auto"
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
          avisoImpacto={avisoImpactoTotal}
          nombre={evento?.nombre}
          logistica={{ motivoModificacion: motivo } as any}
          onCerrar={() => {
            setMostrarModalMotivo(false);
            setMotivo("");
            setMotivoUrgente("");
          }}
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
          setMotivoUrgente("");
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
