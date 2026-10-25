import { useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "../../components/atoms/Input/Input";
import { Button } from "../../components/atoms/Button/Button";
import { FieldMessage } from "../../components/atoms/FieldMessage/FieldMessage";
import { TextLink } from "../../components/atoms/TextLink/TextLink";
import { FormField } from "../../components/molecules/FormField";
import { PasswordField } from "../../components/molecules/PasswordField";

export function Registro() {
  const navigate = useNavigate();
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
    contrasena: "",
    confirmarContrasena: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);

  const ValidacionContra = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$/;

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
        setErrors((prev) => ({ ...prev, correo: "El formato del correo electrónico no es válido." }));
      } else {
        setErrors((prev) => ({ ...prev, correo: "" }));
      }
    }

    if (name === "contrasena") {
      if (!value) {
        setErrors((prev) => ({ ...prev, contrasena: "La contraseña es requerida." }));
      } else if (!ValidacionContra.test(value)) {
        setErrors((prev) => ({
          ...prev,
          contrasena: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
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
      if (value !== formData.contrasena) {
        setErrors((prev) => ({ ...prev, confirmarContrasena: "Las contraseñas no coinciden." }));
      } else {
        setErrors((prev) => ({ ...prev, confirmarContrasena: "" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, general: "" }));
    let hasError = false;

    if (!formData.correo.trim()) {
      setErrors((prev) => ({ ...prev, correo: "El correo electrónico es requerido." }));
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      setErrors((prev) => ({ ...prev, correo: "El formato del correo electrónico no es válido." }));
      hasError = true;
    }

    if (!formData.contrasena) {
      setErrors((prev) => ({ ...prev, contrasena: "La contraseña es requerida." }));
      hasError = true;
    } else if (!ValidacionContra.test(formData.contrasena)) {
      setErrors((prev) => ({
        ...prev,
        contrasena: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
      }));
      hasError = true;
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      setErrors((prev) => ({ ...prev, confirmarContrasena: "Las contraseñas no coinciden." }));
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const payloadBackend = {
        nombre: formData.nombre,
        apellidoPa: formData.apellidoPa,
        apellidoMa: formData.apellidoMaterno || undefined,
        correo: formData.correo,
        contrasena: formData.contrasena,
      };

      const response = await fetch("http://localhost:3000/api/auth/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadBackend),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar el usuario.");
      }

      console.log("Usuario registrado con éxito:", data);
      navigate("/login");

    } catch (error: any) {
      setErrors((prev) => ({ ...prev, general: error.message || "Error al conectar con el servidor." }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-sm border border-gray-100">
        
        <h1 className="mb-8 text-center text-3xl font-serif font-merriweather font-bold text-[36px] text-gray-900">
          Registro
        </h1>

        {errors.general && (
          <div className="mb-4 rounded bg-red-50 p-3 text-center text-sm text-red-600 border border-red-200">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 font-merriweather font-regular text-[16px]">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
              <h2 className="mb-4 text-3xl font-serif font-merriweather font-medium text-[20px] text-gray-900">
          Datos de la Cuenta</h2>
              <h2 className="mb-1 text-3xl font-serif font-merriweather font-medium text-[20px] text-gray-900">
          Datos Personales</h2>
            </div>
            {/* Fila 1: Nombre y Correo */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
              <FormField label="Correo Electrónico" htmlFor="correo" required errorMessage={errors.correo}>
                <Input 
                  id="correo" 
                  name="correo" 
                  type="email" 
                  placeholder="Ingresa tu correo electrónico" 
                  value={formData.correo}
                  onChange={handleChange}
                  hasError={!!errors.correo}
                  aria-describedby="email-error"
                />
                <FieldMessage variant="helper" className="mt-1">
                  Usa tu correo institucional (@ipn.mx, @alumno.ipn.mx) o tu cuenta personal. 
                </FieldMessage>
              </FormField>
              <FormField label="Nombre(s)" htmlFor="nombre" required>
                <Input 
                  id="nombre" 
                  name="nombre" 
                  type="text" 
                  placeholder="Ingresa tu nombre" 
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </FormField>

            </div>

            {/* Fila 2: Apellido Paterno y Contraseña */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
              <div>
                <PasswordField 
                  id="contrasena" 
                  name="contrasena" 
                  label="Contraseña" 
                  placeholder="●●●●●●●" 
                  value={formData.contrasena}
                  onChange={handleChange}
                  required
                  error={errors.contrasena}
                />
                {!errors.contrasena && (
                  <FieldMessage variant="helper" className="mt-1">
                    La contraseña debe de tener entre 8 y 64 caracteres (Incluir mayúsculas, minúsculas, números y caracteres especiales)
                  </FieldMessage>
                )}
              </div>
              <FormField label="Apellido Paterno" htmlFor="apellidoPa" required>
                <Input 
                  id="apellidoPa" 
                  name="apellidoPa" 
                  type="text" 
                  placeholder="Ingresa tu apellido paterno"
                  value={formData.apellidoPa}
                  onChange={handleChange}
                  required
                />
              </FormField>

            </div>

            {/* Fila 3: Apellido Materno y Confirmar contraseña */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
              <PasswordField 
                id="confirmarContrasena" 
                name="confirmarContrasena" 
                label="Confirmar contraseña" 
                placeholder="●●●●●●●"
                value={formData.confirmarContrasena}
                onChange={handleChange}
                required
                error={errors.confirmarContrasena}
              />
              <FormField label="Apellido Materno" htmlFor="apellidoMaterno">
                <Input 
                  id="apellidoMaterno" 
                  name="apellidoMaterno" 
                  placeholder="Ingresa tu apellido materno" 
                  type="text"
                  value={formData.apellidoMaterno}
                  onChange={handleChange}
                />
              </FormField>

            </div>

          </div>

          <div className="flex justify-center pt-2">
            <Button 
              type="submit" 
              text="Registrar" 
              loadingText="Registrando..." 
              loading={loading} 
              fullWidth 
              size="md"
              variant="primary"
              className="max-w-xs"
            />
          </div>

          <div className="mt-4 text-center">
            <TextLink to="/login" className="text-sky-500 font-merriweather font-semibold text-[16px] hover:text-sky-600">
              ¿Ya tienes cuenta? Inicia sesión
            </TextLink>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registro;