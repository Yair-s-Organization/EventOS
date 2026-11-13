import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Calendar } from "lucide-react";

export interface DateInputProps {
  id?: string;
  name?: string;
  value: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  hasError?: boolean;
  variant?: "default" | "filter";
  className?: string;
  onValueChange: (isoDate: string) => void;
  onBlur?: () => void;
  "aria-label"?: string;
}

/** Convierte una fecha ISO (YYYY-MM-DD) al formato visual dd/mm/aaaa. */
export function isoADisplay(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "";
}

/** Valida que año, mes y día correspondan a una fecha existente en el calendario. */
export function esFechaCalendarioValida(
  anio: number,
  mes: number,
  dia: number,
): boolean {
  if (anio < 1900 || anio > 2999 || mes < 1 || mes > 12 || dia < 1) {
    return false;
  }
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return (
    fecha.getUTCFullYear() === anio &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia
  );
}

/** Convierte dd/mm/aaaa a ISO (YYYY-MM-DD) validando calendario real y límites min/max. */
export function displayAIso(
  display: string,
  min?: string,
  max?: string,
): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);
  if (!match) return null;

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const anio = Number(match[3]);
  if (!esFechaCalendarioValida(anio, mes, dia)) return null;

  const iso = `${String(anio).padStart(4, "0")}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  if (min && iso < min) return null;
  if (max && iso > max) return null;
  return iso;
}

/** Aplica máscara progresiva dd/mm/aaaa respetando borrado y captura manual de '/'. */
export function aplicarMascaraFecha(
  valorActual: string,
  valorAnterior: string,
): string {
  const digitos = valorActual.replace(/\D/g, "").slice(0, 8);
  const estaEscribiendo = valorActual.length > valorAnterior.length;

  if (digitos.length === 2 && estaEscribiendo && valorActual.endsWith("/")) {
    return `${digitos}/`;
  }
  if (digitos.length === 4 && estaEscribiendo && valorActual.endsWith("/")) {
    return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/`;
  }
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

/** Selector de fecha con captura y visualización fija dd/mm/aaaa y calendario nativo auxiliar. */
export function DateInput({
  id,
  name,
  value,
  min,
  max,
  disabled = false,
  hasError = false,
  variant = "default",
  className = "",
  onValueChange,
  onBlur,
  "aria-label": ariaLabel,
}: DateInputProps) {
  const isoNormalizado = /^(\d{4}-\d{2}-\d{2})/.exec(value)?.[1] ?? "";
  const [texto, setTexto] = useState(() => isoADisplay(isoNormalizado));
  const nativePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTexto(isoADisplay(isoNormalizado));
  }, [isoNormalizado]);

  const handleTextChange = (raw: string) => {
    if (raw === "") {
      setTexto("");
      if (isoNormalizado !== "") {
        onValueChange("");
      }
      return;
    }

    // Compatibilidad con asignación programática ISO (YYYY-MM-DD), p. ej. pruebas E2E
    const isoDirecto = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (isoDirecto) {
      const anio = Number(isoDirecto[1]);
      const mes = Number(isoDirecto[2]);
      const dia = Number(isoDirecto[3]);
      if (esFechaCalendarioValida(anio, mes, dia)) {
        setTexto(isoADisplay(raw));
        onValueChange(raw);
      }
      return;
    }

    const formateado = aplicarMascaraFecha(raw, texto);
    setTexto(formateado);

    if (formateado.length === 10) {
      const iso = displayAIso(formateado, min, max);
      if (iso) {
        onValueChange(iso);
      }
    }
  };

  const handleTextBlur = () => {
    const iso = displayAIso(texto, min, max);
    if (texto !== "" && !iso) {
      setTexto(isoADisplay(isoNormalizado));
    } else if (texto === "" && isoNormalizado !== "") {
      onValueChange("");
    }
    onBlur?.();
  };

  const abrirCalendario = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const picker = nativePickerRef.current;
    if (!picker || disabled) return;

    if (typeof picker.showPicker === "function") {
      try {
        picker.showPicker();
        return;
      } catch {
        // Respaldo si el navegador restringe showPicker
      }
    }
    picker.focus();
    picker.click();
  };

  const baseStyles =
    variant === "filter"
      ? `h-11 w-full min-w-0 rounded-lg border border-eventos-panel-border bg-eventos-on-primary px-3 pr-10 text-sm text-eventos-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400`
      : `font-merriweather text-[16px] mb-0 bg-white w-full rounded-lg border-2 p-3 pr-10 text-sm transition-colors outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${
          hasError
            ? "border-eventos-error focus:border-eventos-error focus:ring-red-200"
            : "border-secondary focus:ring-blue-100"
        }`;

  return (
    <div className="relative w-full min-w-0">
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        maxLength={10}
        placeholder="dd/mm/aaaa"
        aria-label={ariaLabel}
        aria-invalid={hasError}
        disabled={disabled}
        value={texto}
        onChange={(e) => handleTextChange(e.target.value)}
        onBlur={handleTextBlur}
        className={`${baseStyles} ${className}`.trim()}
      />

      <input
        ref={nativePickerRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        min={min}
        max={max}
        value={isoNormalizado}
        onChange={(e) => onValueChange(e.target.value)}
        className="pointer-events-none absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 opacity-0"
      />

      <button
        type="button"
        disabled={disabled}
        aria-label="Abrir calendario"
        onClick={abrirCalendario}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-600 transition-colors hover:text-eventos-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary disabled:cursor-not-allowed disabled:text-gray-400"
      >
        <Calendar size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export default DateInput;
