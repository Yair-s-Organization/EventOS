import { Button } from "../../components/atoms/Button/Button";
import { usePerfil } from "../account/hooks/usePerfil";
import { User, ArrowLeft } from "lucide-react";

export function Perfil() {
  const {
    perfil,
    loading,
    error,
    esVerificado,
    solicitudPendiente,
    datosDinamicos,
    esPersonalDirectivoOAdmin,
    handleCerrarSesion,
    handleVolverAlMenu,
    handleIrAVerificacion,
  } = usePerfil();

  if (loading) {
    return (
      <div className="p-8 text-center font-merriweather text-gray-600">
        Cargando perfil...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center font-merriweather text-eventos-error">
        {error}
      </div>
    );
  }

  return (
    <>
      <div>
        {!esVerificado && !esPersonalDirectivoOAdmin && (
            solicitudPendiente ? (
              <div className="bg-alerta-verificacion border-y border-alerta-margen px-4 sm:px-7 py-3 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm -mx-4 sm:-mx-7 -mt-6 sm:-mt-8 mb-6">
                <div className="flex items-center gap-2.5">
                  <p className="text-sm sm:text-[16px] font-medium text-primary">
                    Tu solicitud de verificación se encuentra en revisión por parte de Subdirección
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-alerta-verificacion border-y border-alerta-margen px-4 sm:px-7 py-3 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm -mx-4 sm:-mx-7 -mt-6 sm:-mt-8 mb-6">
                <p className="text-sm sm:text-[16px] font-medium text-gray-900">
                  Verifica tu cuenta para realizar una solicitud
                </p>
                <Button
                  text="Verificar Cuenta"
                  type="button"
                  onClick={handleIrAVerificacion}
                  className="text-xs sm:text-[14px] px-4 py-2 rounded-md transition-colors shadow shrink-0 w-full sm:w-auto"
                />
              </div>
            )
          )}
      </div>

      <div className="space-y-6 font-merriweather text-gray-800 w-full max-w-400 mx-auto">
        <div className="mb-2">
          <button
            onClick={handleVolverAlMenu}
            className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-merriweather text-sm sm:text-[16px]">Volver al menú</span>
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-gray-900 mb-4 sm:mb-6 font-merriweather">
            Perfil
          </h1>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 md:p-8 relative font-merriweather">
            {!esPersonalDirectivoOAdmin && (
              <div className="flex justify-end pb-3 sm:pb-0 sm:absolute sm:top-6 sm:right-6">
                <span
                  className={`px-3 py-1 text-xs sm:text-[14px] font-semibold rounded-md border ${
                    esVerificado
                      ? "bg-green-50 text-green-700 border-green-200"
                      : solicitudPendiente
                      ? "bg-[#fff7d6] text-amber-800 border-[#fce5a8]"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
                >
                  {esVerificado
                    ? "Verificado"
                    : solicitudPendiente
                    ? "En revisión"
                    : "Sin verificar"}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 border border-gray-300 flex items-center justify-center text-gray-600 shrink-0">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
              </div>

              <div className="font-merriweather text-base sm:text-[18px] space-y-2 grow min-w-0 w-full sm:w-auto">
                <h2 className="font-merriweather font-bold sm:font-normal text-lg sm:text-2xl text-gray-900 wrap-break-word">
                  {perfil?.nombreCompleto || "Nombre del Usuario"}
                </h2>
                <p className="text-gray-800 font-medium text-sm sm:text-base wrap-break-word">
                  Rol: <span className="font-merriweather font-normal">{datosDinamicos.rol}</span>
                </p>
                <p className="text-gray-800 font-medium text-sm sm:text-base wrap-break-word">
                  Tipo de usuario: <span className="font-merriweather font-normal">{datosDinamicos.tipo}</span>
                </p>

                <div className="pt-4 flex justify-center sm:justify-start">
                  <Button
                    text="Cerrar sesión"
                    type="button"
                    onClick={handleCerrarSesion}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-md text-sm transition-colors shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Perfil;