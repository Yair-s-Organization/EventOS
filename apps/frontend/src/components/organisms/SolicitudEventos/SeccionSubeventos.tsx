import { useEffect, useRef, useState } from "react";
import { Button } from "../../atoms/Button/Button";
import { FormHeader } from "../../molecules/FormHeader";
import type { PropsSubeventosFormulario } from "../../../features/events/SolicitudEventos";
import { CardSubevento } from "./CardSubevento";

export function SeccionSubeventos({
  subEventos,
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
      const currentIndex = subEventos.findIndex(
        (subevento) => subevento.id === id,
      );
      if (currentIndex !== -1) {
        removeSubevento(currentIndex);
      }
      setDeletingId(null);
    }, 350);
  };

  return (
    <section className="space-y-5 sm:space-y-6">
      <FormHeader
        titulo="Fecha y lugar del evento"
        descripcion="Selecciona el recinto, la fecha, el horario y la modalidad de acceso. El sistema validará que el espacio no esté ocupado en ese horario. Si tu evento dura varios días o tiene varias sesiones, usa el botón [Agregar nueva fecha] para registrar cada bloque."
      />

      {subEventos.map((subevento, index) => {
        const isDeleting = deletingId === subevento.id;
        return (
          <div
            key={subevento.id}
            className={`grid transition-all duration-300 ease-in-out motion-reduce:transition-none ${
              isDeleting
                ? "grid-rows-[0fr] opacity-0 scale-[0.98] -translate-y-2 pointer-events-none !mt-0"
                : "grid-rows-[1fr] opacity-100 scale-100 translate-y-0"
            }`}>
            <div className="min-h-0">
              <CardSubevento
                subevento={subevento}
                index={index}
                otrosSubeventos={subEventos.filter(
                  (_, otroIndex) => otroIndex !== index,
                )}
                errors={subeventErrors[index] ?? {}}
                touched={subeventTouched[index] ?? {}}
                updateSubevento={updateSubevento}
                markSubeventoTouched={markSubeventoTouched}
                canRemove={subEventos.length > 1}
                isDeleting={isDeleting}
                onRemove={() => handleRemove(subevento.id)}
              />              
            </div>
          </div>
        );
      })}

      <div className="flex justify-stretch sm:justify-end">
        <Button
          text="Agregar nueva fecha"
          id="botonAgregarFecha"
          type="button"
          className="w-full sm:w-auto"
          onClick={addSubevento}
        />
      </div>
    </section>
  );
}
