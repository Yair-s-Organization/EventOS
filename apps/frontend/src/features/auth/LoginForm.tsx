import { FieldMessage } from "../../components/atoms/FieldMessage/FieldMessage";
import { Input } from "../../components/atoms/Input/Input";
import { Button } from "../../components/atoms/Button/Button";
import { TextLink } from "../../components/atoms/TextLink/TextLink";
import { FormField } from "../../components/molecules/FormField";
import { PasswordField } from "../../components/molecules/PasswordField";
import { CaptchaField } from "../../components/molecules/CaptchaField";
import { AuthLayout } from "../../components/templates/AuthLayout";
import { Modal } from "../../components/molecules/Modal";
import { getAuthPathWithReturnUrl } from "../event-details/utils/eventReturnUrl";
import { useLoginForm } from "../auth/hooks/useLoginForm";

export function LoginForm() {
  const {
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
  } = useLoginForm();

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

        <div className="-mt-8">
          <PasswordField id="contrasena" name="contrasena" label="Contraseña" placeholder="Ejemplo01!" value={formData.contrasena} onChange={handleChange} error={errors.contrasena}/>
        </div>    
        {!isCaptchaDisabled && (
          <CaptchaField recaptchaRef={recaptchaRef} onChange={handleCaptchaChange} error={captchaError}
            sitekey="6LddCvktAAAAAM980VTf7Y1lBBjUbjKEIOqMEXBi"
          />
        )}

        <Button fullWidth size="md" variant="primary" className="mt-2" type="submit" text="Iniciar Sesión" loadingText="Iniciando sesión..." loading={loading}/>

        <div className="mt-1 text-center">
          <TextLink to={("/recuperar-contrasena")} className="text-sky-500 hover:text-sky-600 font-merriweather font-semibold text-[16px]">
            ¿Olvidaste tu contraseña?
          </TextLink>
        </div>
        <div className="mt-1 text-center">
          <TextLink to={getAuthPathWithReturnUrl("/registro", returnPath)} className="text-sky-500 hover:text-sky-600 font-merriweather font-semibold text-[16px]">
            ¿No tienes cuenta? Regístrate
          </TextLink>
        </div>
      </form>

      <Modal titulo="Acceso bloqueado temporalmente" contenido="" mostrarModal={modalBloqueoAbierto} cerrarModal={cerrarModalBloqueo}>
        <div className="space-y-4 font-merriweather text-sm text-gray-700">
          <p>
            Has superado el límite de 5 intentos fallidos consecutivos de inicio de sesión.
          </p>
          <p>
            Por motivos de seguridad y protección contra accesos no autorizados, el ingreso a esta cuenta ha sido suspendido durante 30 minutos.
          </p>
          <div className="flex justify-end pt-2">
            <Button text="Cerrar" type="button" onClick={cerrarModalBloqueo} className="bg-[#5c1d33] hover:bg-[#4a1c2d] text-white px-6 py-2 rounded-md transition-colors shadow"/>
          </div>
        </div>
      </Modal>
    </AuthLayout>
  );
}

export default LoginForm;