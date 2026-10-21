import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Input } from "../../components/atoms/Input/Input";
import { Label } from "../../components/atoms/Label/Label";
import { FieldMessage } from "../../components/atoms/FieldMessage/FieldMessage";
import { TextLink } from "../../components/atoms/TextLink/TextLink";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [captchaError, setCaptchaError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (token){
      setCaptchaError("");
    }
  };

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

    if (!captchaToken) {
      setCaptchaError("Por favor, confirma que no eres un robot.");
      hasError = true;
    }

    if (!hasError) {
      console.log("Enviando formulario", { email, password })
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handlePasswordChange}
                hasError={!!passwordError}
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
                  /* Ocultar */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243M12 9.75l2.25 2.25" />
                  </svg>
                ) : (
                  /* Mostrar */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            {passwordError && (
              <FieldMessage id="password-error" variant="error" className="mt-1">
                {passwordError}
              </FieldMessage>
            )}
          </div>

          <div className="my-0 mt-0 flex items-center justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"//aquí va nuestra key una vez que lo registremos en google para que nos den las key
              onChange={handleCaptchaChange}
            />
          </div>  
          <div className="flex mt-0 justify-center">
            {captchaError && (
              <FieldMessage variant="error" className="text-center">
                {captchaError}
              </FieldMessage>
            )}
          </div>  
          

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-[#2D3748] px-4 py-2.5 text-sm font-merriweather font-bold text-[16px] text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
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