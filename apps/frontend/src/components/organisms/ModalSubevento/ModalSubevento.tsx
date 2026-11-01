import { TextArea } from "../../atoms/TextArea/TextArea";
import { Button } from "../../atoms/Button/Button";
import { Input } from "../../atoms/Input/Input";
import { Modal } from "../../molecules/Modal";
import { FormField } from "../../molecules/FormField";

export interface ModalSubeventoProps {
  mostrar: boolean;
  nombre: string;
  descripcion: string;
  cambiarNombre: (valor: string) => void;
  cambiarDescripcion: (valor: string) => void;
  cerrar: () => void;
}

export function ModalSubevento({
  mostrar,
  cerrar,
  nombre,
  cambiarNombre,
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
        <FormField label="Nombre del subevento">
          <Input
            type="text"
            placeholder="Ingresa el nombre del subevento"
            value={nombre}
            onChange={(e) => cambiarNombre(e.target.value)}
          />
        </FormField>
        <FormField label="Descripcion">
          <TextArea
            id="campoDescripcionSubevento"
            placeholder="Ingresa la descripción del subevento"
            maxLength={500}
            className="resize-none"
            value={descripcion}
            onChange={(e) => cambiarDescripcion(e.target.value)}
          />
        </FormField>
        <Button text="Guardar" className="justify-self-end" onClick={cerrar} />
      </div>
    </Modal>
  );
}
