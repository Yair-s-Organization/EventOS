import { FormField } from "../molecules/FormField";
import { FormHeader } from "../molecules/FormHeader";
import { Select } from "../atoms/Select/Select";
import type { PropsSubeventosFormulario } from "../../features/events/SolicitudEventos";
import Input from "../atoms/Input/Input";

type CardSubeventoProps = PropsSubeventosFormulario;

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

export function CardSubevento({
  subeventos,
  subeventErrors,
  subeventTouched,
  updateSubevento,
  markSubeventoTouched,
  addSubevento,
}: CardSubeventoProps) {
  return (
    <section className="space-y-10">
      <FormHeader
        titulo="Fecha y lugar del evento"
        descripcion="Selecciona el recinto, la fecha, el horario y la modalidad de acceso. El sistema validará que el espacio no esté ocupado en ese horario. Si tu evento dura varios días o tiene varias sesiones, usa el botón [Agregar nueva fecha] para registrar cada bloque."
      />
      {subeventos.map((subevento, index) => (
        <div
          key={index}
          className="mx-[clamp(1rem,8vw,6rem)] grid grid-cols-1 gap-4 rounded-md bg-eventos-primary-light p-4 md:grid-cols-3 md:py-11 md:px-20">
          <h3 className="text-base font-bold md:col-span-3">
            {index === 0 ? "Fecha y lugar" : `Fecha adicional ${index + 1}`}
          </h3>

          <FormField label="Fecha" htmlFor={`selectFecha-${index}`}>
            <Input
              id={`selectFecha-${index}`}
              type="date"
              value={subevento.fecha}
              onChange={(e) => updateSubevento(index, "fecha", e.target.value)}
            />
          </FormField>

          <FormField label="Hora inicio" htmlFor={`selectHoraInicio-${index}`}>
            <Input
              id={`selectHoraInicio-${index}`}
              type="time"
              value={subevento.horaInicio}
              onChange={(e) =>
                updateSubevento(index, "horaInicio", e.target.value)
              }
            />
          </FormField>

          <FormField label="Hora Fin" htmlFor={`selectHoraFinal-${index}`}>
            <Input
              id={`selectHoraFinal-${index}`}
              type="time"
              value={subevento.horaFin}
              onChange={(e) =>
                updateSubevento(index, "horaFin", e.target.value)
              }
            />
          </FormField>

          <FormField
            label="Espacio deseado"
            htmlFor={`selectRecinto-${index}`}
            required
            errorMessage={
              subeventTouched[index]?.recinto
                ? subeventErrors[index]?.recinto
                : undefined
            }>
            <Select
              id={`selectRecinto-${index}`}
              placeholder="Selecciona un espacio"
              options={RECINTOS}
              value={subevento.recinto}
              hasError={Boolean(
                subeventTouched[index]?.recinto &&
                subeventErrors[index]?.recinto,
              )}
              onChange={(e) =>
                updateSubevento(index, "recinto", e.target.value)
              }
              onBlur={() => markSubeventoTouched(index, "recinto")}
            />
          </FormField>

          <FormField
            label="Acceso con boleto"
            htmlFor={`selectBoleto-${index}`}
            required={subevento.recinto !== "sala14"}
            errorMessage={
              subeventTouched[index]?.accesoBoleto
                ? subeventErrors[index]?.accesoBoleto
                : undefined
            }>
            <Select
              id={`selectBoleto-${index}`}
              placeholder="Selecciona una opción"
              options={ACCESOS}
              value={subevento.accesoBoleto}
              hasError={Boolean(
                subeventTouched[index]?.accesoBoleto &&
                subeventErrors[index]?.accesoBoleto,
              )}
              onChange={(e) =>
                updateSubevento(index, "accesoBoleto", e.target.value)
              }
              onBlur={() => markSubeventoTouched(index, "accesoBoleto")}
              disabled={subevento.recinto === "sala14"}
            />
          </FormField>
          <button type="button">Ver requerimientos de espacio</button>
        </div>
      ))}
      <div className="mx-[clamp(1rem,8vw,6rem)] flex justify-end gap-4">
        <button id="botonAgregarFecha" type="button" onClick={addSubevento}>
          Agregar nueva fecha
        </button>
      </div>
      <button type="submit">Solicitar evento</button>
    </section>
  );
}
