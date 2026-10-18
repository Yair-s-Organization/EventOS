import { useState } from "react";
import { Select } from "../../components/atoms/Select/Select";
import { TextArea } from "../../components/atoms/TextArea/TextArea";

const categories = [
  { value: "publico", label: "Público" },
  { value: "privado", label: "Privado" },
];

const labelClass = "font-merriweather font-medium text-[16px]";

export function SolicitudEventos() {
  const [form, setForm] = useState({
    category: "",
    justify: "",
    description: "",
  });

  const updateField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <h1 className="font-merriweather font-bold text-[36px]">
          Solicitud de evento
        </h1>
        <h2 className="font-merriweather font-medium text-[20px]">
          Datos del evento
        </h2>
        <p className={labelClass}>
          Ingresa la información principal de tu evento, la visibilidad que
          tendrá en la cartelera y el beneficio que aporta a la comunidad
          politécnica para que Subdirección evalúe tu solicitud.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="category" className={labelClass}>
            Alcance del evento
          </label>
          <Select
            id="category"
            placeholder="Ingresa el alcance del evento"
            options={categories}
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="justify" className={labelClass}>
            Justificación
          </label>
          <TextArea
            id="justify"
            placeholder="Ingresa la justificación"
            maxLength={300}
            rows={4}
            value={form.justify}
            onChange={(e) => updateField("justify", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className={labelClass}>
            Descripción del evento
          </label>
          <TextArea
            id="description"
            placeholder="Ingresa la descripción del evento"
            maxLength={300}
            rows={4}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}