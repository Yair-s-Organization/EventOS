import { Pencil } from "lucide-react";
import {
  AlcanceEvento,
  ETIQUETAS_MODALIDAD,
  ModalidadAcceso,
  esLaboratorioRecinto,
  modalidadPorDefectoRecinto,
  obtenerModalidadesPermitidasPorRecinto,
  RecintoId,
  validarModalidadEnRecinto,
  type Recinto,
} from "@eventos/shared";
import { Input } from "../../../components/atoms/Input/Input";
import { DateInput } from "../../../components/atoms/DateInput/DateInput";
import { Select } from "../../../components/atoms/Select/Select";
import { TextArea } from "../../../components/atoms/TextArea/TextArea";
import { InputFile } from "../../../components/atoms/InputFile/InputFile";
import { FeedbackNotice } from "../../../components/molecules/FeedbackNotice";
import {
  TOOLTIP_ALCANCE_EVENTO,
  TOOLTIP_BANNER_EVENTO,
} from "../../../components/molecules/EventoTooltipsContent";
import { FormField } from "../../../components/molecules/FormField";
import { ModalidadAccesoHelp } from "../../../components/molecules/ModalidadAccesoHelp";

const ALCANCES = [
  { value: String(AlcanceEvento.PUBLICO), label: "Público" },
  { value: String(AlcanceEvento.INTERNO), label: "Interno" },
  { value: String(AlcanceEvento.PRIVADO), label: "Privado" },
];

const HORASINICIO = [
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
];

const HORASFIN = [
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
];

const opcionesHora = (horas: string[], horaActual: string) => {
  const valores = [...new Set([...horas, horaActual].filter(Boolean))].sort();
  return valores.map((hora) => ({ value: hora, label: hora }));
};

function horaEnMinutos(hora: string): number {
  const [horas, minutos] = hora.slice(0, 5).split(":").map(Number);
  return horas * 60 + minutos;
}

function seTraslapa(
  horaInicio: string,
  horaFin: string,
  ocupado: HorarioOcupado,
): boolean {
  const inicio = horaEnMinutos(horaInicio);
  const fin = horaEnMinutos(horaFin);
  return (
    inicio < horaEnMinutos(ocupado.horaFin) &&
    fin > horaEnMinutos(ocupado.horaInicio)
  );
}

export interface HorarioOcupado {
  idEvento: number;
  idSubEvento?: number;
  horaInicio: string;
  horaFin: string;
}

function puedeTerminarEn(
  horaInicio: string,
  horaFin: string,
  agendaOcupada: HorarioOcupado[],
): boolean {
  return (
    horaEnMinutos(horaFin) > horaEnMinutos(horaInicio) &&
    !agendaOcupada.some((ocupado) => seTraslapa(horaInicio, horaFin, ocupado))
  );
}

function obtenerHorasInicioDisponibles(
  horaInicioActual: string,
  horaFinActual: string,
  agendaOcupada: HorarioOcupado[],
) {
  const horasFinCandidatas = [
    ...new Set([...HORASFIN, horaFinActual].filter(Boolean)),
  ];
  return opcionesHora(HORASINICIO, horaInicioActual).filter(
    ({ value }) =>
      !agendaOcupada.some(
        (ocupado) =>
          horaEnMinutos(value) >= horaEnMinutos(ocupado.horaInicio) &&
          horaEnMinutos(value) < horaEnMinutos(ocupado.horaFin),
      ) &&
      horasFinCandidatas.some((horaFin) =>
        puedeTerminarEn(value, horaFin, agendaOcupada),
      ),
  );
}

export function ajustarHorarioSegunAgenda(
  horaInicio: string,
  horaFin: string,
  agendaOcupada: HorarioOcupado[],
): { horaInicio: string; horaFin: string } {
  if (!horaInicio) {
    return { horaInicio: "", horaFin: "" };
  }

  const iniciosDisponibles = obtenerHorasInicioDisponibles(
    horaInicio,
    horaFin,
    agendaOcupada,
  );
  const inicioValido = iniciosDisponibles.some(
    (opcion) => opcion.value === horaInicio,
  );
  if (!inicioValido) {
    return { horaInicio: "", horaFin: "" };
  }

  const finValido =
    Boolean(horaFin) && puedeTerminarEn(horaInicio, horaFin, agendaOcupada);
  return {
    horaInicio,
    horaFin: finValido ? horaFin : "",
  };
}

