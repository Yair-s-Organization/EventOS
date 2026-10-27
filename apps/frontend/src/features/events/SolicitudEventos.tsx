import { SeccionDatosEvento } from "../../components/organisms/SolicitudEventos/SeccionDatosEvento";
import { useState, type FormEvent } from "react";
import { SeccionSubeventos } from "../../components/organisms/SolicitudEventos/SeccionSubeventos";
import Button from "../../components/atoms/Button/Button";
import { Modal } from "../../components/molecules/Modal";
import Badge from "../../components/atoms/Badge/Badge";
import { AlcanceEvento, RecintoId, type SubeventoPayload } from "@eventos/shared";

export type SubeventoFormData = SubeventoPayload & { id: number };

export interface FormularioSolicitudData {
  nombre: string;
  idAlcance: string;
  justificacion: string;
  descripcion: string;
  rutaPoster: File | null;
  subEventos: SubeventoFormData[];
}

export type CampoFormulario = Exclude<
  keyof FormularioSolicitudData,
  "subEventos"
>;
export type CampoTextoFormulario = Exclude<CampoFormulario, "rutaPoster">;

export type ErroresFormulario = Partial<Record<CampoFormulario, string>>;
export type mensajesAyuda = Partial<Record<CampoFormulario, string>>;
export type CamposTocados = Partial<Record<CampoFormulario, boolean>>;
export type CampoSubevento = Exclude<keyof SubeventoFormData, "id">;
export type ErroresSubevento = Partial<Record<CampoSubevento, string>>;
export type CamposSubeventoTocados = Partial<Record<CampoSubevento, boolean>>;

export interface PropsValidacionFormulario {
  errores: ErroresFormulario;
  touched: CamposTocados;
  esTocado: (field: CampoFormulario) => void;
}

export interface PropsSubeventosFormulario {
  subEventos: SubeventoFormData[];
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

const crearSubevento = (): SubeventoFormData => ({
  id: siguienteIdSubevento++,
  nombre: "",
  descripcion: "",
  idRecinto: 0,
  fecha: "",
  horaInicio: "",
  horaFin: "",
});

function validarFormulario(form: FormularioSolicitudData): ErroresFormulario {
  const errors: ErroresFormulario = {};
  const regex = /[a-zA-Z0-9,:;¡!¿?'"()&+-/#]/;

  if (!form.nombre.trim()) {
    errors.nombre = "El nombre del evento es obligatorio.";
  }else if(form.nombre.trim().length > 150){
    errors.nombre = "El nombre del evento no debe exceder los 150 caracteres"
  }

  if (!form.idAlcance) {
    errors.idAlcance =
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
    errors.justificacion ="La justificacion no debe exceder los 500 caracteres";
  } else if (!regex.test(form.justificacion)) {
    errors.justificacion = "Simbolo no valido";
  }

  return errors;
}

function validarSubeventos(subEventos: SubeventoFormData[]): ErroresSubevento[] {
  return subEventos.map((subevento) => {
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

    if (!subevento.idRecinto) {
      errors.idRecinto = "Selecciona un espacio para el evento";
    }

    if (
      subevento.idRecinto &&
      subevento.idRecinto !== RecintoId.SALA_14 &&
      subevento.accesoQR === undefined
    ) {
      errors.accesoQR = "Indica si el evento requiere boleto";
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
  const [form, setForm] = useState<FormularioSolicitudData>({
    nombre: "",
    idAlcance: "",
    justificacion: "",
    descripcion: "",
    rutaPoster: null,
    subEventos: [crearSubevento()],
  });

  const [touched, setTouched] = useState<CamposTocados>({});
  const [subeventTouched, setSubeventTouched] = useState<
    CamposSubeventoTocados[]
  >([{}]);

  const [modal, setModal] = useState<"confirmacion" | "error" | null>(null);

  const errors = validarFormulario(form);
  const subeventErrors = validarSubeventos(form.subEventos);

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
      subEventos: prev.subEventos.map((subevento, currentIndex) => {
        if (currentIndex !== index) return subevento;

        if (field === "idRecinto") {
          const idRecinto = Number(value);
          const updated: SubeventoFormData = {
            ...subevento,
            idRecinto,
          };
          if (idRecinto === RecintoId.SALA_14) {
            updated.accesoQR = undefined;
          }
          return updated;
        }

        if (field === "accesoQR") {
          return { ...subevento, accesoQR: value === "true" };
        }

        return { ...subevento, [field]: value };
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
      subEventos: [...prev.subEventos, crearSubevento()],
    }));
    setSubeventTouched((prev) => [...prev, {}]);
  };

  const removeSubevento = (index: number) => {
    setForm((prev) => ({
      ...prev,
      subEventos: prev.subEventos.filter(
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
      nombre: true,
      idAlcance: true,
      rutaPoster: true,
      descripcion: true,
      justificacion: true,
    });
    setSubeventTouched(
      form.subEventos.map(() => ({
        fecha: true,
        horaInicio: true,
        horaFin: true,
        idRecinto: true,
        accesoQR: true,
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

    datos.append("nombre", form.nombre.trim());
    datos.append("descripcion", form.descripcion.trim());
    datos.append("justificacion", form.justificacion.trim());
    datos.append("idAlcance", form.idAlcance);
    datos.append(
      "subeventos",
      JSON.stringify(
        form.subEventos.map((subevento): SubeventoPayload => ({
          nombre: subevento.nombre,
          descripcion: subevento.descripcion,
          idRecinto: subevento.idRecinto,
          fecha: subevento.fecha,
          horaInicio: subevento.horaInicio,
          horaFin: subevento.horaFin,
          accesoQR:
            subevento.idRecinto !== RecintoId.SALA_14 &&
            subevento.accesoQR === true,
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
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <h1 className="font-merriweather text-2xl font-bold sm:text-[36px]">
        Solicitud de evento
      </h1>
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
          subEventos={form.subEventos}
          erroresSubeventos={subeventErrors}
          subeventoTocado={subeventTouched}
          updateSubevento={updateSubevento}
          markSubeventoTouched={markSubeventoTouched}
          addSubevento={addSubevento}
          removeSubevento={removeSubevento}
        />
        <div className="flex sm:justify-start">
          <Button
            text="Solicitar evento"
            type="submit"
            className="w-full sm:w-auto"
          />
        </div>

        <Modal
          titulo={modal === "error" ? `Error` : "Confirmar solicitud"}
          contenido={
            modal === "error"
              ? "Por favor, completa todos los campos obligatorios resaltados para continuar"
              : "¿Desea enviar la solicitud de este evento?"
          }
          mostrarModal={modal !== null}
          cerrarModal={() => setModal(null)}>
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            {modal === "error" ? (
              <Button
                text="Aceptar"
                onClick={() => setModal(null)}
                className="w-full sm:w-auto"
              />
            ) : (
              <>
                <Button
                  text="Cancelar"
                  variant="danger"
                  onClick={() => setModal(null)}
                  className="w-full sm:w-auto"
                />
                <Button
                  text="Aceptar"
                  variant="success"
                  onClick={confirmarModal}
                  className="w-full sm:w-auto"
                />
              </>
            )}
          </div>
        </Modal>
      </form>
    </section>
  );
}
