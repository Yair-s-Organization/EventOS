import {
  ModalidadAcceso,
  permiteCupoConfigurable,
} from "@eventos/shared";
import { Input } from "../atoms/Input/Input";
import { FormField } from "./FormField";

interface CupoMaximoFieldProps {
  id: string;
  idRecinto?: number;
  aforoRecinto?: number;
  idModalidadAcceso?: ModalidadAcceso;
  value: number | string | null | undefined;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  labelClassName?: string;
  errorMessage?: string;
  hasError?: boolean;
  onChangeValue: (valor: string) => void;
  onBlur?: () => void;
}

export function CupoMaximoField({
  id,
  idRecinto,
  aforoRecinto,
  idModalidadAcceso,
  value,
  disabled = false,
  readOnly = false,
  required = false,
  labelClassName,
  errorMessage,
  hasError = false,
  onChangeValue,
  onBlur,
}: CupoMaximoFieldProps) {
  const tieneRecinto = Boolean(idRecinto && idRecinto > 0);
  const esMapa = idModalidadAcceso === ModalidadAcceso.QR_MAPA;
  const esLibre = idModalidadAcceso === ModalidadAcceso.ACCESO_LIBRE;
  const esConfigurable =
    tieneRecinto && permiteCupoConfigurable(idModalidadAcceso);

  const valorMostrado = !tieneRecinto
    ? ""
    : esMapa
      ? String(aforoRecinto && aforoRecinto > 0 ? aforoRecinto : 242)
      : esLibre
        ? ""
        : value === null || value === undefined
          ? ""
          : String(value);

  const placeholder = !tieneRecinto
    ? "Selecciona espacio y modalidad"
    : esLibre
      ? "Sin registro previo"
      : aforoRecinto && aforoRecinto > 0
        ? String(aforoRecinto)
        : "Ingresa el cupo";

  const mensajeAyuda = !tieneRecinto
    ? undefined
    : esMapa
      ? "Cupo fijo de 242 butacas físicas del croquis numerado."
      : esLibre
        ? "En Acceso libre no aplica límite de registros digitales."
        : esConfigurable && aforoRecinto && aforoRecinto > 0
          ? `Aforo físico del recinto: ${aforoRecinto} lugares. Puedes reducir el cupo si tu actividad requiere menos asistentes.`
          : undefined;

  return (
    <FormField
      label="Cupo máximo de asistentes"
      htmlFor={id}
      className={labelClassName}
      readOnly={readOnly}
      required={required && esConfigurable}
      mensajeAyuda={mensajeAyuda}
      errorMessage={errorMessage}
    >
      <Input
        id={id}
        type={esConfigurable ? "number" : "text"}
        min={esConfigurable ? 1 : undefined}
        max={
          esConfigurable && aforoRecinto && aforoRecinto > 0
            ? aforoRecinto
            : undefined
        }
        step={esConfigurable ? 1 : undefined}
        inputMode={esConfigurable ? "numeric" : undefined}
        placeholder={placeholder}
        value={valorMostrado}
        disabled={readOnly || disabled || !esConfigurable}
        hasError={hasError}
        onChange={(e) => onChangeValue(e.currentTarget.value)}
        onBlur={onBlur}
      />
    </FormField>
  );
}
