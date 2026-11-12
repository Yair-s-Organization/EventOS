import { useState } from "react";
import { useNavigate } from "react-router";
import { API_BASE_URL } from "../../lib/apiClient";
import { Input } from "../../components/atoms/Input/Input";
import { Button } from "../../components/atoms/Button/Button";
import { TextLink } from "../../components/atoms/TextLink/TextLink";
import { FormField } from "../../components/molecules/FormField";
import { AuthLayout } from "../../components/templates/AuthLayout";
import { Modal } from "../../components/molecules/Modal";
import { Mail } from "lucide-react";

export function SolicitarRecuperacion() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!correo.trim()) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/recuperar-contrasena`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al solicitar la recuperación.");
      }

      setModalExitoAbierto(true);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

      const handleCerrarModalExito = () => {
    setModalExitoAbierto(false);
    navigate("/login");
  };

  return (
    <AuthLayout title="Recuperar Contraseña" generalError={error}>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <p className="text-sm text-gray-600 font-merriweather">
          Ingresa tu correo electrónico registrado y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <FormField label="Correo Electrónico" htmlFor="correo">
          <Input id="correo" type="email" name="correo" placeholder="Ingresa tu correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} hasError={!!error}/>
        </FormField>

        <Button fullWidth size="md" variant="primary" type="submit" text="Enviar enlace" loadingText="Enviando..." loading={loading}/>

        <div className="mt-4 text-center">
          <TextLink to="/login" className="text-sky-500 hover:text-sky-600 font-merriweather font-semibold text-[16px]">
            ← Volver a Iniciar Sesión
          </TextLink>
        </div>
      </form>

    <Modal
        titulo="Correo enviado"
        mostrarModal={modalExitoAbierto}
        cerrarModal={handleCerrarModalExito}
      >
        <div className="space-y-4 font-merriweather text-gray-700">
          <div className="flex justify-center my-2">
            <div className="bg-primary/10 p-4 rounded-full text-primary">
              <Mail className="w-12 h-12" />
            </div>
          </div>
          <p className="text-center font-bold text-gray-900 text-lg">
            ¡Tu solicitud de recuperación ha sido procesada!
          </p>
          <p className="text-sm text-center leading-relaxed text-gray-600">
            Hemos enviado un enlace al correo ingresado.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 space-y-1.5">
            <p className="leading-relaxed">
              Abre el correo que te enviamos y presiona el botón <strong>"Restablecer mi contraseña"</strong>. Esto te redirigirá para cambiar tu contraseña por una nueva.
            </p>
            <p className="text-amber-800 italic pt-1 border-t border-amber-200/70">
              * Recuerda revisar tu carpeta de spam o correo no deseado. El enlace expira en 15 minutos.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <Button
              text="Entendido, ir al inicio de sesión"
              type="button"
              onClick={handleCerrarModalExito}
              className="font-merriweather text-sm px-6 py-2.5 rounded-md transition-colors shadow"
            />
          </div>
        </div>
      </Modal>

    </AuthLayout>
  );
}
export default SolicitarRecuperacion;