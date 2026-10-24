import { FormField } from "../../molecules/FormField";
import { Select } from "../../atoms/Select/Select";
import type {
  CamposSubeventoTocados,
  CampoSubevento,
  DatosSubevento,
  ErroresSubevento,
} from "../../../features/events/SolicitudEventos";
import Input from "../../atoms/Input/Input";
import Button from "../../atoms/Button/Button";

interface CardSubeventoBaseProps {
  subevento: DatosSubevento;
  index: number;
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
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
];

const RECINTOS = [
  { value: "auditorio", label: "Auditorio" },
  { value: "sala14", label: "Sala 14" },
  { value: "lab1104", label: "Laboratorio 1104" },
  { value: "lab1105", label: "Laboratorio 1105" },
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
  const { subevento, index } = props;
  const readOnly = props.readOnly === true;
  const errors = readOnly ? {} : props.errors;
  const touched = readOnly ? {} : props.touched;

  return (
    <div className="mx-[clamp(1rem,8vw,6rem)] grid grid-cols-1 gap-4 rounded-md bg-eventos-primary-light p-4 md:grid-cols-3 md:py-11 md:px-20">
      <FormField
        label="Fecha"
        htmlFor={`selectFecha-${index}`}
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
        required
        errorMessage={touched.recinto ? errors.recinto : undefined}>
        <Select
          id={`selectRecinto-${index}`}
          placeholder="Selecciona un espacio"
          options={RECINTOS}
          value={subevento.recinto}
          disabled={readOnly}
          hasError={Boolean(touched.recinto && errors.recinto)}
          onChange={
            readOnly
              ? undefined
              : (e) => props.updateSubevento(index, "recinto", e.target.value)
          }
          onBlur={
            readOnly
              ? undefined
              : () => props.markSubeventoTouched(index, "recinto")
          }
        />
      </FormField>

      <FormField
        label="Acceso con boleto"
        htmlFor={`selectBoleto-${index}`}
        required={subevento.recinto !== "sala14"}
        errorMessage={touched.accesoBoleto ? errors.accesoBoleto : undefined}>
        <Select
          id={`selectBoleto-${index}`}
          placeholder={"Selecciona una opción"}
          options={ACCESOS}
          value={subevento.accesoBoleto}
          disabled={readOnly || subevento.recinto === "sala14"}
          hasError={Boolean(touched.accesoBoleto && errors.accesoBoleto)}
          onChange={
            readOnly
              ? undefined
              : (e) =>
                  props.updateSubevento(index, "accesoBoleto", e.target.value)
          }
          onBlur={
            readOnly
              ? undefined
              : () => props.markSubeventoTouched(index, "accesoBoleto")
          }
        />
      </FormField>
      <FormField>
        {readOnly && (
          <Button
            text="Ver descripcion del subevento"
            id={`botonVerInformacion-${subevento.id}`}
            type="button"
            onClick={() => console.log(subevento.horaInicio)}
          />
        )}
        {!readOnly && (
          <Button
            text="Ver detalles de espacio"
            type="button"
            disabled={
              subevento.recinto === "sala14" ||
              subevento.recinto === "auditorio" ||
              subevento.recinto === ""
            }
          />
        )}
      </FormField>
      {!readOnly && (
        <div className="col-span-full flex justify-between">
          <Button
            text="Agregar información del subevento"
            id={`botonVerInformacion-${subevento.id}`}
            type="button"
            onClick={() => console.log(subevento.horaInicio)}
          />

          <Button
            text="Eliminar fecha"
            id={`botonEliminarFecha-${subevento.id}`}
            type="button"
            disabled={!props.canRemove}
            onClick={props.onRemove}
          />
        </div>
      )}
    </div>
  );
}
