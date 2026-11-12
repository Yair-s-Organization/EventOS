import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { API_BASE_URL } from "../../../lib/apiClient";
import { getAuthPathWithReturnUrl, getEventReturnPath } from "../../event-details/utils/eventReturnUrl";

export function useRegistro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPath = getEventReturnPath(searchParams.get("returnUrl"));
  const loginPath = getAuthPathWithReturnUrl("/login", returnPath);

  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPa: "",
    apellidoMaterno: "", 
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const [errors, setErrors] = useState({
    correo: "",
    nombre: "",
    apellidoPa: "",
    apellidoMaterno: "",
    contrasena: "",
    confirmarContrasena: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false);
  const [modalIncompletosAbierto, setModalIncompletosAbierto] = useState(false);
  const [correoRegistrado, setCorreoRegistrado] = useState("");

  const ValidacionContra = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$/;
  const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "correo") {
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, correo: "El correo electrónico es requerido." }));
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        setErrors((prev) => ({ ...prev, correo: "Ingrese un correo valido. Ejemplo: usuario@alumno.ipn.mx" }));
      } else {
        setErrors((prev) => ({ ...prev, correo: "" }));
      }
    }

    if (name === "nombre") {
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, nombre: "El nombre es requerido." }));
      } else if (value.length > 50) {
        setErrors((prev) => ({ ...prev, nombre: "El nombre no debe exceder los 50 caracteres." }));
      } else if (!soloLetrasRegex.test(value)) {
        setErrors((prev) => ({ ...prev, nombre: "Solo se permiten letras en el nombre." }));
      } else {
        setErrors((prev) => ({ ...prev, nombre: "" }));
      }
    }

    if (name === "apellidoPa") {
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, apellidoPa: "El apellido paterno es requerido." }));
      } else if (value.length > 50) {
        setErrors((prev) => ({ ...prev, apellidoPa: "El apellido paterno no debe exceder los 50 caracteres." }));
      } else if (!soloLetrasRegex.test(value)) {
        setErrors((prev) => ({ ...prev, apellidoPa: "Solo se permiten letras en el apellido paterno." }));
      } else {
        setErrors((prev) => ({ ...prev, apellidoPa: "" }));
      }
    }

    if (name === "apellidoMaterno") {
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, apellidoMaterno: "El apellido materno es requerido." }));
      } else if (value.length > 50) {
        setErrors((prev) => ({ ...prev, apellidoMaterno: "El apellido materno no debe exceder los 50 caracteres." }));
      } else if (!soloLetrasRegex.test(value)) {
        setErrors((prev) => ({ ...prev, apellidoMaterno: "Solo se permiten letras en el apellido materno." }));
      } else {
        setErrors((prev) => ({ ...prev, apellidoMaterno: "" }));
      }
    }

    if (name === "contrasena") {
      if (!value) {
        setErrors((prev) => ({ ...prev, contrasena: "La contraseña es requerida." }));
      } else if (!ValidacionContra.test(value)) {
        setErrors((prev) => ({
          ...prev,
          contrasena: "La contraseña debe tener entre 8 y 64 caracteres, e incluir al menos: una mayúscula, una minúscula, un número y un carácter especial (ej. @, $, !, %, *, ?, &, _, -).",
        }));
      } else {
        setErrors((prev) => ({ ...prev, contrasena: "" }));
      }

      if (formData.confirmarContrasena && value !== formData.confirmarContrasena) {
        setErrors((prev) => ({ ...prev, confirmarContrasena: "Las contraseñas no coinciden." }));
      } else if (formData.confirmarContrasena) {
        setErrors((prev) => ({ ...prev, confirmarContrasena: "" }));
      }
    }

    if (name === "confirmarContrasena") {
      if (!value) {
        setErrors((prev) => ({ ...prev, confirmarContrasena: "Confirma tu contraseña." }));
      } else if (value !== formData.contrasena) {
        setErrors((prev) => ({ ...prev, confirmarContrasena: "Las contraseñas no coinciden. Verificar que ambas sean idénticas." }));
      } else {
        setErrors((prev) => ({ ...prev, confirmarContrasena: "" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ correo: "", nombre: "", apellidoPa: "", apellidoMaterno: "", contrasena: "", confirmarContrasena: "", general: "" });

    const isCorreoEmpty = !formData.correo.trim();
    const isNombreEmpty = !formData.nombre.trim();
    const isApellidoPaEmpty = !formData.apellidoPa.trim();
    const isApellidoMaEmpty = !formData.apellidoMaterno.trim();
    const isContrasenaEmpty = !formData.contrasena;
    const isConfirmarEmpty = !formData.confirmarContrasena;

    if (isCorreoEmpty && isNombreEmpty && isApellidoPaEmpty && isApellidoMaEmpty && isContrasenaEmpty && isConfirmarEmpty) {
      setErrors({
        correo: "El correo electrónico es requerido.",
        nombre: "El nombre es requerido.",
        apellidoPa: "El apellido paterno es requerido.",
        apellidoMaterno: "El apellido materno es requerido.",
        contrasena: "La contraseña es requerida.",
        confirmarContrasena: "Confirma tu contraseña.",
        general: "",
      });
      setModalIncompletosAbierto(true);
      return;
    }

    let newCorreoError = "";
    let newNombreError = "";
    let newApellidoPaError = "";
    let newApellidoMaError = "";
    let newContrasenaError = "";
    let newConfirmarError = "";
    let hasError = false;

    if (isCorreoEmpty) {
      newCorreoError = "El correo electrónico es requerido.";
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newCorreoError = "Ingresa un correo valido. Ejemplo: usuario@alumno.ipn.mx";
      hasError = true;
    }

    if (isNombreEmpty) {
      newNombreError = "El nombre es requerido.";
      hasError = true;
    } else if (formData.nombre.length > 50) {
      newNombreError = "El nombre no debe exceder los 50 caracteres.";
      hasError = true;
    } else if (!soloLetrasRegex.test(formData.nombre)) {
      newNombreError = "Solo se permiten letras en el nombre.";
      hasError = true;
    }

    if (isApellidoPaEmpty) {
      newApellidoPaError = "El apellido paterno es requerido.";
      hasError = true;
    } else if (formData.apellidoPa.length > 50) {
      newApellidoPaError = "El apellido paterno no debe exceder los 50 caracteres.";
      hasError = true;
    } else if (!soloLetrasRegex.test(formData.apellidoPa)) {
      newApellidoPaError = "Solo se permiten letras en el apellido paterno.";
      hasError = true;
    }

    if (isApellidoMaEmpty) {
      newApellidoMaError = "El apellido materno es requerido.";
      hasError = true;
    } else if (formData.apellidoMaterno.length > 50) {
      newApellidoMaError = "El apellido materno no debe exceder los 50 caracteres.";
      hasError = true;
    } else if (!soloLetrasRegex.test(formData.apellidoMaterno)) {
      newApellidoMaError = "Solo se permiten letras en el apellido materno.";
      hasError = true;
    }

    if (isContrasenaEmpty) {
      newContrasenaError = "La contraseña es requerida.";
      hasError = true;
    } else if (!ValidacionContra.test(formData.contrasena)) {
      newContrasenaError = "La contraseña debe tener entre 8 y 64 caracteres, e incluir al menos: una mayúscula, una minúscula, un número y un carácter especial (ej. @, $, !, %, *, ?, &, _, -).";
      hasError = true;
    }

    if (isConfirmarEmpty) {
      newConfirmarError = "Confirma tu contraseña.";
      hasError = true;
    } else if (formData.contrasena !== formData.confirmarContrasena) {
      newConfirmarError = "Las contraseñas no coinciden. Verificar que ambas sean idénticas.";
      hasError = true;
    }

    if (hasError) {
      setErrors({
        correo: newCorreoError,
        nombre: newNombreError,
        apellidoPa: newApellidoPaError,
        apellidoMaterno: newApellidoMaError,
        contrasena: newContrasenaError,
        confirmarContrasena: newConfirmarError,
        general: "",
      });
      return;
    }

    setLoading(true);

    try {
      const payloadBackend = {
        nombre: formData.nombre.trim(),
        apellidoPa: formData.apellidoPa.trim(),
        apellidoMa: formData.apellidoMaterno.trim() || undefined,
        correo: formData.correo.trim(),
        contrasena: formData.contrasena,
      };

      const response = await fetch(`${API_BASE_URL}/auth/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadBackend),
      });

      const data = await response.json();

      if (!response.ok) {
        let mensajeError = "Error al registrar el usuario.";
        
        if (Array.isArray(data.message)) {
          mensajeError = data.message.join(". ");
        } else if (typeof data.message === "string") {
          mensajeError = data.message;
        }

        throw new Error(mensajeError);
      }

      setCorreoRegistrado(data.correo || formData.correo.trim());

      if (!import.meta.env.PROD && typeof window !== "undefined" && data.token) {
        (window as any).__lastRegistrationToken = data.token;
      }

      setModalExitoAbierto(true);

    } catch (error: any) {
      setErrors((prev) => ({ ...prev, general: error.message || "Error al conectar con el servidor." }));
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModalExito = () => {
    setModalExitoAbierto(false);
    navigate(loginPath);
  };

  const handleCerrarModalIncompletos = () => {
    setModalIncompletosAbierto(false);
  };

  return {
    formData,
    errors,
    loading,
    loginPath,
    modalExitoAbierto,
    modalIncompletosAbierto,
    correoRegistrado,
    handleChange,
    handleSubmit,
    handleCerrarModalExito,
    handleCerrarModalIncompletos,
  };
}