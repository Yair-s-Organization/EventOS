import { Pencil } from "lucide-react";
import { AlcanceEvento, RecintoId, type Recinto } from "@eventos/shared";
import { Input } from "../../../components/atoms/Input/Input";
import { DateInput } from "../../../components/atoms/DateInput/DateInput";
import { Select } from "../../../components/atoms/Select/Select";
import { TextArea } from "../../../components/atoms/TextArea/TextArea";
import { InputFile } from "../../../components/atoms/InputFile/InputFile";
import { FormField } from "../../../components/molecules/FormField";

const ACCESOS = [
  { value: "true", label: "Acceso con boleto" },
  { value: "false", label: "Acceso libre" },
];

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
  horaInicio: string;
  horaFin: string;
}

const fechaMinima = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Mexico_City",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const anioActual = new Date().getFullYear();
const FECHA_FIN_SEMESTRE = `${anioActual}-12-19`;

export interface EditLogisticsValues {
  idRecinto: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  accesoQR: string;
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

  const accesoFijo =
    Boolean(recintoSeleccionado?.idRecinto) &&
    recintoSeleccionado?.idRecinto !== RecintoId.AUDITORIO;

  const horasFinCandidatas = [
    ...new Set([...HORASFIN, valores.horaFin].filter(Boolean)),
  ];
  const puedeTerminarEn = (horaInicio: string, horaFin: string): boolean =>
    horaEnMinutos(horaFin) > horaEnMinutos(horaInicio) &&
    !agendaOcupada.some((ocupado) => seTraslapa(horaInicio, horaFin, ocupado));

  const horasInicioDisponibles =
    cargandoAgenda || errorAgenda || !valores.idRecinto || !valores.fecha
      ? []
      : opcionesHora(HORASINICIO, valores.horaInicio).filter(
        ({ value }) =>
          !agendaOcupada.some(
            (ocupado) =>
              horaEnMinutos(value) >= horaEnMinutos(ocupado.horaInicio) &&
              horaEnMinutos(value) < horaEnMinutos(ocupado.horaFin),
          ) &&
          horasFinCandidatas.some((horaFin) =>
            puedeTerminarEn(value, horaFin),
          ),
      );
  const horasFinDisponibles =
    !cargandoAgenda &&
      !errorAgenda &&
      valores.idRecinto &&
      valores.fecha &&
      valores.horaInicio
      ? opcionesHora(HORASFIN, valores.horaFin).filter(({ value }) =>
        puedeTerminarEn(valores.horaInicio, value),
      )
      : [];
  const horaFinInvalida = Boolean(
    valores.horaInicio &&
    valores.horaFin &&
    valores.horaInicio >= valores.horaFin,
  );

  return (
    <div id="contenedorDerecha" className="w-full min-w-0 space-y-4">
      <article className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6">
        {mostrarBanner && (
          <div className="flex min-w-0 flex-col gap-2">
            <FormField
              className="!font-bold !text-black"
              label="Banner del evento"
              mensajeAyuda="Resolución: 2048 x 1152">
              <InputFile
                key={archivoPoster?.name ?? posterUrl ?? "poster"}
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
            errorMessage={intentoGuardar ? errores?.idRecinto : undefined}>
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
                if (String(idRecinto) !== valores.idRecinto) {
                  onCambioLogistica("horaInicio", "");
                  onCambioLogistica("horaFin", "");
                }
                onCambioLogistica("idRecinto", String(idRecinto));
                if (
                  idRecinto !== RecintoId.AUDITORIO &&
                  idRecinto !== RecintoId.SALA_14
                ) {
                  onCambioLogistica("accesoQR", "true");
                } else if (idRecinto === RecintoId.SALA_14) {
                  onCambioLogistica("accesoQR", "false");
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
            errorMessage={intentoGuardar ? errores?.fecha : undefined}>
            <DateInput
              id="campoFecha"
              value={valores.fecha}
              min={fechaMinima}
              max={FECHA_FIN_SEMESTRE}
              disabled={deshabilitado}
              hasError={Boolean(intentoGuardar && errores?.fecha)}
              onValueChange={(fecha) => {
                if (fecha !== valores.fecha) {
                  onCambioLogistica("horaInicio", "");
                  onCambioLogistica("horaFin", "");
                }
                onCambioLogistica("fecha", fecha);
              }}
            />
          </FormField>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <FormField
            className="!font-bold !text-black"
            label="Hora inicio"
            errorMessage={intentoGuardar ? errores?.horaInicio : undefined}>
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
            }>
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
            label="Acceso"
            className="!font-bold !text-black"
            mensajeAyuda={
              recintoSeleccionado?.idRecinto === RecintoId.SALA_14
                ? "Al elegir la sala 14 el acceso es libre"
                : recintoSeleccionado?.idRecinto !== RecintoId.AUDITORIO &&
                  Boolean(recintoSeleccionado?.idRecinto)
                  ? "Al elegir un laboratorio el acceso es con boleto"
                  : ""
            }>
            <Select
              id="campoAcceso"
              placeholder="Selecciona una opción"
              options={ACCESOS}
              value={valores.accesoQR}
              disabled={deshabilitado || accesoFijo}
              onChange={(event) =>
                onCambioLogistica("accesoQR", event.currentTarget.value)
              }
            />
          </FormField>
        </div>
        {mostrarBanner && (
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="campoAlcance" className="font-bold">
              Alcance
            </label>
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
            <label htmlFor="campoJustificacion" className="font-bold">
              Beneficio politécnico
            </label>
            <div className="relative">
              <Pencil
                size={18}
                aria-hidden="true"
                className="absolute right-3 top-4 text-gray-500"
              />
              <FormField
                className="!font-bold !text-black"
                errorMessage={
                  intentoGuardar
                    ? !justificacion.trim()
                      ? "La justificación debe ser obligatoria"
                      : justificacion.trim().length >= 500
                        ? "La justificación no puede exceder los 500 caracteres"
                        : undefined
                    : undefined
                }>
                <TextArea
                  id="campoJustificacion"
                  value={justificacion}
                  maxLength={500}
                  disabled={deshabilitado}
                  hasError={
                    Boolean(
                      intentoGuardar &&
                      (!justificacion.trim() ||
                        justificacion.trim().length >= 500),
                    )
                  }
                  onChange={(event) =>
                    onCambioJustificacion(event.currentTarget.value)
                  }
                  className="resize-none pr-10 h-30"
                />
              </FormField>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
