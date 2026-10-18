import { useState } from "react";
import { Input } from "../../components/atoms/Input/Input";
import { Label } from "../../components/atoms/Label/Label";
import { TextLink } from "../../components/atoms/TextLink/TextLink";

export function Registro() {
  const [formData, setFormData] = useState({
    nombre: "",
    app: "",
    apm: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Datos de registro a enviar:", formData);
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8">
        
        <h1 className="mb-8 text-center text-3xl font-serif font-merriweather font-bold text-[36px]">
          Registro
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 font-merriweather font-regular text-[16px]">
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="app">Apellido Paterno</Label>
                <Input
                  id="app"
                  name="app"
                  type="text"
                  value={formData.app}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="apm">Apellido Materno</Label>
                <Input
                  id="apm"
                  name="apm"
                  type="text"
                  value={formData.apm}
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
                  value={formData.correo}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="contrasena">Contraseña</Label>
                <Input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  value={formData.contrasena}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="confirmarContrasena">Confirmar contraseña</Label>
                <Input
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  type="password"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                />
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

          {/* Enlace para volver a Iniciar Sesión */}
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