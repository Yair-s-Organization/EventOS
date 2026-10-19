import { FormField } from "../molecules/FormField";
import { FormHeader } from "../molecules/FormHeader";
import { Select } from "../atoms/Select/Select";
import { TextArea } from "../atoms/TextArea/TextArea";
import { Input } from "../atoms/Input/Input";
import { InputFile } from "../atoms/InputFile/InputFile";
import type { FormularioSolicitudoData } from "../../features/events/SolicitudEventos";

interface SeccionDatosEventoProps {
  form: FormularioSolicitudoData;
  updateField: (field: keyof FormularioSolicitudoData, value: string) => void;
}

const CATEGORIAS = [
  { value: "publico", label: "Público" },
  { value: "privado", label: "Privado" },
];

export function SeccionDatosEvento({
  form,
  updateField,
}: SeccionDatosEventoProps) {
  return (
    <section>
      <FormHeader titulo="Datos del evento" />
      <div id="camposEvento" className="grid grid-cols-1 gap-6 md:grid-cols-3 ">
        <div id="camposIzquierda" className="flex flex-col gap-2 flex-1">
          <FormField
            label="Nombre del evento"
            htmlFor="campoNombreEvento"
            required>
            <Input
              id="campoNombreEvento"
              type="text"
              placeholder="Ingresa el nombre del evento"
              value={form.nombreEvento}
              onChange={(e) =>
                updateField("nombreEvento", e.target.value)
              }></Input>
          </FormField>

          <FormField
            label="Alcance del evento"
            htmlFor="selectCategoria"
            required>
            <Select
              id="selectCategoria"
              placeholder="Ingresa el alcance del evento"
              options={CATEGORIAS}
              value={form.categoria}
              onChange={(e) => updateField("categoria", e.target.value)}
            />
          </FormField>

          <FormField label="Poster del evento" htmlFor="campoPoster" required>
            <InputFile
              id="campoBanner"
              accept="image/*"
              value={form.rutaPoster}
              onChange={(e) =>
                updateField("rutaPoster", e.target.value)
              }></InputFile>
          </FormField>
        </div>

        <FormField label="Justificacion" htmlFor="campoJustificacion" required>
          <TextArea
            id="campoJustificacion"
            placeholder="Ingresa la justificación"
            maxLength={300}
            className="flex-1 resize-none"
            value={form.justificacion}
            onChange={(e) => updateField("justificacion", e.target.value)}
          />
        </FormField>

        <FormField
          label="Descripcion del evento"
          htmlFor="campoDescripcion"
          required>
          <TextArea
            id="campoDescripcion"
            placeholder="Ingresa la descripción del evento"
            maxLength={300}
            className="flex-1 resize-none"
            value={form.descripcion}
            onChange={(e) => updateField("descripcion", e.target.value)}
          />
        </FormField>
      </div>
    </section>
  );
}
