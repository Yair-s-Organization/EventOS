import { FormField } from "../molecules/FormField";
import { FormHeader } from "../molecules/FormHeader";
import { Input } from "../atoms/Input/Input";
import type {
  CampoFormulario,
  FormularioSolicitudoData,
} from "../../features/events/SolicitudEventos";

interface SeccionDatosSolicitanteProps {
  form: FormularioSolicitudoData;
  updateField: (field: CampoFormulario, value: string) => void;
}

export function SeccionDatosSolicitante({
  form,
  updateField,
}: SeccionDatosSolicitanteProps) {
  return (
    <section>
      <FormHeader titulo="Datos del solicitante" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <FormField label="Nombre del solicitante" htmlFor="campoNombre">
        <Input
          id="campoNombre"
          type="text"
          disabled
          value={form.nombreSolicitante}
          onChange={(e) => updateField("nombreSolicitante", e.target.value)}>
        </Input>
      </FormField>

      <FormField label="Correo del solicitante" htmlFor="campoCorreo">
        <Input
          id="campoCorreo"
          type="email"
          disabled
          value={form.correoSolicitante}
          onChange={(e) => updateField("correoSolicitante", e.target.value)}>
        </Input>
      </FormField>
      </div>
    </section>
  );
}
