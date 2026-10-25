import { SeccionDatosEvento } from "../../components/organisms/SolicitudEventos/SeccionDatosEvento";
import { useState, type FormEvent } from "react";
import { SeccionSubeventos } from "../../components/organisms/SolicitudEventos/SeccionSubeventos";
import Button from "../../components/atoms/Button/Button";
import { Modal } from "../../components/molecules/Modal";
import Badge from "../../components/atoms/Badge/Badge";

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
  descripcion: string;
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
  errores: ErroresFormulario;
  touched: CamposTocados;
  esTocado: (field: CampoFormulario) => void;
}

export interface PropsSubeventosFormulario {
  subeventos: DatosSubevento[];
  erroresSubeventos: ErroresSubevento[];
  subeventoTocado: CamposSubeventoTocados[];
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
  descripcion: "",
});

function validarFormulario(form: FormularioSolicitudoData): ErroresFormulario {
  const errors: ErroresFormulario = {};
  const regex = /[a-zA-Z0-9,:;¡!¿?'"()&+-/#]/;

  if (!form.nombreEvento.trim()) {
    errors.nombreEvento = "El nombre del evento es obligatorio.";
  }

  if (!form.categoria) {
    errors.categoria =
      "Debe seleccionar un tipo de alcance válido para continuar";
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
    errors.justificacion =
      "La justificacion no debe exceder los 500 caracteres";
  } else if (!regex.test(form.justificacion)) {
    errors.justificacion = "Simbolo no valido";
  }

  return errors;
}

function validarSubeventos(subeventos: DatosSubevento[]): ErroresSubevento[] {
  return subeventos.map((subevento) => {
    const errors: ErroresSubevento = {};

    if (!subevento.fecha) {
      errors.fecha = "Selecciona la fecha del evento";
    }

    if (!subevento.horaInicio) {
      errors.horaInicio = "Selecciona la hora de inicio";
    }

    if (!subevento.horaFin) {
      errors.horaFin = "Selecciona la hora final";
    }

    if (!subevento.recinto) {
      errors.recinto = "Selecciona un espacio para el evento";
    }

    if (
      subevento.recinto &&
      subevento.recinto !== "sala14" &&
      !subevento.accesoBoleto
    ) {
      errors.accesoBoleto = "Indica si el evento requiere boleto";
    }

    if (
      subevento.horaInicio &&
      subevento.horaFin &&
      subevento.horaInicio >= subevento.horaFin
    ) {
      errors.horaFin = "La hora final debe ser posterior a la hora de inicio";
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

  const [modal, setModal] = useState<"confirmacion" | "error" | null>(null);

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
      form.subeventos.map(() => ({
        fecha: true,
        horaInicio: true,
        horaFin: true,
        recinto: true,
        accesoBoleto: true,
      })),
    );

    const hayErrores =
      Object.keys(errors).length > 0 ||
      subeventErrors.some((errores) => Object.keys(errores).length > 0);

    if (hayErrores) {
      setModal("error");
      return;
    }

    setModal("confirmacion");
  };

  const confirmarModal = async () => {
    setModal(null);

    const datos = new FormData();

    const idAlcanceEvento: Record<string, number> = {
      publico: 1,
      interno: 2,
      privado: 3,
    };

    const idRecintoEvento: Record<string, number> = {
      auditorio: 1,
      lab1104: 2,
      lab1105: 3,
      sala14: 4,
    };

    const idAccesoQR: Record<string, boolean> = {
      si: true,
      no: false,
    };

    {
      /*Conexion con ENDPOINT */
    }
    const idAlcance = idAlcanceEvento[form.categoria];
    datos.append("nombre", form.nombreEvento.trim());
    datos.append("descripcion", form.descripcion.trim());
    datos.append("justificacion", form.justificacion.trim());
    datos.append("idAlcance", String(idAlcance));
    datos.append(
      "subeventos",
      JSON.stringify(
        form.subeventos.map((subevento) => ({
          idRecinto: String(idRecintoEvento[subevento.recinto]),
          fecha: subevento.fecha,
          horaInicio: subevento.horaInicio,
          horaFin: subevento.horaFin,
          accesoQR:
            subevento.recinto != "sala14" &&
            idAccesoQR[subevento.accesoBoleto] == true,
        })),
      ),
    );

    if (form.rutaPoster) {
      datos.append("poster", form.rutaPoster);
    }

    const response = await fetch("http://localhost:3000/api/solicitudes", {
      method: "POST",
      body: datos,
    });
  };

  return (
    <section className="mx-[clamp(1rem,8vw,6rem)] space-y-6 px-4">
      <h1 className="font-merriweather text-[36px] text-bold">Solicitud de evento</h1>
      <form onSubmit={handleSubmit} className="space-y-7">
        <SeccionDatosEvento
          form={form}
          actualizarCampo={updateField}
          actualizarPoster={updatePoster}
          errores={errors}
          touched={touched}
          esTocado={markTouched}
        />
        <SeccionSubeventos
          subeventos={form.subeventos}
          erroresSubeventos={subeventErrors}
          subeventoTocado={subeventTouched}
          updateSubevento={updateSubevento}
          markSubeventoTouched={markSubeventoTouched}
          addSubevento={addSubevento}
          removeSubevento={removeSubevento}
        />
        <Button text="Solicitar evento" type="submit" />

        <Modal
          titulo={modal === "error" ? `Error` : "Confirmar solicitud"}
          contenido={
            modal === "error"
              ? "Por favor, completa todos los campos obligatorios resaltados para continuar"
              : "¿Desea enviar la solicitud de este evento?"
          }
          mostrarModal={modal !== null}
          cerrarModal={() => setModal(null)}>
          <div className="flex justify-end gap-3">
            {modal === "error" ? (
              <Button text="Aceptar" onClick={() => setModal(null)} />
            ) : (
              <>
                <Button text="Cancelar" variant="danger" onClick={() => setModal(null)} />
                <Button text="Aceptar" variant="success" onClick={confirmarModal} />
              </>
            )}
          </div>
        </Modal>
      </form>
    </section>
  );
}
