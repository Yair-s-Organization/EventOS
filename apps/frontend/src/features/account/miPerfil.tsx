import { Button } from "../../components/atoms/Button/Button";
import { usePerfil } from "../account/hooks/usePerfil";
import { User } from "lucide-react";

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
    return <div className="p-8 text-center font-merriweather text-gray-600">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="p-8 text-center font-merriweather text-eventos-error">{error}</div>;
  }

  return (
    <div className="space-y-6 font-merriweather text-gray-800">
      {!esVerificado && !esPersonalDirectivoOAdmin && (
        solicitudPendiente ? (
          <div className="bg-[#fff7d6] border-y border-[#fce5a8] px-7 py-3.5 flex items-center justify-between shadow-sm -mx-7 -mt-8 mb-8">
            <div className="flex items-center gap-2.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-sm font-medium text-amber-900">
                Tu solicitud de verificación se encuentra en revisión por parte de Subdirección
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-300">
              En revisión
            </span>
          </div>
        ) : (
          <div className="bg-[#fff7d6] border-y border-[#fce5a8] px-7 py-3.5 flex items-center justify-between shadow-sm -mx-7 -mt-8 mb-8">
            <p className="text-sm font-medium text-gray-900">
              Verifica tu cuenta para realizar una solicitud
            </p>
            <Button text="Verificar Cuenta" type="button" onClick={handleIrAVerificacion} className="text-xs px-4 py-2 rounded-md transition-colors shadow"/>
          </div>
        )
      )}

      <div className="mb-2">
        <button onClick={handleVolverAlMenu} className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
          <span className="font-merriweather text-[16px] mr-3">← Volver al menú</span>
        </button>
      </div>
      <div className="px-12">  
        <h1 className="text-[32px] font-bold text-gray-900 mb-6 font-merriweather">
          Perfil
        </h1>

        <div className="bg-white rounded-2xl border mx-auto border-gray-200 shadow-sm p-8 relative max-w-300 font-merriweather">
          
          {!esPersonalDirectivoOAdmin && (
            <div className="absolute top-6 right-6">
              <span className={`px-3 py-1 text-[14px] font-semibold rounded-full border ${
                esVerificado 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : solicitudPendiente
                  ? "bg-[#fff7d6] text-amber-800 border-[#fce5a8]"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}>
                {esVerificado
                  ? "Verificado"
                  : solicitudPendiente
                  ? "En revisión"
                  : "Sin verificar"}
              </span>
            </div>
          )}

          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-300 flex items-center justify-center text-gray-600 shrink-0">
              <User className="h-8 w-8 text-gray-500" />
            </div>

            <div className="font-merriweather text-[18px] space-y-2 grow">
              <h2 className="font-merriweather text-gray-900">
                {perfil?.nombreCompleto || "Nombre del Usuario"}
              </h2>
              <p className="text-gray-800 font-medium">
                Rol: <span className="font-merriweather font-normal">{datosDinamicos.rol}</span>
              </p>
              <p className="text-gray-800 font-medium">
                Tipo de usuario: <span className="font-merriweather font-normal">{datosDinamicos.tipo}</span>
              </p>

              <div className="pt-4">
                <Button text="Cerrar sesión" type="button" onClick={handleCerrarSesion} className="px-5 py-2 rounded-md text-sm transition-colors shadow-sm"/>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
}

export default Perfil;