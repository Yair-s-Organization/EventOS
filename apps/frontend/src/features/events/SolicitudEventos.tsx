import { SeccionDatosEvento } from "../../components/organisms/SeccionDatosEvento";
import { useState, type FormEvent } from "react";
import { SeccionDatosSolicitante } from "../../components/organisms/SeccionDatosSolicitante";
import { CardSubevento } from "../../components/organisms/CardSubevento";

export interface FormularioSolicitudoData {
  categoria: string;
  justificacion: string;
  descripcion: string;
  nombreSolicitante: string;
  correoSolicitante: string;
  nombreEvento: string;
  rutaPoster: string;
  subeventos: DatosSubevento[];
}

export interface DatosSubevento {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  recinto: string;
  accesoBoleto: string;
}

export type CampoFormulario = Exclude<
  keyof FormularioSolicitudoData,
  "subeventos"
>;

export type ErroresFormulario = Partial<Record<CampoFormulario, string>>;
export type CamposTocados = Partial<Record<CampoFormulario, boolean>>;
export type CampoSubevento = keyof DatosSubevento;
export type ErroresSubevento = Partial<Record<CampoSubevento, string>>;
export type CamposSubeventoTocados = Partial<Record<CampoSubevento, boolean>>;

export interface PropsValidacionFormulario {
  errors: ErroresFormulario;
  touched: CamposTocados;
  markTouched: (field: CampoFormulario) => void;
}

export interface PropsSubeventosFormulario {
  subeventos: DatosSubevento[];
  subeventErrors: ErroresSubevento[];
  subeventTouched: CamposSubeventoTocados[];
  updateSubevento: (
    index: number,
    field: CampoSubevento,
    value: string,
  ) => void;
  markSubeventoTouched: (index: number, field: CampoSubevento) => void;
  addSubevento: () => void;
}

const crearSubevento = (): DatosSubevento => ({
  fecha: "",
  horaInicio: "",
  horaFin: "",
  recinto: "",
  accesoBoleto: "",
});

function validarFormulario(form: FormularioSolicitudoData): ErroresFormulario {
  const errors: ErroresFormulario = {};

  if (!form.nombreEvento.trim()) {
    errors.nombreEvento = "El nombre del evento es obligatorio.";
  }
  if (!form.categoria) {
    errors.categoria = "Selecciona el alcance del evento.";
  }

  if (form.justificacion.trim.length > 10) {
    errors.categoria = "La justificacion no debe exceder los 500 caracteres";
  }
  if (!form.rutaPoster) {
    errors.rutaPoster = "El póster del evento es obligatorio.";
  }
  if (!form.descripcion.trim()) {
    errors.descripcion = "La descripción del evento es obligatoria.";
  }
  if (!form.justificacion.trim()) {
    errors.justificacion = "La justificación del evento es obligatoria.";
  } else if (form.justificacion.trim().length > 10) {
    errors.justificacion =
      "La justificacion no debe exceder los 500 caracteres";
  }
  return errors;
}

function validarSubeventos(subeventos: DatosSubevento[]): ErroresSubevento[] {
  return subeventos.map((subevento) => {
    const errors: ErroresSubevento = {};

    if (!subevento.recinto) {
      errors.recinto = "Selecciona un espacio para el evento.";
    } else if (subevento.recinto !== "sala14" && !subevento.accesoBoleto) {
      errors.accesoBoleto = "Indica si el evento requiere boleto.";
    }

    return errors;
  });
}

export function SolicitudEvento() {
  const [form, setForm] = useState<FormularioSolicitudoData>({
    categoria: "",
    justificacion: "",
    descripcion: "",
    nombreSolicitante: "Edgardo Adrián Franco",
    correoSolicitante: "ea@gmail.com",
    nombreEvento: "",
    rutaPoster: "",
    subeventos: [crearSubevento()],
  });

  const [touched, setTouched] = useState<CamposTocados>({});
  const [subeventTouched, setSubeventTouched] = useState<
    CamposSubeventoTocados[]
  >([{}]);
  const errors = validarFormulario(form);
  const subeventErrors = validarSubeventos(form.subeventos);

  const updateField = (field: CampoFormulario, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateSubevento = (
    index: number,
    field: CampoSubevento,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      subeventos: prev.subeventos.map((subevento, currentIndex) => {
        if (currentIndex !== index) return subevento;

        const updatedSubevento: DatosSubevento = {
          ...subevento,
          [field]: value,
        };
        if (field === "recinto" && value === "sala14") {
          updatedSubevento.accesoBoleto = "";
        }
        return updatedSubevento;
      }),
    }));
  };

  const markTouched = (field: CampoFormulario) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const markSubeventoTouched = (index: number, field: CampoSubevento) => {
    setSubeventTouched((prev) =>
      prev.map((fields, currentIndex) =>
        currentIndex === index ? { ...fields, [field]: true } : fields,
      ),
    );
  };

  const addSubevento = () => {
    setForm((prev) => ({
      ...prev,
      subeventos: [...prev.subeventos, crearSubevento()],
    }));
    setSubeventTouched((prev) => [...prev, {}]);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({
      nombreEvento: true,
      categoria: true,
      rutaPoster: true,
      descripcion: true,
      justificacion: true,
    });
    setSubeventTouched(
      form.subeventos.map(() => ({ recinto: true, accesoBoleto: true })),
    );

    if (
      Object.keys(errors).length > 0 ||
      subeventErrors.some(
        (subeventError) => Object.keys(subeventError).length > 0,
      )
    )
      return;

    console.log("Datos listos para enviar al backend:", form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <SeccionDatosSolicitante form={form} updateField={updateField} />
      <SeccionDatosEvento
        form={form}
        updateField={updateField}
        errors={errors}
        touched={touched}
        markTouched={markTouched}
      />
      <CardSubevento
        subeventos={form.subeventos}
        subeventErrors={subeventErrors}
        subeventTouched={subeventTouched}
        updateSubevento={updateSubevento}
        markSubeventoTouched={markSubeventoTouched}
        addSubevento={addSubevento}
      />
    </form>
  );
}
