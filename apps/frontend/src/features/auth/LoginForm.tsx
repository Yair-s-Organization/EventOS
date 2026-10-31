import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router";
import { FieldMessage } from "../../components/atoms/FieldMessage/FieldMessage";
import { Input } from "../../components/atoms/Input/Input";
import { Button } from "../../components/atoms/Button/Button";
import { TextLink } from "../../components/atoms/TextLink/TextLink";
import { FormField } from "../../components/molecules/FormField";
import { PasswordField } from "../../components/molecules/PasswordField";
import { CaptchaField } from "../../components/molecules/CaptchaField";
import { AuthLayout } from "../../components/templates/AuthLayout";
import { Modal } from "../../components/molecules/Modal";

export function LoginForm() {
  const navigate = useNavigate();

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

    if (!captchaToken) {
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
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: formData.correo,
          contrasena: formData.contrasena,
          captchaToken: captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const mensajeServidor = data.message || "";
        if (
          mensajeServidor.toLowerCase().includes("bloqueado") ||
          mensajeServidor.toLowerCase().includes("intentos") ||
          response.status === 423
        ) {
          setModalBloqueoAbierto(true);
          throw new Error("");
        } else {
          throw new Error("Correo electrónico o contraseña incorrectos");
        }
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      const rol = data.usuario?.tipoCuenta;

      if (rol === "admin" || rol === "Administrador") {
        navigate("/gestion-espacios");
      } else if (rol === "subdireccion") {
        navigate("/detalles-solicitud"); 
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

  return (
    <AuthLayout title="Iniciar Sesión" generalError={errors.general}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <FormField label="Correo Electrónico" htmlFor="correo">
          <Input id="correo" type="email" name="correo" placeholder="Ingresar tu correo electrónico" aria-describedby="email-error" value={formData.correo} onChange={handleChange} hasError={!!errors.correo}/>
          <div className="min-h-1.5 mt-1">
            {errors.correo ? (
              <p className="mt-1 text-eventos-error text-xs font-merriweather">{errors.correo}</p>
            ) : (
              <FieldMessage variant="helper">
                Usa tu correo institucional (@ipn.mx, @alumno.ipn.mx) o tu cuenta personal. 
              </FieldMessage>
            )}
          </div>
        </FormField>

        <div className="-mt-12">
          <PasswordField id="contrasena" name="contrasena" label="Contraseña" placeholder="Ejemplo01!" value={formData.contrasena} onChange={handleChange} error={errors.contrasena}/>
        </div>    
        <CaptchaField recaptchaRef={recaptchaRef} onChange={handleCaptchaChange} error={captchaError}
          sitekey="6LddCvktAAAAAM980VTf7Y1lBBjUbjKEIOqMEXBi"
        />

        <Button fullWidth size="md" variant="primary" className="mt-2" type="submit" text="Iniciar Sesión" loadingText="Iniciando sesión..." loading={loading}/>

        <div className="mt-1 text-center">
          <TextLink to="/registro" className="text-sky-500 hover:text-sky-600 font-merriweather font-semibold text-[16px]">
            ¿No tienes cuenta? Regístrate
          </TextLink>
        </div>
      </form>

      <Modal titulo="Acceso bloqueado temporalmente" contenido="" mostrarModal={modalBloqueoAbierto} cerrarModal={() => setModalBloqueoAbierto(false)}>
        <div className="space-y-4 font-merriweather text-sm text-gray-700">
          <p>
            Has superado el límite de 5 intentos fallidos consecutivos de inicio de sesión.
          </p>
          <p>
            Por motivos de seguridad y protección contra accesos no autorizados, el ingreso a esta cuenta ha sido suspendido durante 30 minutos.
          </p>
          <div className="flex justify-end pt-2">
            <Button text="Cerrar" type="button" onClick={() => setModalBloqueoAbierto(false)} className="bg-[#5c1d33] hover:bg-[#4a1c2d] text-white px-6 py-2 rounded-md transition-colors shadow"/>
          </div>
        </div>
      </Modal>
    </AuthLayout>
  );
}

export default LoginForm;