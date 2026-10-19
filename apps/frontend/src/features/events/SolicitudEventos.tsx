import { SeccionDatosEvento } from "../../components/organisms/SeccionDatosEvento";
import { useState } from "react";
import { SeccionDatosSolicitante } from "../../components/organisms/SeccionDatosSolicitante";

export interface FormularioSolicitudoData {
  categoria: string;
  justificacion: string;
  descripcion: string;
  nombreSolicitante: string;
  correoSolicitante: string;
  nombreEvento: string;
  rutaPoster: string;
}

export function SolicitudEvento() {
  const [form, setForm] = useState({
    categoria: "",
    justificacion: "",
    descripcion: "",
    nombreSolicitante: "Edgardo Adrián Franco",
    correoSolicitante: "ea@gmail.com",
    nombreEvento: "",
    rutaPoster: ""
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})
/* 
  const validarFormulario = (): boolean => {
      const nuevosErrores: Partial<Record<keyof typeof form, string>> = {};
  } */

  const updateField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Datos listos para enviar al backend:", form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <SeccionDatosSolicitante form={form} updateField={updateField} />
      <SeccionDatosEvento form={form} updateField={updateField} />
    </form>
  );
}
