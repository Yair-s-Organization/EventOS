export interface AhoraCdmx {
  fechaHoy: string;
  horaActual: string;
}

export interface SesionFechaHorario {
  fecha?: string | null;
  horaInicio?: string | null;
  horaFin?: string | null;
}

export interface ClaveOrdenProximo {
  grupo: 0 | 1 | 2;
  claveFecha: string;
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) al estándar DD/MM/AAAA.
 */
export function formatearFechaDdMmAaaa(
  fecha?: string | null,
  fallback = "Por confirmar",
): string {
  if (!fecha) return fallback;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha.trim());
  return match ? `${match[3]}/${match[2]}/${match[1]}` : fecha;
}

/**
 * Formatea un rango horario a formato 24h "HH:mm – HH:mm hrs".
 */
export function formatearHorarioRango(
  horaInicio?: string | null,
  horaFin?: string | null,
  fallback = "Por confirmar",
): string {
  const inicio = horaInicio?.trim().slice(0, 5) ?? "";
  const fin = horaFin?.trim().slice(0, 5) ?? "";
  if (!inicio || !fin) return fallback;
  return `${inicio} – ${fin} hrs`;
}

/**
 * Obtiene la fecha y hora actuales en zona horaria America/Mexico_City.
 */
export function obtenerAhoraCdmx(): AhoraCdmx {
  const ahora = new Date();
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(ahora);

  const parte = (tipo: string) =>
    partes.find((item) => item.type === tipo)?.value ?? "00";

  return {
    fechaHoy: `${parte("year")}-${parte("month")}-${parte("day")}`,
    horaActual: `${parte("hour")}:${parte("minute")}:${parte("second")}`,
  };
}

function normalizarHoraConSegundos(
  hora?: string | null,
  fallback = "00:00:00",
): string {
  const limpia = hora?.trim() ?? "";
  if (!limpia || limpia === "--:--") return fallback;
  if (limpia.length === 5) return `${limpia}:00`;
  return limpia.slice(0, 8);
}

/**
 * Calcula la llave de ordenamiento para mostrar primero sesiones de hoy en adelante
 * (ascendente) y después las sesiones pasadas (descendente).
 */
export function calcularClaveOrdenProximo(
  sesiones: SesionFechaHorario[],
  ahora: AhoraCdmx,
): ClaveOrdenProximo {
  const vigentes: string[] = [];
  const pasadas: string[] = [];

  for (const sesion of sesiones) {
    const fecha = sesion.fecha?.slice(0, 10) ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      continue;
    }

    const horaInicio = normalizarHoraConSegundos(sesion.horaInicio, "00:00:00");
    const horaFin = normalizarHoraConSegundos(
      sesion.horaFin,
      horaInicio || "23:59:59",
    );
    const clave = `${fecha}T${horaInicio}`;

    const esVigente =
      fecha > ahora.fechaHoy ||
      (fecha === ahora.fechaHoy && horaFin >= ahora.horaActual);

    if (esVigente) {
      vigentes.push(clave);
    } else {
      pasadas.push(clave);
    }
  }

  if (vigentes.length > 0) {
    vigentes.sort((a, b) => a.localeCompare(b));
    return { grupo: 0, claveFecha: vigentes[0] };
  }

  if (pasadas.length > 0) {
    pasadas.sort((a, b) => b.localeCompare(a));
    return { grupo: 1, claveFecha: pasadas[0] };
  }

  return { grupo: 2, claveFecha: "" };
}

/**
 * Compara dos llaves calculadas por calcularClaveOrdenProximo.
 */
export function compararClavesOrdenProximo(
  a: ClaveOrdenProximo,
  b: ClaveOrdenProximo,
): number {
  if (a.grupo !== b.grupo) {
    return a.grupo - b.grupo;
  }
  if (a.grupo === 0) {
    return a.claveFecha.localeCompare(b.claveFecha);
  }
  if (a.grupo === 1) {
    return b.claveFecha.localeCompare(a.claveFecha);
  }
  return 0;
}

