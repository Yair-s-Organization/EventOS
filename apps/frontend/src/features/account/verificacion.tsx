import { Button } from "../../components/atoms/Button/Button";
import { Input } from "../../components/atoms/Input/Input";
import { FormField } from "../../components/molecules/FormField";
import { InputFile } from "../../components/atoms/InputFile/InputFile";
import { useVerificacion } from "../account/hooks/useVerificacion";

export function Verificacion() {
  const {
    tipoPerfil,
    formData,
    loading,
    error,
    solicitudPendiente,
    handleTipoPerfilChange,
    handleFileChange,
    handleInfoAdicionalChange,
    handleSubmit,
    handleVolverAlPerfil,
  } = useVerificacion();

  return (
    <div className="space-y-6 font-merriweather text-gray-800 w-full p-0">
      
      <div className="mb-2">
        <button onClick={handleVolverAlPerfil} className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          <span className="font-merriweather text-[16px] mr-3">← Volver al perfil</span>
        </button>
      </div>

      <div>
        <h1 className="text-[30px] font-bold text-gray-900 mb-2 font-merriweather">
          Verificación de identidad
        </h1>
        <p className="text-[20px] font-medium text-gray-700">
          Tu verificación se actualiza cada 3 meses y es necesaria para reservar boletos o solicitar eventos
        </p>
        <p className="text-[15px] text-gray-500 mt-1">
          Selecciona tu tipo de perfil y adjunta tu comprobante en formato PDF (máx. 5 MB) para acreditar tu cuenta.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm w-full font-merriweather">
          {error}
        </div>
      )}

      {solicitudPendiente ? (
        <div className="bg-white rounded-lg border border-amber-200 shadow-sm p-8 max-w-4xl mx-auto space-y-4">
          <div className="bg-[#fff7d6] border border-[#fce5a8] p-5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-semibold text-amber-900 text-base">
                Solicitud en proceso de revisión
              </p>
              <p className="text-sm text-amber-800">
                Tu solicitud de verificación fue enviada exitosamente y actualmente se encuentra en revisión por parte de Subdirección. Te notificaremos por correo electrónico una vez que sea evaluada.
              </p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-amber-200 text-amber-900 shrink-0">
              En revisión
            </span>
          </div>
          <div className="pt-2">
            <Button
              text="Volver al perfil"
              type="button"
              onClick={handleVolverAlPerfil}
              className="px-6 py-2.5 rounded-md text-sm shadow transition-colors"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <FormField label="Tipo de perfil" htmlFor="tipoPerfil">
            <select
              id="tipoPerfil"
              value={tipoPerfil}
              onChange={handleTipoPerfilChange}
              className=" -mb-5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-merriweather"
            >
              <option value="Estudiante">Estudiante</option>
              <option value="Externo">Externo</option>
              <option value="Empresa">Empresa</option>
              <option value="Profesor">Profesor</option>
            </select>
          </FormField>

          <div className="border-t border-gray-200 pt-4 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 font-merriweather">
              Documentación
            </h2>
            <p className="text-[16px] text-gray-600 font-merriweather">
              {tipoPerfil === "Estudiante" && "Sube tu número de boleta y tu credencial vigente del IPN en formato PDF. Asegúrate de que los datos sean legibles."}
              {tipoPerfil === "Externo" && "Adjunta una identificación oficial vigente (INE, pasaporte o cédula profesional) en formato PDF para validar tu identidad."}
              {tipoPerfil === "Empresa" && "Indica el nombre de la empresa o dependencia que representas y adjunta el acta constitutiva en PDF."}
              {tipoPerfil === "Profesor" && "Sube tu número de empleado y tu credencial vigente del IPN en formato PDF. Asegúrate de que los datos sean legibles."}
            </p>

            <div className=" -mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {tipoPerfil === "Empresa" && (
                <FormField label="Nombre de empresa o dependencia" htmlFor="infoAdicional">
                  <Input id="infoAdicional" type="text" placeholder="Indica el nombre de la empresa" value={formData.infoAdicional} onChange={handleInfoAdicionalChange}/>
                </FormField>
              )} 
              
              {tipoPerfil === "Profesor" && (
                <FormField label="Número de empleado" htmlFor="infoAdicional">
                  <Input id="infoAdicional" type="text" placeholder="Ingresa tu número de empleado" value={formData.infoAdicional} onChange={handleInfoAdicionalChange}/>
                </FormField>
              )} 
              
              {tipoPerfil === "Estudiante" && (
                <FormField label="Número de boleta" htmlFor="infoAdicional">
                  <Input id="infoAdicional" type="text" placeholder="Ingresa tu número de boleta" value={formData.infoAdicional} onChange={handleInfoAdicionalChange}/>
                </FormField>
              )}

              <div className={tipoPerfil === "Externo" ? "md:col-span-2" : ""}>
                <FormField
                  label={
                    tipoPerfil === "Empresa"
                      ? "Acta constitutiva"
                      : tipoPerfil === "Externo"
                      ? "Credencial o identificación vigente (PDF)"
                      : "Credencial Institucional (PDF)"
                  }htmlFor="archivo">
                  <InputFile id="archivo" accept=".pdf" placeholder="Sube tu archivo PDF aquí" onChange={handleFileChange}/>
                </FormField>
              </div>
            </div>
          </div>

          <div className="pt-0">
            <Button type="submit" text="Enviar solicitud de verificacion" loadingText="Enviando solicitud..." loading={loading} className="px-6 py-2.5 rounded-md text-sm transition-colors shadow"/>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}

export default Verificacion;