function sumarDias(fechaStr: string, dias: number): string {
  if (!fechaStr) return "";
  const [y, m, d] = fechaStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + dias);
  return date.toISOString().split("T")[0];
}

const fechaHoy = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Mexico_City",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const fechaMinima = sumarDias(fechaHoy, 1);

const anioActual = new Date().getFullYear();
const FECHA_FIN_SEMESTRE = `${anioActual}-12-19`;

export interface EditLogisticsValues {
  idRecinto: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  idModalidadAcceso: string;
  motivoModificacion: string;
}

export interface EditLogisticsErrors {
  idRecinto?: string;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
}

interface EditLogisticsSectionProps {
  valores: EditLogisticsValues;
  alcance: AlcanceEvento | "";
  justificacion: string;
  posterUrl: string | null;
  archivoPoster: File | null;
  recintos: Recinto[];
  recintoActual: Recinto | null;
  errorRecintos: string | null;
  agendaOcupada: HorarioOcupado[];
  cargandoAgenda: boolean;
  errorAgenda: string | null;
  deshabilitado: boolean;
  mostrarBanner?: boolean;
  avisoImpacto?: string | null;
  errores?: EditLogisticsErrors;
  intentoGuardar?: boolean;
  onCambioLogistica: <K extends keyof EditLogisticsValues>(
    campo: K,
    valor: EditLogisticsValues[K],
  ) => void;
  onCambioAlcance: (alcance: AlcanceEvento) => void;
  onCambioJustificacion: (justificacion: string) => void;
  onCambioPoster: (archivo: File | null) => void;
}

