import { AlcanceEvento } from "@eventos/shared";
import { FormField } from "../../molecules/FormField";
import { FormHeader } from "../../molecules/FormHeader";
import { Select } from "../../atoms/Select/Select";
import { TextArea } from "../../atoms/TextArea/TextArea";
import { Input } from "../../atoms/Input/Input";
import { InputFile } from "../../atoms/InputFile/InputFile";
import type {
  CampoTextoFormulario,
  FormularioSolicitudData,
  PropsValidacionFormulario,
} from "../../../features/events/SolicitudEventos";

interface SeccionDatosEventoProps extends PropsValidacionFormulario {
  form: FormularioSolicitudData;
  actualizarCampo: (field: CampoTextoFormulario, value: string) => void;
  actualizarPoster: (poster: File | null) => void;
}

const CATEGORIAS = [
  { value: String(AlcanceEvento.PUBLICO), label: "Público" },
  { value: String(AlcanceEvento.INTERNO), label: "Interno" },
  { value: String(AlcanceEvento.PRIVADO), label: "Privado" },
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
      <div id="camposEvento" className="grid grid-cols-1 gap-10 md:grid-cols-3 ">
        <div id="camposIzquierda" className="flex flex-col gap-2 flex-1">
          <FormField
            label="Nombre del evento"
            htmlFor="campoNombreEvento"
            //mensajeAyuda="Nombre del solicitante"
            required
            errorMessage={
              touched.nombre ? errors.nombre : undefined
            }>
            <Input
              id="campoNombreEvento"
              type="text"
              placeholder="Ingresa el nombre del evento"
              value={form.nombre}
              maxLength={100}
              hasError={Boolean(touched.nombre && errors.nombre)}
              onChange={(e) => actualizarCampo("nombre", e.target.value)}
              onBlur={() => markTouched("nombre")}
            />
          </FormField>

          <FormField
            label="Alcance del evento"
            htmlFor="selectCategoria"
            required
            errorMessage={touched.idAlcance ? errors.idAlcance : undefined}>
            <Select
              id="selectCategoria"
              placeholder="Ingresa el alcance del evento"
              options={CATEGORIAS}
              value={form.idAlcance}
              hasError={Boolean(touched.idAlcance && errors.idAlcance)}
              onChange={(e) => actualizarCampo("idAlcance", e.target.value)}
              onBlur={() => markTouched("idAlcance")}
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

        <div
          id="apartadoDescripcion"
          className="flex h-full flex-col gap-[15px] [&>div]:flex-1">
          <p className="text-justify text-xs text-gray-500">
            La descripción del evento debe mencionar brevemente las actividades
            que se vayan a realizar a lo largo del evento.
          </p>
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
        </div>

        <div
          id="apartadoJustificacion"
          className="flex h-full flex-col gap-[15px] [&>div]:flex-1">
            <p className="text-justify text-xs text-gray-500">
              La justificación debe destacar los beneficios  que el evento traerá a la comunidad politécnica y al publico asistente en general. 
            </p>
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
      </div>
    </section>
  );
}
