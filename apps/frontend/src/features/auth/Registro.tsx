import { CheckCircle2, Mail } from "lucide-react";
import { Input } from "../../components/atoms/Input/Input";
import { Button } from "../../components/atoms/Button/Button";
import { FieldMessage } from "../../components/atoms/FieldMessage/FieldMessage";
import { TextLink } from "../../components/atoms/TextLink/TextLink";
import { FormField } from "../../components/molecules/FormField";
import { PasswordField } from "../../components/molecules/PasswordField";
import { FeedbackNotice } from "../../components/molecules/FeedbackNotice";
import { Modal } from "../../components/molecules/Modal";
import { useRegistro } from "../auth/hooks/useRegistro";

export function Registro() {
  const {
    formData,
    errors,
    loading,
    validandoInvitacion,
    datosInvitacion,
    correoBloqueadoPorInvitacion,
    registroDirectoCompletado,
    loginPath,
    modalExitoAbierto,
    modalIncompletosAbierto,
    correoRegistrado,
    handleChange,
    handleSubmit,
    handleCerrarModalExito,
    handleCerrarModalIncompletos,
  } = useRegistro();

  const textoRolInvitacion =
    datosInvitacion?.tipo === "INVITACION_LOGISTICA"
      ? "Personal de Logística"
      : "Invitado a Evento Privado";

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-sm border border-gray-100">
        
        <h1 className="mb-8 text-center text-3xl font-merriweather font-bold text-[36px] text-gray-900">
          Registro
        </h1>

        {validandoInvitacion && (
          <div className="mb-4 rounded bg-slate-50 p-3 text-center text-sm text-gray-700 border border-slate-200">
            Validando enlace de invitación...
          </div>
        )}

        {datosInvitacion && (
          <div className="mb-6">
            <FeedbackNotice
              variant="success"
              title={`Invitación a ${textoRolInvitacion}`}
            >
              Estás completando tu registro para{" "}
              <strong>{datosInvitacion.nombreEvento}</strong>. Al terminar, tu
              cuenta se activará de inmediato y quedará vinculada al evento.
            </FeedbackNotice>
          </div>
        )}

        {errors.general && (
          <div className="mb-4 rounded bg-red-50 p-3 text-center text-sm text-eventos-error border border-red-200">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 font-merriweather font-regular text-[16px]">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
              <h2 className="mb-4 text-3xl font-merriweather font-medium text-[20px] text-gray-900">
                Datos de la Cuenta
              </h2>
              <h2 className="mb-1 text-3xl font-merriweather font-medium text-[20px] text-gray-900">
                Datos Personales
              </h2>
            </div>

            <div className="-mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
              <FormField label="Correo Electrónico" htmlFor="correo">
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  placeholder="Ingresa tu correo electrónico"
                  value={formData.correo}
                  onChange={handleChange}
                  disabled={correoBloqueadoPorInvitacion || validandoInvitacion}
                  hasError={!!errors.correo}
                  aria-describedby="email-error"
                />
                <div className="min-h-10.5 mt-1">
                  {errors.correo ? (
                    <p className="text-eventos-error text-xs font-merriweather">{errors.correo}</p>
                  ) : (
                    <FieldMessage variant="helper">
                      {correoBloqueadoPorInvitacion
                        ? "Este correo corresponde a tu invitación y quedará vinculado automáticamente."
                        : "Usa tu correo institucional (@ipn.mx, @alumno.ipn.mx) o tu cuenta personal."}
                    </FieldMessage>
                  )}
                </div>
              </FormField>

              <FormField label="Nombre(s)" htmlFor="nombre">
                <Input id="nombre" name="nombre" type="text" placeholder="Ingresa tu nombre" value={formData.nombre} onChange={handleChange} hasError={!!errors.nombre} maxLength={50}/>
                <div className="min-h-10.5 mt-1">
                  {errors.nombre && (
                    <p className="text-eventos-error text-xs font-merriweather">{errors.nombre}</p>
                  )}
                </div>
              </FormField>
            </div>

            <div className="mb-2 grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
              <div>
                <PasswordField id="contrasena" name="contrasena" label="Contraseña" placeholder="Ejemplo01!" value={formData.contrasena} onChange={handleChange} error={errors.contrasena}/>
                <div className="mt-2">
                  {!errors.contrasena && (
                    <FieldMessage variant="helper">
                      Tu contraseña debe tener entre 8 y 64 caracteres, y contener al menos: una mayúscula, una minúscula, un número y un carácter especial (ej. @, $, !, %, *, ?, &, _, -).
                    </FieldMessage>
                  )}
                </div>
              </div>

              <FormField label="Apellido Paterno" htmlFor="apellidoPa">
                <Input id="apellidoPa" name="apellidoPa" type="text" placeholder="Ingresa tu apellido paterno" value={formData.apellidoPa} onChange={handleChange} hasError={!!errors.apellidoPa} maxLength={50}/>
                <div className="min-h-10.5 mt-1">
                  {errors.apellidoPa && (
                    <p className="text-eventos-error text-xs font-merriweather">{errors.apellidoPa}</p>
                  )}
                </div>
              </FormField>
            </div>

            <div className="-mb-4 grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
              <PasswordField id="confirmarContrasena" name="confirmarContrasena" label="Confirmar contraseña" placeholder="Ejemplo01!" value={formData.confirmarContrasena} onChange={handleChange} error={errors.confirmarContrasena}/>
              <FormField label="Apellido Materno" htmlFor="apellidoMaterno">
                <Input id="apellidoMaterno" name="apellidoMaterno" placeholder="Ingresa tu apellido materno" type="text" value={formData.apellidoMaterno} onChange={handleChange} hasError={!!errors.apellidoMaterno} maxLength={50}/>
                <div className="min-h-10.5 mt-1">
                  {errors.apellidoMaterno && (
                    <p className="text-eventos-error text-xs font-merriweather">{errors.apellidoMaterno}</p>
                  )}
                </div>
              </FormField>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              text="Registrar"
              loadingText="Registrando..."
              loading={loading}
              disabled={validandoInvitacion}
              fullWidth
              size="md"
              variant="primary"
              className="max-w-xs"
            />
          </div>

          <div className="mt-4 text-center">
            <TextLink to={loginPath} className="text-sky-500 font-merriweather font-semibold text-[16px] hover:text-sky-600">
              ¿Ya tienes cuenta? Inicia sesión
            </TextLink>
          </div>
        </form>
      </div>

      <Modal
        titulo={
          registroDirectoCompletado
            ? "¡Registro completado!"
            : "¡Verifica tu correo electrónico!"
        }
        mostrarModal={modalExitoAbierto}
        cerrarModal={handleCerrarModalExito}
      >
        {registroDirectoCompletado ? (
          <div className="space-y-4 font-merriweather text-gray-700">
            <div className="flex justify-center my-2">
              <div className="bg-[#5c1d33]/10 p-4 rounded-full text-primary">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            </div>
            <p className="text-center font-bold text-gray-900 text-lg">
              ¡Tu cuenta ha sido activada y vinculada al evento!
            </p>
            <p className="text-sm text-center leading-relaxed text-gray-600">
              Registramos tu cuenta con{" "}
              <strong className="text-gray-900">
                {correoRegistrado || formData.correo}
              </strong>{" "}
              y ya quedaste vinculado{" "}
              {datosInvitacion?.nombreEvento
                ? `a ${datosInvitacion.nombreEvento}`
                : "al evento"}
              . Ya puedes iniciar sesión en EventOS.
            </p>
            <div className="flex justify-center pt-2">
              <Button
                text="Ir al inicio de sesión"
                type="button"
                onClick={handleCerrarModalExito}
                className="font-merriweather text-sm px-6 py-2.5 rounded-md transition-colors shadow"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 font-merriweather text-gray-700">
            <div className="flex justify-center my-2">
              <div className="bg-[#5c1d33]/10 p-4 rounded-full text-primary">
                <Mail className="w-12 h-12" />
              </div>
            </div>
            <p className="text-center font-bold text-gray-900 text-lg">
              ¡Tu solicitud de registro ha sido procesada!
            </p>
            <p className="text-sm text-center leading-relaxed text-gray-600">
              Hemos enviado un enlace de confirmación a{" "}
              <strong className="text-gray-900">
                {correoRegistrado || formData.correo}
              </strong>
              .
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 space-y-1.5">
              <p className="leading-relaxed">
                Abre el correo que te enviamos y presiona el botón{" "}
                <strong>"Verificar mi correo y activar cuenta"</strong>. Una vez
                confirmado, tu cuenta quedará dada de alta y podrás iniciar
                sesión.
              </p>
              <p className="text-amber-800 italic pt-1 border-t border-amber-200/70">
                * Recuerda revisar tu carpeta de spam o correo no deseado. El
                enlace expira en 15 minutos.
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
        )}
      </Modal>

      <Modal titulo="Campos obligatorios incompletos" contenido="" mostrarModal={modalIncompletosAbierto} cerrarModal={handleCerrarModalIncompletos}>
        <div className="space-y-4 font-merriweather text-sm text-gray-700">
          <p> Por favor completa todos los campos obligatorios resaltados para continuar.</p>
          <div className="flex justify-end pt-2">
            <Button text="Cerrar" type="button" onClick={handleCerrarModalIncompletos} className="px-6 py-2 rounded-md transition-colors shadow"/>
          </div>
        </div>
      </Modal>

    </div>
  );
}

export default Registro;