export function EditLogisticsSection({
  valores,
  alcance,
  justificacion,
  posterUrl,
  archivoPoster,
  recintos,
  recintoActual,
  errorRecintos,
  agendaOcupada,
  cargandoAgenda,
  errorAgenda,
  deshabilitado,
  mostrarBanner = true,
  avisoImpacto = null,
  errores,
  intentoGuardar = false,
  onCambioLogistica,
  onCambioAlcance,
  onCambioJustificacion,
  onCambioPoster,
}: EditLogisticsSectionProps) {
  const opcionesRecinto = [...recintos];
  if (
    recintoActual &&
    !opcionesRecinto.some(
      (recinto) => recinto.idRecinto === recintoActual.idRecinto,
    )
  ) {
    opcionesRecinto.push(recintoActual);
  }
  if (
    valores.idRecinto &&
    !opcionesRecinto.some(
      (recinto) => String(recinto.idRecinto) === valores.idRecinto,
    )
  ) {
    opcionesRecinto.push({
      idRecinto: Number(valores.idRecinto),
      nombre: `Espacio propuesto (${valores.idRecinto})`,
      aforo: 0,
    });
  }

  const recintoSeleccionado =
    opcionesRecinto.find(
      (recinto) => String(recinto.idRecinto) === valores.idRecinto,
    ) ?? recintoActual;

  const idRecintoSeleccionado =
    recintoSeleccionado?.idRecinto ?? RecintoId.AUDITORIO;
  const modalidadesPermitidas = obtenerModalidadesPermitidasPorRecinto(
    idRecintoSeleccionado,
  );
  const accesoFijo = esLaboratorioRecinto(recintoSeleccionado?.idRecinto);

  const horasInicioDisponibles =
    cargandoAgenda || errorAgenda || !valores.idRecinto || !valores.fecha
      ? []
      : obtenerHorasInicioDisponibles(
          valores.horaInicio,
          valores.horaFin,
          agendaOcupada,
        );
  const horasFinDisponibles =
    !cargandoAgenda &&
    !errorAgenda &&
    valores.idRecinto &&
    valores.fecha &&
    valores.horaInicio
      ? opcionesHora(HORASFIN, valores.horaFin).filter(({ value }) =>
          puedeTerminarEn(valores.horaInicio, value, agendaOcupada),
        )
      : [];
  const horaFinInvalida = Boolean(
    valores.horaInicio &&
    valores.horaFin &&
    valores.horaInicio >= valores.horaFin,
  );

  return (
    <div id="contenedorDerecha" className="w-full h-full min-w-0 space-y-4">
      <article className="grid min-w-0 h-full content-start grid-cols-1 gap-x-6 gap-y-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6">
        {mostrarBanner && (
          <div className="flex min-w-0 flex-col gap-2">
            <FormField
              className="!font-bold !text-black"
              label="Banner del evento"
              tooltip={TOOLTIP_BANNER_EVENTO}
              mensajeAyuda="Resolución: 2048 x 1152 y en formato .jpg"
            >
              <InputFile
                key={posterUrl ?? "poster"}
                id="campoPoster"
                accept=".jpg"
                disabled={deshabilitado}
                onChange={(event) =>
                  onCambioPoster(event.currentTarget.files?.[0] ?? null)
                }
              />
            </FormField>
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-2">
          <FormField
            className="!font-bold !text-black"
            label="Espacio"
            tooltipLabel="Información del espacio seleccionado"
            tooltip={
              <ModalidadAccesoHelp
                idRecinto={recintoSeleccionado?.idRecinto}
                emptyText="Selecciona un espacio para consultar las modalidades de acceso disponibles según el recinto."
                embedded
              />
            }
            errorMessage={intentoGuardar ? errores?.idRecinto : undefined}
          >
            <Select
              id="campoEspacio"
              placeholder="Selecciona una opción"
              options={opcionesRecinto.map((recinto) => ({
                value: String(recinto.idRecinto),
                label: recinto.nombre,
              }))}
              value={valores.idRecinto}
              disabled={deshabilitado || Boolean(errorRecintos)}
              hasError={Boolean(intentoGuardar && errores?.idRecinto)}
              onChange={(event) => {
                const idRecinto = Number(event.currentTarget.value);
                onCambioLogistica("idRecinto", String(idRecinto));
                const permitidas =
                  obtenerModalidadesPermitidasPorRecinto(idRecinto);
                const modalidadActual = Number(
                  valores.idModalidadAcceso,
                ) as ModalidadAcceso;
                if (
                  !permitidas.includes(modalidadActual) ||
                  validarModalidadEnRecinto(idRecinto, modalidadActual) !== null
                ) {
                  onCambioLogistica(
                    "idModalidadAcceso",
                    String(
                      esLaboratorioRecinto(idRecinto)
                        ? ModalidadAcceso.QR_GENERAL
                        : modalidadPorDefectoRecinto(idRecinto, true),
                    ),
                  );
                }
              }}
            />
          </FormField>
          {errorRecintos && (
            <p role="alert" className="text-sm text-red-700">
              No se pudieron cargar los espacios disponibles: {errorRecintos}
            </p>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <FormField
            className="!font-bold !text-black"
            label="Fecha"
            errorMessage={intentoGuardar ? errores?.fecha : undefined}
          >
            <DateInput
              id="campoFecha"
              value={valores.fecha}
              min={fechaMinima}
              max={FECHA_FIN_SEMESTRE}
              disabled={deshabilitado}
              hasError={Boolean(intentoGuardar && errores?.fecha)}
              onValueChange={(fecha) => {
                onCambioLogistica("fecha", fecha);
              }}
            />
          </FormField>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <FormField
            className="!font-bold !text-black"
            label="Hora inicio"
            errorMessage={intentoGuardar ? errores?.horaInicio : undefined}
          >
            <Select
              id="campoHoraInicio"
              options={horasInicioDisponibles}
              placeholder={
                cargandoAgenda
                  ? "Consultando horarios..."
                  : !valores.idRecinto || !valores.fecha
                    ? "Selecciona espacio y fecha"
                    : "Selecciona una opción"
              }
              value={valores.horaInicio}
              disabled={
                deshabilitado ||
                cargandoAgenda ||
                Boolean(errorAgenda) ||
                !valores.idRecinto ||
                !valores.fecha
              }
              hasError={Boolean(intentoGuardar && errores?.horaInicio)}
              onChange={(event) => {
                onCambioLogistica("horaFin", "");
                onCambioLogistica("horaInicio", event.currentTarget.value);
              }}
            />
          </FormField>
          {errorAgenda && (
            <span role="alert" className="text-sm text-red-700">
              No se pudo consultar la disponibilidad
            </span>
          )}
          {!cargandoAgenda &&
            !errorAgenda &&
            valores.idRecinto &&
            valores.fecha &&
            horasInicioDisponibles.length === 0 && (
              <p className="text-sm text-gray-600">
                No hay horarios de inicio disponibles para esta fecha y espacio.
              </p>
            )}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <FormField
            className="!font-bold !text-black"
            label="Hora de finalización"
            errorMessage={
              intentoGuardar && errores?.horaFin
                ? errores.horaFin
                : horaFinInvalida
                  ? "La hora de finalización debe ser posterior a la de inicio."
                  : undefined
            }
          >
            <Select
              id="campoHoraFin"
              options={horasFinDisponibles}
              placeholder={
                cargandoAgenda
                  ? "Consultando horarios..."
                  : !valores.idRecinto || !valores.fecha
                    ? "Selecciona espacio y fecha"
                    : "Selecciona una opción"
              }
              value={valores.horaFin}
              disabled={
                deshabilitado ||
                cargandoAgenda ||
                Boolean(errorAgenda) ||
                !valores.horaInicio
              }
              hasError={Boolean(
                horaFinInvalida || (intentoGuardar && errores?.horaFin),
              )}
              onChange={(event) =>
                onCambioLogistica("horaFin", event.currentTarget.value)
              }
            />
          </FormField>
          {!cargandoAgenda &&
            !errorAgenda &&
            valores.horaInicio &&
            valores.idRecinto &&
            valores.fecha &&
            horasFinDisponibles.length === 0 && (
              <p className="text-sm text-gray-600">
                No hay horarios de finalización disponibles para este inicio.
              </p>
            )}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <FormField
            label="Modalidad de acceso"
            htmlFor="campoAcceso"
            className="!font-bold !text-black"
            tooltipLabel="Información de modalidad de acceso"
            tooltip={
              <ModalidadAccesoHelp
                idModalidadAcceso={
                  valores.idModalidadAcceso
                    ? (Number(valores.idModalidadAcceso) as ModalidadAcceso)
                    : undefined
                }
                emptyText="Selecciona una modalidad para ver cómo funcionará el registro y el acceso al evento."
                embedded
              />
            }
          >
            <Select
              id="campoAcceso"
              placeholder="Selecciona una opción"
              options={modalidadesPermitidas.map((modalidad) => ({
                value: String(modalidad),
                label: ETIQUETAS_MODALIDAD[modalidad],
              }))}
              value={valores.idModalidadAcceso}
              disabled={deshabilitado || accesoFijo}
              onChange={(event) =>
                onCambioLogistica(
                  "idModalidadAcceso",
                  event.currentTarget.value,
                )
              }
            />
          </FormField>
        </div>
        {mostrarBanner && (
          <div className="flex min-w-0 flex-col gap-2">
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
                value={alcance === "" ? "" : String(alcance)}
                disabled={deshabilitado}
                onChange={(event) => {
                  const valor = Number(event.currentTarget.value);
                  if (
                    valor === AlcanceEvento.PUBLICO ||
                    valor === AlcanceEvento.INTERNO ||
                    valor === AlcanceEvento.PRIVADO
                  ) {
                    onCambioAlcance(valor);
                  }
                }}
              />
            </FormField>
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor="campoAforo" className="font-bold">
            Aforo del espacio
          </label>
          <Input
            id="campoAforo"
            value={
              recintoSeleccionado?.aforo
                ? recintoSeleccionado.aforo
                : "No disponible"
            }
            disabled
            aria-label="Aforo máximo del espacio seleccionado"
          />
        </div>
        {mostrarBanner && (
          <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
            <div className="relative">
              <FormField
                label="Beneficio politécnico"
                className="!font-bold !text-black"
                editable
                errorMessage={
                  intentoGuardar
                    ? !justificacion.trim()
                      ? "La justificación debe ser obligatoria"
                      : justificacion.trim().length >= 500
                        ? "La justificación no puede exceder los 500 caracteres"
                        : undefined
                    : undefined
                }
              >
                <TextArea
                  id="campoJustificacion"
                  value={justificacion}
                  maxLength={500}
                  disabled={deshabilitado}
                  hasError={Boolean(
                    intentoGuardar &&
                    (!justificacion.trim() ||
                      justificacion.trim().length >= 500),
                  )}
                  onChange={(event) =>
                    onCambioJustificacion(event.currentTarget.value)
                  }
                  className="resize-none pr-10 h-30"
                />
              </FormField>
            </div>
          </div>
        )}
        {avisoImpacto && (
          <div className="sm:col-span-2">
            <FeedbackNotice
              variant="warning"
              title="Aviso de impacto en registros actuales"
            >
              {avisoImpacto}
            </FeedbackNotice>
          </div>
        )}
      </article>
    </div>
  );
}
