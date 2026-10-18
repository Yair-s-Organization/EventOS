import { useState } from "react";
import { Input } from "../../components/atoms/Input/Input";
import { Label } from "../../components/atoms/Label/Label";
import { FieldMessage } from "../../components/atoms/FieldMessage/FieldMessage";
import { TextLink } from "../../components/atoms/TextLink/TextLink";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (!value.trim()) {
      setEmailError("El correo electrónico es requerido.");
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailError("El formato del correo electrónico no es válido.");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    if (!value) {
      setPasswordError("La contraseña es requerida.");
    } else if (value.length < 8) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let hasError = false;

    if (!email.trim()) {
      setEmailError("El correo electrónico es requerido.");
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("El formato del correo electrónico no es válido.");
      hasError = true;
    }

    if (!password) {
      setPasswordError("La contraseña es requerida.");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      hasError = true;
    }

    if (!hasError) {
      console.log("Enviando formulario", { email, password });
      // Petición a la API
    } else {
      console.log("Error: corrige los errores antes de continuar.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8">
        
        <h1 className="mb-8 text-center text-3xl font-merriweather font-bold text-[36px] text-gray-900">
          Iniciar Sesión
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="font-merriweather font-regular text-[16px]">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              hasError={!!emailError}
              aria-describedby="email-error"
            />
            {emailError && (
              <FieldMessage id="email-error" variant="error" className="mt-1">
                {emailError}
              </FieldMessage>
            )}
          </div>

          <div className="font-merriweather font-regular text-[16px]">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              hasError={!!passwordError}
              aria-describedby="password-error"
            />
            {passwordError && (
              <FieldMessage id="password-error" variant="error" className="mt-1">
                {passwordError}
              </FieldMessage>
            )}
          </div>

          <div className="my-4 flex items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-xs text-gray-400">
            [ CAPTCHA ]
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#2D3748] px-4 py-2.5 text-sm font-merriweather font-bold text-[16px] text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Iniciar Sesión
          </button>

          <div className="mt-6 text-center">
            <TextLink to="/registro" className="text-sky-500 hover:text-sky-600 italic font-merriweather font-semibold text-[16px]">
              ¿No tienes cuenta? Regístrate
            </TextLink>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;