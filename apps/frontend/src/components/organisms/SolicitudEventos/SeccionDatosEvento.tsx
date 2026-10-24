import { FormField } from "../../molecules/FormField";
import { FormHeader } from "../../molecules/FormHeader";
import { Select } from "../../atoms/Select/Select";
import { TextArea } from "../../atoms/TextArea/TextArea";
import { Input } from "../../atoms/Input/Input";
import { InputFile } from "../../atoms/InputFile/InputFile";
import type {
  CampoTextoFormulario,
  FormularioSolicitudoData,
  PropsValidacionFormulario,
} from "../../../features/events/SolicitudEventos";

interface SeccionDatosEventoProps extends PropsValidacionFormulario {
  form: FormularioSolicitudoData;
  actualizarCampo: (field: CampoTextoFormulario, value: string) => void;
  actualizarPoster: (poster: File | null) => void;
}

const CATEGORIAS = [
  { value: "publico", label: "Público" },
  { value: "interno", label: "Interno" },
  { value: "privado", label: "Privado" },
];

export function SeccionDatosEvento({
  form,
  actualizarCampo,
  actualizarPoster,
  errores: errors,
  touched,
  esTocado: markTouched,
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
            //mensajeAyuda="Nombre del solicitante"
            required
            errorMessage={
              touched.nombreEvento ? errors.nombreEvento : undefined
            }>
            <Input
              id="campoNombreEvento"
              type="text"
              placeholder="Ingresa el nombre del evento"
              value={form.nombreEvento}
              maxLength={100}
              hasError={Boolean(touched.nombreEvento && errors.nombreEvento)}
              onChange={(e) => actualizarCampo("nombreEvento", e.target.value)}
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
              onChange={(e) => actualizarCampo("categoria", e.target.value)}
              onBlur={() => markTouched("categoria")}
            />
          </FormField>

          <FormField
            label="Póster del evento"
            htmlFor="campoPoster"
            required
            mensajeAyuda="El poster debe estar en formato jpg y con un tamaño menor a 5 megabytes"
            errorMessage={touched.rutaPoster ? errors.rutaPoster : undefined}>
            <InputFile
              id="campoPoster"
              accept=".jpg"
              hasError={Boolean(touched.rutaPoster && errors.rutaPoster)}
              onChange={(e) => actualizarPoster(e.target.files?.[0] ?? null)}
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
            className="flex-1 resize-none"
            hasError={Boolean(touched.descripcion && errors.descripcion)}
            value={form.descripcion}
            onChange={(e) => actualizarCampo("descripcion", e.target.value)}
            maxLength={501}
            onBlur={() => markTouched("descripcion")}
          />
        </FormField>

        <FormField
          label="Justificación"
          htmlFor="campoJustificacion"
          required
          errorMessage={
            touched.justificacion ? errors.justificacion : undefined
          }>
          <TextArea
            id="campoJustificacion"
            placeholder="Ingresa la justificación"
            maxLength={501}
            className="flex-1 resize-none"
            hasError={Boolean(touched.justificacion && errors.justificacion)}
            value={form.justificacion}
            onChange={(e) => actualizarCampo("justificacion", e.target.value)}
            onBlur={() => markTouched("justificacion")}
          />
        </FormField>
      </div>
    </section>
  );
}
