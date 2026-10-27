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

interface CardSubeventoBaseProps {
  subevento: SubeventoFormData;
  index: number;
  isDeleting?: boolean;
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
  { value: "08:00", label: "8:00" },
  { value: "09:00", label: "9:00" },
  { value: "10:00", label: "10:00" },
  { value: "11:00", label: "11:00" },
  { value: "12:00", label: "12:00" },
  { value: "13:00", label: "13:00" },
  { value: "14:00", label: "14:00" },
  { value: "15:00", label: "15:00" },
  { value: "16:00", label: "16:00" },
  { value: "17:00", label: "17:00" },
  { value: "18:00", label: "18:00" },
  { value: "19:00", label: "19:00" },
  { value: "20:00", label: "20:00" },
  { value: "21:00", label: "21:00" },
];

const HORASFIN = [
  { value: "08:00", label: "8:00" },
  { value: "09:00", label: "9:00" },
  { value: "10:00", label: "10:00" },
  { value: "11:00", label: "11:00" },
  { value: "12:00", label: "12:00" },
  { value: "13:00", label: "13:00" },
  { value: "14:00", label: "14:00" },
  { value: "15:00", label: "15:00" },
  { value: "16:00", label: "16:00" },
  { value: "17:00", label: "17:00" },
  { value: "18:00", label: "18:00" },
  { value: "19:00", label: "19:00" },
  { value: "20:00", label: "20:00" },
  { value: "21:00", label: "21:00" },
  { value: "22:00", label: "22:00" },
];

export function CardSubevento(props: CardSubeventoProps) {
  const readOnly = props.readOnly === true;
  const errors = readOnly ? {} : props.errors;
  const touched = readOnly ? {} : props.touched;
  const { subevento, index } = props;

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
          options={HORASINICIO}
          value={subevento.horaInicio}
          disabled={readOnly}
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
          options={HORASFIN}
          value={subevento.horaFin}
          disabled={readOnly}
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
        errorMessage={touched.accesoQR ? errors.accesoQR : undefined}>
        <Select
          id={`selectBoleto-${index}`}
          placeholder={"Selecciona una opción"}
          options={ACCESOS}
          value={
            subevento.accesoQR !== undefined ? String(subevento.accesoQR) : ""
          }
          disabled={readOnly || subevento.idRecinto === RecintoId.SALA_14}
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
      <FormField readOnly={readOnly}>
        {readOnly && (
          <Button
            text="Ver descripcion del subevento"
            id={`botonVerInformacion-${subevento.id}`}
            type="button"
            className="w-full sm:w-auto"
            onClick={() => console.log(subevento.horaInicio)}
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
          />
        )}
      </FormField>
      {!readOnly && (
        <div className="col-span-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            text="Agregar información del subevento"
            id={`botonVerInformacion-${subevento.id}`}
            type="button"
            className="w-full sm:w-auto"
            onClick={() => console.log(subevento.horaInicio)}
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
