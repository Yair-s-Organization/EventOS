import { TextArea } from "../../atoms/TextArea/TextArea";
import { Button } from "../../atoms/Button/Button";
import { Input } from "../../atoms/Input/Input";
import { Modal } from "../../molecules/Modal";
import { FormField } from "../../molecules/FormField";
import type { ErroresSubevento } from "../../../features/events/SolicitudEventos";

export interface ModalSubeventoProps {
  mostrar: boolean;
  nombre: string;
  descripcion: string;
  errores: ErroresSubevento;
  cambiarNombre: (valor: string) => void;
  cambiarDescripcion: (valor: string) => void;
  cerrar: () => void;
}

export function ModalSubevento({
  mostrar,
  cerrar,
  nombre,
  cambiarNombre,
  errores: errors,
  cambiarDescripcion,
  descripcion,
}: ModalSubeventoProps) {
  return (
    <Modal
      titulo="Detalles del subevento"
      contenido="Agrega los detalles del subevento"
      mostrarModal={mostrar}
      cerrarModal={cerrar}>
      <div id="contenedorModalSubevento" className="grid grid-cols-1 gap-1">
        <FormField label="Nombre del subevento" errorMessage={errors.nombre}>
          <Input
            id="campoNombreSubevento"
            type="text"
            placeholder="Ingresa el nombre del subevento"
            value={nombre}
            hasError={Boolean(errors.nombre)}
            onChange={(e) => cambiarNombre(e.target.value)}
            maxLength={151}
          />
        </FormField>
        <FormField label="Descripcion" errorMessage={errors.descripcion}>
          <TextArea
            id="campoDescripcionSubevento"
            placeholder="Ingresa la descripción del subevento"
            maxLength={501}
            className="resize-none h-50"
            value={descripcion}
            hasError={Boolean(errors.descripcion)}
            onChange={(e) => cambiarDescripcion(e.target.value)}
          />
        </FormField>
        <Button text="Guardar" className="justify-self-end" onClick={cerrar} />
      </div>
    </Modal>
  );
}
