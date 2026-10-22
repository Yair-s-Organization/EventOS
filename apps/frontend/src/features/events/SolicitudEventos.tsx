import { SeccionDatosEvento } from "../../components/organisms/SolicitudEventos/SeccionDatosEvento";
import { useState, type FormEvent } from "react";
//import { SeccionDatosSolicitante } from "../../components/organisms/SolicitudEventos/SeccionDatosSolicitante";
import { SeccionSubeventos } from "../../components/organisms/SolicitudEventos/SeccionSubeventos";
import Button from "../../components/atoms/Button/Button";
import { Modal } from "../../components/molecules/Modal";

export interface FormularioSolicitudoData {
  categoria: string;
  justificacion: string;
  descripcion: string;
  nombreEvento: string;
  rutaPoster: File | null;
  subeventos: DatosSubevento[];
}

export interface DatosSubevento {
  id: number;
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
export type CampoTextoFormulario = Exclude<CampoFormulario, "rutaPoster">;

export type ErroresFormulario = Partial<Record<CampoFormulario, string>>;
export type mensajesAyuda = Partial<Record<CampoFormulario, string>>;
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
  removeSubevento: (index: number) => void;
}

let siguienteIdSubevento = 0;

const crearSubevento = (): DatosSubevento => ({
  id: siguienteIdSubevento++,
  fecha: "",
  horaInicio: "",
  horaFin: "",
  recinto: "",
  accesoBoleto: "",
});

function validarFormulario(form: FormularioSolicitudoData): ErroresFormulario {
  const errors: ErroresFormulario = {};
  const regex = /[a-zA-Z0-9,:;¡!¿?'"()&+-/#]/;

  if (!form.nombreEvento.trim()) {
    errors.nombreEvento = "El nombre del evento es obligatorio.";
  }

  if (!form.categoria) {
    errors.categoria = "Selecciona el alcance del evento.";
  }

  if (!form.rutaPoster) {
    errors.rutaPoster = "El póster del evento es obligatorio.";
  } else if (form.rutaPoster.size > 5 * 1024 * 1024) {
    errors.rutaPoster = "El póster no debe exceder los 5 megabytes.";
  }
  
  if (!form.descripcion.trim()) {
    errors.descripcion = "La descripción del evento es obligatoria.";
  } else if (form.descripcion.trim().length > 500) {
    errors.descripcion = "La descripcion no debe exceder los 500 caracteres";
  }
  
  if (!form.justificacion.trim()) {
    errors.justificacion = "La justificación del evento es obligatoria.";
  } else if (form.justificacion.trim().length > 500) {
    errors.justificacion = "La justificacion no debe exceder los 500 caracteres"
      "La justificacion no debe exceder los 500 caracteres";
  } else if(!regex.test(form.justificacion)){
      errors.justificacion = "Simbolo no valido"
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
    nombreEvento: "",
    rutaPoster: null,
    subeventos: [crearSubevento()],
  });

  const [touched, setTouched] = useState<CamposTocados>({});
  const [subeventTouched, setSubeventTouched] = useState<
    CamposSubeventoTocados[]
  >([{}]);

  const [open, setOpen] = useState(false);

  const errors = validarFormulario(form);
  const subeventErrors = validarSubeventos(form.subeventos);

  const updateField = (field: CampoTextoFormulario, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updatePoster = (poster: File | null) =>
    setForm((prev) => ({ ...prev, rutaPoster: poster }));

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

  const removeSubevento = (index: number) => {
    setForm((prev) => ({
      ...prev,
      subeventos: prev.subeventos.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
    setSubeventTouched((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
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
    setOpen(true);
  };

  const confirmarModal = () => {
    setOpen(false);
    console.log("Datos listos para enviar al backend:", form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <SeccionDatosEvento
        form={form}
        actualizarCampo={updateField}
        actualizarPoster={updatePoster}
        errors={errors}
        touched={touched}
        markTouched={markTouched}
      />
      <SeccionSubeventos
        subeventos={form.subeventos}
        subeventErrors={subeventErrors}
        subeventTouched={subeventTouched}
        updateSubevento={updateSubevento}
        markSubeventoTouched={markSubeventoTouched}
        addSubevento={addSubevento}
        removeSubevento={removeSubevento}
      />
      <Button text="Solicitar evento" type="submit" />
      <Modal
        titulo="Confirmar solicitud"
        contenido="¿Deseas enviar la solicitud de este evento?"
        mostrarModal={open}
        cerrarModal={() => setOpen(false)}
      >
        <div className="flex justify-end gap-3">
          <Button
            text="Cancelar"
            onClick={() => setOpen(false)}
          />
          <Button text="Aceptar" onClick={confirmarModal} />
        </div>
      </Modal>
    </form>
  );
}
