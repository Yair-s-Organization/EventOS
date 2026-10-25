import { useEffect, useRef, useState } from "react";
import { Button } from "../../atoms/Button/Button";
import { FormHeader } from "../../molecules/FormHeader";
import type { PropsSubeventosFormulario } from "../../../features/events/SolicitudEventos";
import { CardSubevento } from "./CardSubevento";

export function SeccionSubeventos({
  subeventos,
  erroresSubeventos: subeventErrors,
  subeventoTocado: subeventTouched,
  updateSubevento,
  markSubeventoTouched,
  addSubevento,
  removeSubevento,
}: PropsSubeventosFormulario) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleRemove = (id: number) => {
    if (deletingId !== null) return;
    setDeletingId(id);

    timeoutRef.current = setTimeout(() => {
      const currentIndex = subeventos.findIndex(
        (subevento) => subevento.id === id,
      );
      if (currentIndex !== -1) {
        removeSubevento(currentIndex);
      }
      setDeletingId(null);
    }, 300);
  };

  return (
    <section className="space-y-5">
      <FormHeader
        titulo="Fecha y lugar del evento"
        descripcion="Selecciona el recinto, la fecha, el horario y la modalidad de acceso. El sistema validará que el espacio no esté ocupado en ese horario. Si tu evento dura varios días o tiene varias sesiones, usa el botón [Agregar nueva fecha] para registrar cada bloque."
      />

      {subeventos.map((subevento, index) => {
        const isDeleting = deletingId === subevento.id;
        return (
          <div
            key={subevento.id}
            className={`grid transition-all duration-300 ease-in-out motion-reduce:transition-none ${
              isDeleting
                ? "grid-rows-[0fr] opacity-0 scale-[0.98] -translate-y-2 pointer-events-none !mt-0"
                : "grid-rows-[1fr] opacity-100 scale-100 translate-y-0"
            }`}>
            <div className="min-h-0 overflow-hidden">
              <CardSubevento
                subevento={subevento}
                index={index}
                errors={subeventErrors[index] ?? {}}
                touched={subeventTouched[index] ?? {}}
                updateSubevento={updateSubevento}
                markSubeventoTouched={markSubeventoTouched}
                canRemove={deletingId === null && subeventos.length > 1}
                onRemove={() => handleRemove(subevento.id)}
              />              
            </div>
          </div>
        );
      })}

      <div className="flex justify-end">
        <Button
          text="Agregar nueva fecha"
          id="botonAgregarFecha"
          type="button"
          onClick={addSubevento}
        />
      </div>
    </section>
  );
}
