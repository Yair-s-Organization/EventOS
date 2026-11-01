import { RecintoId } from "@eventos/shared";
import { FormField } from "../../molecules/FormField";
import { Select } from "../../atoms/Select/Select";
import type {
  CamposSubeventoTocados,
  CampoSubevento,
  SubeventoFormData,
  ErroresSubevento,
} from "../../../features/events/SolicitudEventos";
import Input from "../../atoms/Input/Input";
import Button from "../../atoms/Button/Button";
import { SpaceRequerimentsDialog } from "../../organisms/SpaceRequirementsDialog/SpaceRequerimentsDialog";
import { useState } from "react";
import { ModalSubevento } from "../ModalSubevento/ModalSubevento";

interface CardSubeventoBaseProps {
  subevento: SubeventoFormData;
  index: number;
  otrosSubeventos?: SubeventoFormData[];
  isDeleting?: boolean;
  nombreRecinto?: string;
}

type CardSubeventoProps = CardSubeventoBaseProps &
  (
    | { readOnly: true }
    | {
        readOnly?: false;
        errors: ErroresSubevento;
        touched: CamposSubeventoTocados;
        updateSubevento: (
          index: number,
          field: CampoSubevento,
          value: string,
        ) => void;
        markSubeventoTouched: (index: number, field: CampoSubevento) => void;
        onRemove: () => void;
        canRemove: boolean;
      }
  );

