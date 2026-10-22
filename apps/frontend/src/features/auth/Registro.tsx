import { useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "../../components/atoms/Input/Input";
import { Label } from "../../components/atoms/Label/Label";
import { TextLink } from "../../components/atoms/TextLink/TextLink";
import { FieldMessage } from "../../components/atoms/FieldMessage/FieldMessage";

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

  const [showPassword, setShowPassword] = useState(false);

  const ValidacionContra = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

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
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8">
        
        <h1 className="mb-8 text-center text-3xl font-serif font-merriweather font-bold text-[36px]">
          Registro
        </h1>

        {errors.general && (
          <div className="mb-4 rounded bg-red-50 p-3 text-center text-sm text-red-600 border border-red-200">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 font-merriweather font-regular text-[16px]">
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre(s)</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="apellidoPa">Apellido Paterno</Label>
                <Input
                  id="apellidoPa"
                  name="apellidoPa"
                  type="text"
                  value={formData.apellidoPa}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
                <Input
                  id="apellidoMaterno"
                  name="apellidoMaterno"
                  type="text"
                  value={formData.apellidoMaterno}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  placeholder="ejemplo@dominio.extensión"
                  value={formData.correo}
                  onChange={handleChange}
                  hasError={!!errors.correo}
                  aria-describedby="email-error"
                />
                {errors.correo && (
                  <FieldMessage id="email-error" variant="error" className="mt-1">
                    {errors.correo}
                  </FieldMessage>
                )}  
              </div>

              <div>
                <Label htmlFor="contrasena">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="contrasena"
                    name="contrasena"
                    type={showPassword ? "text" : "password"}
                    value={formData.contrasena}
                    placeholder="••••••••"
                    onChange={handleChange}
                    hasError={!!errors.contrasena}
                    aria-describedby="password-error"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243M12 9.75l2.25 2.25" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>

                {errors.contrasena ? (
                  <FieldMessage id="password-error" variant="error" className="mt-1">
                    {errors.contrasena}
                  </FieldMessage>
                ) : (
                  <FieldMessage variant="helper" className="mt-1">
                    Mín. 8 caracteres (Incluir mayúsculas, minúsculas, números y caracteres especiales)
                  </FieldMessage>
                )}
              </div>

              <div>
                <Label htmlFor="confirmarContrasena">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmarContrasena"
                    name="confirmarContrasena"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repetir Contraseña"
                    value={formData.confirmarContrasena}
                    onChange={handleChange}
                    hasError={!!errors.confirmarContrasena}
                    aria-describedby="confirm-error"
                    className="pr-10"
                  />
                </div>
                {errors.confirmarContrasena && (
                  <FieldMessage id="confirm-error" variant="error" className="mt-1">
                    {errors.confirmarContrasena}
                  </FieldMessage>
                )}
              </div>
            </div>

          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="w-full max-w-xs rounded-lg bg-[#2D3748] px-6 py-2.5 text-sm font-merriweather font-bold text-[16px] text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500">
              Registrar
            </button>
          </div>

          <div className="mt-4 text-center">
            <TextLink to="/login" className="text-sky-500 font-merriweather font-semibold text-[16px] hover:text-sky-600 italic">
              ¿Ya tienes cuenta? Inicia sesión
            </TextLink>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registro;