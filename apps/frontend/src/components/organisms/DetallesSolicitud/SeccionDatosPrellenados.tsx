import type { DatosPrellenados } from "../../../features/educational-services/DetallesSolicitud";
import Input from "../../atoms/Input/Input";
import { TextArea } from "../../atoms/TextArea/TextArea";
import { FormField } from "../../molecules/FormField";
import { FormHeader } from "../../molecules/FormHeader";

interface DatosPrellenadosProps {
  datos: DatosPrellenados;
}

const alcances: Record<string, string> = {
  publico: "Público",
  interno: "Interno",
  privado: "Privado",
};

export function SeccionDatosPrellenados({ datos }: DatosPrellenadosProps) {
  return (
    <div className="grid grid-cols-1 gap-5 text-justify md:grid-cols-2 md:space-x-20">
      <div className="space-y-5">
        <FormHeader titulo={datos.nombreEvento} />
        <FormField readOnly>
          <div className="space-y-10">
            <p className="font-merriweather">{datos.descripcion}</p>
          </div>
        </FormField>
      </div>
      <div id="camposDerecha" className="space-y-[26px]">
        <FormField label="Justificación" htmlFor="campoJustificacion" readOnly>
          <TextArea
            id="campoJustificacion"
            value={datos.justificacion}
            autoResize
            className="resize-none text-justify"
            disabled
          />
        </FormField>
        <div className="grid grid-cols-2 gap-x-9 s">
          <FormField label="Solicitante" htmlFor="campoSolicitante" readOnly>
            <Input
              id="campoSolicitante"
              type="text"
              disabled
              value={datos.nombreSolicitante}
            />
          </FormField>

          <FormField label="Alcance" htmlFor="campoAlcance" readOnly>
            <Input
              id="campoAlcance"
              type="text"
              disabled
              value={alcances[datos.alcanceEvento] ?? datos.alcanceEvento}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