const ACCESOS = [
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

const RECINTOS = [
  { value: String(RecintoId.AUDITORIO), label: "Auditorio" },
  { value: String(RecintoId.SALA_14), label: "Sala 14" },
  { value: String(RecintoId.LABORATORIO_A), label: "Laboratorio 1104" },
  { value: String(RecintoId.LABORATORIO_B), label: "Laboratorio 1105" },
];

const HORASINICIO = [
  { value: "07:00", label: "7:00" },
  { value: "07:30", label: "7:30" },
  { value: "08:00", label: "8:00" },
  { value: "08:30", label: "8:30" },
  { value: "09:00", label: "9:00" },
  { value: "09:30", label: "9:30" },
  { value: "10:00", label: "10:00" },
  { value: "10:30", label: "10:30" },
  { value: "11:00", label: "11:00" },
  { value: "11:30", label: "11:30" },
  { value: "12:00", label: "12:00" },
  { value: "12:30", label: "12:30" },
  { value: "13:00", label: "13:00" },
  { value: "13:30", label: "13:30" },
  { value: "14:00", label: "14:00" },
  { value: "14:30", label: "14:30" },
  { value: "15:00", label: "15:00" },
  { value: "15:30", label: "15:30" },
  { value: "16:00", label: "16:00" },
  { value: "16:30", label: "16:30" },
  { value: "17:00", label: "17:00" },
  { value: "17:30", label: "17:30" },
  { value: "18:00", label: "18:00" },
  { value: "18:30", label: "18:30" },
  { value: "19:00", label: "19:00" },
  { value: "19:30", label: "19:30" },
  { value: "20:00", label: "20:00" },
  { value: "20:30", label: "20:30" },
  { value: "21:00", label: "21:00" },
];

const HORASFIN = [
  { value: "08:00", label: "8:00" },
  { value: "08:30", label: "8:30" },
  { value: "09:00", label: "9:00" },
  { value: "09:30", label: "9:30" },
  { value: "10:00", label: "10:00" },
  { value: "10:30", label: "10:30" },
  { value: "11:00", label: "11:00" },
  { value: "11:30", label: "11:30" },
  { value: "12:00", label: "12:00" },
  { value: "12:30", label: "12:30" },
  { value: "13:00", label: "13:00" },
  { value: "13:30", label: "13:30" },
  { value: "14:00", label: "14:00" },
  { value: "14:30", label: "14:30" },
  { value: "15:00", label: "15:00" },
  { value: "15:30", label: "15:30" },
  { value: "16:00", label: "16:00" },
  { value: "16:30", label: "16:30" },
  { value: "17:00", label: "17:00" },
  { value: "17:30", label: "17:30" },
  { value: "18:00", label: "18:00" },
  { value: "18:30", label: "18:30" },
  { value: "19:00", label: "19:00" },
  { value: "19:30", label: "19:30" },
  { value: "20:00", label: "20:00" },
  { value: "20:30", label: "20:30" },
  { value: "21:00", label: "21:00" },
  { value: "21:30", label: "21:30" },
  { value: "22:00", label: "22:00" },
];

function seTraslapan(
  horaInicio: string,
  horaFin: string,
  otraHoraInicio: string,
  otraHoraFin: string,
): boolean {
  return horaInicio < otraHoraFin && otraHoraInicio < horaFin;
}

export function CardSubevento(props: CardSubeventoProps) {
  const readOnly = props.readOnly === true;
  const errors = readOnly ? {} : props.errors;
  const touched = readOnly ? {} : props.touched;
  const { subevento, index } = props;
  const otrosSubeventos = (props.otrosSubeventos ?? []).filter(
    (otro) =>
      otro.fecha === subevento.fecha &&
      otro.idRecinto === subevento.idRecinto &&
      otro.horaInicio &&
      otro.horaFin,
  );
  const [mostrarModalEspacio, setMostrarModalEspacio] = useState(false);
  const [mostrarModalSubevento, setMostrarModalSubevento] = useState(false);

  const horaDisponible = (horaInicio: string, horaFin: string) =>
    !otrosSubeventos.some((otro) =>
      seTraslapan(horaInicio, horaFin, otro.horaInicio, otro.horaFin),
    );
  const horasInicioDisponibles = HORASINICIO.filter(({ value: horaInicio }) =>
    HORASFIN.some(
      ({ value: horaFin }) =>
        horaFin > horaInicio && horaDisponible(horaInicio, horaFin),
    ),
  );
  const horasFinDisponibles = HORASFIN.filter(
    ({ value: horaFin }) =>
      subevento.horaInicio &&
      horaFin > subevento.horaInicio &&
      horaDisponible(subevento.horaInicio, horaFin),
  );

  const fechaMinima = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 rounded-md bg-eventos-primary-light p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 lg:px-10 lg:py-8">
      <FormField
        label="Fecha"
        htmlFor={`selectFecha-${index}`}
        readOnly={readOnly}
        required
        errorMessage={touched.fecha ? errors.fecha : undefined}>
        <Input
          id={`selectFecha-${index}`}
          min={fechaMinima}
          type="date"
          value={subevento.fecha}
          disabled={readOnly}
          hasError={Boolean(touched.fecha && errors.fecha)}
          onChange={
            readOnly
              ? undefined
              : (e) => props.updateSubevento(index, "fecha", e.target.value)
          }
          onBlur={
            readOnly
              ? undefined
              : () => props.markSubeventoTouched(index, "fecha")
          }
        />
      </FormField>

      <FormField
        label="Hora inicio"
        htmlFor={`selectHoraInicio-${index}`}
        readOnly={readOnly}
        required
        errorMessage={touched.horaInicio ? errors.horaInicio : undefined}>
        <Select
          id={`selectHoraInicio-${index}`}
          placeholder="Selecciona la hora de inicio"
          options={horasInicioDisponibles}
          value={subevento.horaInicio}
          disabled={readOnly || !subevento.fecha || !subevento.idRecinto}
          hasError={Boolean(touched.horaInicio && errors.horaInicio)}
          onChange={
            readOnly
              ? undefined
              : (e) =>
                  props.updateSubevento(index, "horaInicio", e.target.value)
          }
          onBlur={
            readOnly
              ? undefined
              : () => props.markSubeventoTouched(index, "horaInicio")
          }
        />
      </FormField>

      <FormField
        label="Hora Fin"
        htmlFor={`selectHoraFinal-${index}`}
        readOnly={readOnly}
        required
        errorMessage={touched.horaFin ? errors.horaFin : undefined}>
        <Select
          id={`selectHoraFinal-${index}`}
          placeholder="Selecciona la hora final"
          options={horasFinDisponibles}
          value={subevento.horaFin}
          disabled={
            readOnly ||
            !subevento.fecha ||
            !subevento.idRecinto ||
            !subevento.horaInicio
          }
          hasError={Boolean(touched.horaFin && errors.horaFin)}
          onChange={
            readOnly
              ? undefined
              : (e) => props.updateSubevento(index, "horaFin", e.target.value)
          }
          onBlur={
            readOnly
              ? undefined
              : () => props.markSubeventoTouched(index, "horaFin")
          }
        />
      </FormField>

      <FormField
        label="Espacio deseado"
        htmlFor={`selectRecinto-${index}`}
        readOnly={readOnly}
        required
        errorMessage={touched.idRecinto ? errors.idRecinto : undefined}>
        <Select
          id={`selectRecinto-${index}`}
          placeholder="Selecciona un espacio"
          options={RECINTOS}
          value={subevento.idRecinto ? String(subevento.idRecinto) : ""}
          disabled={readOnly}
          hasError={Boolean(touched.idRecinto && errors.idRecinto)}
          onChange={
            readOnly
              ? undefined
              : (e) => props.updateSubevento(index, "idRecinto", e.target.value)
          }
          onBlur={
            readOnly
              ? undefined
              : () => props.markSubeventoTouched(index, "idRecinto")
          }
        />
      </FormField>

      <FormField
        label="Acceso con boleto"
        htmlFor={`selectBoleto-${index}`}
        readOnly={readOnly}
        required={subevento.idRecinto !== RecintoId.SALA_14}
        errorMessage={touched.accesoQR ? errors.accesoQR : undefined}
        mensajeAyuda={
          subevento.idRecinto === RecintoId.SALA_14
            ? "Al elegir la sala 14 automáticamente el acceso es libre"
            : subevento.idRecinto !== RecintoId.AUDITORIO &&
                subevento.idRecinto !== RecintoId.SALA_14
              ? "Al elegir un laboratorio el cupo pasa a ser limitado"
              : ""
        }>
        <Select
          id={`selectBoleto-${index}`}
          placeholder={"Selecciona una opción"}
          options={ACCESOS}
          className="disabled:text-gray-500 disabled:cursor-not-allowed"
          value={
            subevento.accesoQR !== undefined ? String(subevento.accesoQR) : ""
          }
          disabled={subevento.idRecinto !== RecintoId.AUDITORIO || readOnly}
          hasError={Boolean(touched.accesoQR && errors.accesoQR)}
          onChange={
            readOnly
              ? undefined
              : (e) => props.updateSubevento(index, "accesoQR", e.target.value)
          }
          onBlur={
            readOnly
              ? undefined
              : () => props.markSubeventoTouched(index, "accesoQR")
          }
        />
      </FormField>
      <FormField
        label={readOnly ? "Espacio" : undefined}
        htmlFor={readOnly ? `recintoDetalle-${index}` : undefined}
        readOnly={readOnly}>
        {readOnly && (
          <Input
            id={`recintoDetalle-${index}`}
            value={
              props.nombreRecinto ??
              RECINTOS.find(
                (recinto) => recinto.value === String(subevento.idRecinto),
              )?.label ??
              "No disponible"
            }
            disabled
          />
        )}
        {!readOnly && (
          <Button
            text="Ver detalles de espacio"
            type="button"
            disabled={
              subevento.idRecinto === RecintoId.SALA_14 ||
              subevento.idRecinto === RecintoId.AUDITORIO ||
              !subevento.idRecinto
            }
            className="w-full sm:w-auto"
            onClick={() => setMostrarModalEspacio(true)}
          />
        )}
      </FormField>
      <SpaceRequerimentsDialog
        mostrar={mostrarModalEspacio}
        laboratorio={
          RECINTOS.find(
            (recinto) => recinto.value === String(subevento.idRecinto),
          )?.label ?? "Espacio seleccionado"
        }
        id={subevento.idRecinto}
        cerrar={() => setMostrarModalEspacio(false)}
      />
      {!readOnly && (
        <div className="col-span-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            text="Agregar información del subevento"
            id={`botonVerInformacion-${subevento.id}`}
            type="button"
            className="w-full sm:w-auto"
            onClick={() => setMostrarModalSubevento(true)}
          />
          <ModalSubevento
            mostrar={mostrarModalSubevento}
            nombre={subevento.nombre}
            descripcion={subevento.descripcion}
            errores={props.errors}
            cambiarNombre={(valor) =>
              props.updateSubevento(index, "nombre", valor)
            }
            cambiarDescripcion={(valor) =>
              props.updateSubevento(index, "descripcion", valor)
            }
            cerrar={() => setMostrarModalSubevento(false)}
          />

          {!readOnly && props.canRemove && !props.isDeleting && (
            <Button
              text="Eliminar fecha"
              id={`botonEliminarFecha-${subevento.id}`}
              type="button"
              variant="danger"
              className="w-full sm:w-auto"
              onClick={props.onRemove}
            />
          )}
        </div>
      )}
    </div>
  );
}
