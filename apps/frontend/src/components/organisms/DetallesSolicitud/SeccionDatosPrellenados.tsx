import type { DatosPrellenados } from "../../../features/educational-services/DetallesSolicitud";
import Input from "../../atoms/Input/Input";
import Label from "../../atoms/Label/Label";
import { FormField } from "../../molecules/FormField";
import { FormHeader } from "../../molecules/FormHeader";
import { CardSubevento } from "../SolicitudEventos/CardSubevento";

interface DatosPrellenadosProps {
  datos: DatosPrellenados;
}

const alcances: Record<string, string> = {
  publico: "Público",
  privado: "Privado",
};

export function SeccionDatosPrellenados({ datos }: DatosPrellenadosProps) {
  return (
    <section className="grid grid-cols-1 gap-5 px-4 text-justify md:grid-cols-2 md:space-x-20">
      <div>
        <FormHeader titulo={datos.nombreEvento} />
        <FormField>
          <div className="space-y-10">
            <p className="font-merriweather">{datos.descripcion}</p>
            <p className="font-merriweather">{datos.justificacion}</p>
            <a>Ver justificacion politecnica</a>
          </div>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <FormField label="Solicitante" htmlFor="campoSolicitante">
            <Input
              id="campoSolicitante"
              type="text"
              disabled
              value={datos.nombreSolicitante}
            />
          </FormField>
        </div>
        <FormField label="Etiqueta del evento" htmlFor="campoEtiqueta">
          <Input
            id="campoEtiqueta"
            type="text"
            disabled
            value={datos.etiquetaEvento}
          />
        </FormField>

        <FormField label="Alcance" htmlFor="campoAlcance">
          <Input
            id="campoAlcance"
            type="text"
            disabled
            value={alcances[datos.alcanceEvento] ?? datos.alcanceEvento}
          />
        </FormField>

        <FormField label="Poster del evento" htmlFor="campoPoster">
          <Label>
            <a>{datos.posterEvento}</a>
          </Label>
        </FormField>
      </div>

      <div className="col-span-full mt-8 space-y-4">
        {datos.subeventos.map((subevento, index) => (
          <div key={subevento.id}>
            <CardSubevento subevento={subevento} index={index} readOnly />
          </div>
        ))}
      </div>
    </section>
  );
}
