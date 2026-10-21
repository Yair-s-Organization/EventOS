import { FormField } from "../molecules/FormField";
import { FormHeader } from "../molecules/FormHeader";
import { Select } from "../atoms/Select/Select";
import { TextArea } from "../atoms/TextArea/TextArea";
import { Input } from "../atoms/Input/Input";
import { InputFile } from "../atoms/InputFile/InputFile";
import type {
  CampoFormulario,
  FormularioSolicitudoData,
  PropsValidacionFormulario,
} from "../../features/events/SolicitudEventos";

interface SeccionDatosEventoProps extends PropsValidacionFormulario {
  form: FormularioSolicitudoData;
  updateField: (field: CampoFormulario, value: string) => void;
}

const CATEGORIAS = [
  { value: "publico", label: "Público" },
  { value: "privado", label: "Privado" },
];

export function SeccionDatosEvento({
  form,
  updateField,
  errors,
  touched,
  markTouched,
}: SeccionDatosEventoProps) {
  return (
    <section className="space-y-5">
      <FormHeader
        titulo="Datos del evento"
        descripcion="Ingresa la información principal de tu evento, la visibilidad que tendrá en la cartelera y el beneficio que aporta a la comunidad politécnica para que Subdirección evalúe tu solicitud."
      />
      <div id="camposEvento" className="grid grid-cols-1 gap-6 md:grid-cols-3 ">
        <div id="camposIzquierda" className="flex flex-col gap-2 flex-1">
          <FormField
            label="Nombre del evento"
            htmlFor="campoNombreEvento"
            required
            errorMessage={touched.nombreEvento ? errors.nombreEvento : undefined}>
            <Input
              id="campoNombreEvento"
              type="text"
              placeholder="Ingresa el nombre del evento"
              value={form.nombreEvento}
              maxLength={100}
              hasError={Boolean(touched.nombreEvento && errors.nombreEvento)}
              onChange={(e) => updateField("nombreEvento", e.target.value)}
              onBlur={() => markTouched("nombreEvento")}
            />
          </FormField>

          <FormField
            label="Alcance del evento"
            htmlFor="selectCategoria"
            required
            errorMessage={touched.categoria ? errors.categoria : undefined}>
            <Select
              id="selectCategoria"
              placeholder="Ingresa el alcance del evento"
              options={CATEGORIAS}
              value={form.categoria}
              hasError={Boolean(touched.categoria && errors.categoria)}
              onChange={(e) => updateField("categoria", e.target.value)}
              onBlur={() => markTouched("categoria")}
            />
          </FormField>

          <FormField
            label="Póster del evento"
            htmlFor="campoPoster"
            required
            errorMessage={touched.rutaPoster ? errors.rutaPoster : undefined}>
            <InputFile
              id="campoPoster"
              accept="image/*"
              hasError={Boolean(touched.rutaPoster && errors.rutaPoster)}
              onChange={(e) =>
                updateField("rutaPoster", e.target.value)
              }
              onBlur={() => markTouched("rutaPoster")}
            />
          </FormField>
        </div>

        <FormField
          label="Descripcion del evento"
          htmlFor="campoDescripcion"
          required
          errorMessage={touched.descripcion ? errors.descripcion : undefined}>
          <TextArea
            id="campoDescripcion"
            placeholder="Ingresa la descripción del evento"
            maxLength={600}
            className="flex-1 resize-none"
            hasError={Boolean(touched.descripcion && errors.descripcion)}
            value={form.descripcion}
            onChange={(e) => updateField("descripcion", e.target.value)}
            onBlur={() => markTouched("descripcion")}
          />
        </FormField>

        <FormField
          label="Justificación"
          htmlFor="campoJustificacion"
          required
          errorMessage={touched.justificacion ? errors.justificacion : undefined}>
          <TextArea
            id="campoJustificacion"
            placeholder="Ingresa la justificación"
            maxLength={300}
            className="flex-1 resize-none"
            hasError={Boolean(touched.justificacion && errors.justificacion)}
            value={form.justificacion}
            onChange={(e) => updateField("justificacion", e.target.value)}
            onBlur={() => markTouched("justificacion")}
          />
        </FormField>
      </div>
    </section>
  );
}
