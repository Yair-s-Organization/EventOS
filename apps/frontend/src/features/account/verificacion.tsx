import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/atoms/Button/Button";
import { Input } from "../../components/atoms/Input/Input";
import { FormField } from "../../components/molecules/FormField";
import { InputFile } from "../../components/atoms/InputFile/InputFile";

export function Verificacion() {
  const navigate = useNavigate();
  const [tipoPerfil, setTipoPerfil] = useState("Estudiante");
  const [formData, setFormData] = useState({
    infoAdicional: "",
    archivo: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    return usuario.token || localStorage.getItem("token") || "";
  };

  const handleTipoPerfilChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTipoPerfil(e.target.value);
    setFormData((prev) => ({ ...prev, infoAdicional: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, archivo: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.archivo) {
      setError("Por favor adjunta el archivo PDF correspondiente.");
      return;
    }

    setLoading(true);
    try {
      // Creamos un FormData para enviar archivos y texto por multipart/form-data
      const data = new FormData();
      data.append("tipoPerfil", tipoPerfil);
      data.append("informacionAdicional", formData.infoAdicional);
      data.append("documentoPDF", formData.archivo); // Coincide exactamente con FileInterceptor('documentoPDF')

      const response = await fetch("http://localhost:3000/api/usuarios/verificar", {
        method: "POST",
        headers: {
          // Nota: No se especifica "Content-Type" cuando se usa FormData; 
          // el navegador se encarga de poner el boundary correcto automáticamente.
          Authorization: `Bearer ${getToken()}`,
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error al enviar la solicitud de verificación.");
      }

      navigate("/perfil");
    } catch (err: any) {
      setError(err.message || "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-merriweather text-gray-800 w-full p-0">
      
      <div className="mb-2">
        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          <span className="font-merriweather text-[16px] mr-3">← Volver al menú</span>
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
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm w-full">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <FormField label="Tipo de perfil" htmlFor="tipoPerfil">
            <select
              id="tipoPerfil"
              value={tipoPerfil}
              onChange={handleTipoPerfilChange}
              className=" -mb-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-merriweather"
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

            <div className=" -mb-15 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {tipoPerfil === "Empresa" && (
                <FormField label="Nombre de empresa o dependencia" htmlFor="infoAdicional">
                  <Input id="infoAdicional" type="text" placeholder="Indica el nombre de la empresa" value={formData.infoAdicional} onChange={(e) => setFormData({ ...formData, infoAdicional: e.target.value })}/>
                </FormField>
              )} 
              
              {tipoPerfil === "Profesor" && (
                <FormField label="Número de empleado" htmlFor="infoAdicional">
                  <Input id="infoAdicional" type="text" placeholder="Ingresa tu número de empleado" value={formData.infoAdicional} onChange={(e) => setFormData({ ...formData, infoAdicional: e.target.value })}/>
                </FormField>
              )} 
              
              {tipoPerfil === "Estudiante" && (
                <FormField label="Número de boleta" htmlFor="infoAdicional">
                  <Input id="infoAdicional" type="text" placeholder="Ingresa tu número de boleta" value={formData.infoAdicional} onChange={(e) => setFormData({ ...formData, infoAdicional: e.target.value })}/>
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
    </div>
  );
}

export default Verificacion;