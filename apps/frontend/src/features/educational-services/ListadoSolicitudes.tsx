import { Button } from "../../components/atoms/Button/Button";
import { useState } from "react";
import { Modal } from "../../components/molecules/Modal";

export function ListadoSolicitudes() {
  const [accion, setAccion] = useState<"aprobar" | "rechazar" | null>(null)

  return (
    <section>
      <div id="titulos" className="space-y-5">
        <h1 className="font-merriweather text-[36px] text-bold">
          Listado de solicitudes
        </h1>
        <h2 className="font-merriweather text-base">
          Selecciona una solicitud para ver sus detalles
        </h2>
      </div>
      <Button
        text="Aceptar"
        variant="success"
        type="button"
        onClick={() => {
          (setAccion("aprobar"));
        }}
      />
      <Button
        text="Rechazar"
        variant="danger"
        type="button"
        onClick={() => {
          (setAccion("rechazar"));
        }}
      />
      {accion && (
        <Modal
          titulo="Atención"
          contenido={accion === "aprobar" ? "¿Desea aprobar el evento?" : "¿Desea rechazar el evento?"}
          mostrarModal={accion !== null}
          cerrarModal={() => setAccion(null)}>
          <div className="flex justify-end gap-3">
            <Button
              text="Rechazar"
              variant="danger"
              onClick={() => setAccion(null)}
            />
            <Button
              text="Aceptar"
              variant="success"
              onClick={() => setAccion(null)}
            />
          </div>
        </Modal>
      )}
    </section>
  );
}
