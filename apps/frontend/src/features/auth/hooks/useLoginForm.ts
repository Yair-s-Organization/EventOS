import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate, useSearchParams } from "react-router";
import { API_BASE_URL } from "../../../lib/apiClient";
import { getEventReturnPath } from "../../event-details/utils/eventReturnUrl";

export function useLoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPath = getEventReturnPath(searchParams.get("returnUrl"));

  const [formData, setFormData] = useState({
    correo: "",
    contrasena: "",
  });

  const [errors, setErrors] = useState({
    correo: "",
    contrasena: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [modalBloqueoAbierto, setModalBloqueoAbierto] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const isCaptchaDisabled =
    !import.meta.env.PROD &&
    (import.meta.env.VITE_DISABLE_CAPTCHA === "true" ||
      import.meta.env.MODE === "test" ||
      (typeof window !== "undefined" &&
        (window.location.search.includes("disable_captcha=true") ||
          window.sessionStorage.getItem("DISABLE_CAPTCHA") === "true")));

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (token) setCaptchaError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "correo") {
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, correo: "El correo electrónico es requerido." }));
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        setErrors((prev) => ({ ...prev, correo: "Ingresa un correo valido. Ejemplo: usuario@alumno.ipn.mx" }));
      } else {
        setErrors((prev) => ({ ...prev, correo: "" }));
      }
    }

    if (name === "contrasena") {
      if (!value) {
        setErrors((prev) => ({ ...prev, contrasena: "La contraseña es requerida." }));
      } else {
        setErrors((prev) => ({ ...prev, contrasena: "" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, general: "" }));
    setCaptchaError("");

    let newCorreoError = "";
    let newContrasenaError = "";
    let newCaptchaError = "";
    let hasError = false;

    if (!formData.correo.trim()) {
      newCorreoError = "El correo electrónico es requerido.";
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newCorreoError = "Ingresa un correo valido. Ejemplo: usuario@alumno.ipn.mx";
      hasError = true;
    }

    if (!formData.contrasena) {
      newContrasenaError = "La contraseña es requerida.";
      hasError = true;
    }

    if (!isCaptchaDisabled && !captchaToken) {
      newCaptchaError = "Por favor, confirma que no eres un robot.";
      hasError = true;
    }

    const faltaCampoGeneral = !formData.correo.trim() || !formData.contrasena;

    if (hasError) {
      setErrors((prev) => ({
        ...prev,
        general: faltaCampoGeneral ? "Por favor, completa todos los campos" : "",
        correo: newCorreoError,
        contrasena: newContrasenaError,
      }));
      setCaptchaError(newCaptchaError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: formData.correo,
          contrasena: formData.contrasena,
          captchaToken: captchaToken || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let mensajeServidor = "";
        if (Array.isArray(data.message)) {
          mensajeServidor = data.message.join(", ");
        } else {
          mensajeServidor = data.message || "";
        }

        if (
          mensajeServidor.toLowerCase().includes("bloqueado") ||
          mensajeServidor.toLowerCase().includes("intentos") ||
          response.status === 423
        ) {
          setModalBloqueoAbierto(true);
          throw new Error("");
        } else {
          throw new Error(mensajeServidor || "Correo electrónico o contraseña incorrectos");
        }
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      const rol = data.usuario?.tipoCuenta;

      if (returnPath) {
        navigate(returnPath, { replace: true });
      } else if (rol === "admin" || rol === "Administrador") {
        navigate("/menu-admin");
      } else if (rol === "Subdirección") {
        navigate("/subdireccion/menu-principal"); 
      } else {
        navigate("/menu-asistente");
      }

    } catch (error: any) {
      if (error.message) {
        setErrors((prev) => ({
          ...prev,
          general: error.message,
        }));
      }
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const cerrarModalBloqueo = () => {
    setModalBloqueoAbierto(false);
  };

  return {
    formData,
    errors,
    loading,
    captchaError,
    modalBloqueoAbierto,
    recaptchaRef,
    returnPath,
    isCaptchaDisabled,
    handleChange,
    handleCaptchaChange,
    handleSubmit,
    cerrarModalBloqueo,
  };
}