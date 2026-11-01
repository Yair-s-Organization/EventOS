import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/atoms/Button/Button";
import { Input } from "../../components/atoms/Input/Input";

interface CandidatoJefe {
  idUsuario: number;
  boleta: string;
  nombre: string;
  correoInstitucional: string;
  esJefeAcademia: boolean;
}

export function JefeDepartamento() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"asignar" | "revocar">("asignar");
  const [candidatos, setCandidatos] = useState<CandidatoJefe[]>([]);
  const [jefesActivos, setJefesActivos] = useState<CandidatoJefe[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<CandidatoJefe | null>(null);
  const [accionTipo, setAccionTipo] = useState<"asignar" | "revocar">("asignar");

  const getToken = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    return usuario.token || localStorage.getItem("token") || "";
  };

  const cargarDatos = async (tab: "asignar" | "revocar", query = "") => {
    setLoading(true);
    try {
      const endpoint =
        tab === "asignar"
          ? `http://localhost:3000/api/usuarios/jefes-departamento/candidatos${query ? `?buscar=${encodeURIComponent(query)}` : ""}`
          : `http://localhost:3000/api/usuarios/jefes-departamento/activos${query ? `?buscar=${encodeURIComponent(query)}` : ""}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener los datos");

      const data = await response.json();
      if (tab === "asignar") {
        setCandidatos(data);
      } else {
        setJefesActivos(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos(activeTab, busqueda);
  }, [activeTab]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarDatos(activeTab, busqueda);
  };

  const abrirModal = (usuario: CandidatoJefe, tipo: "asignar" | "revocar") => {
    setUsuarioSeleccionado(usuario);
    setAccionTipo(tipo);
    setModalAbierto(true);
  };

  const ejecutarAccion = async () => {
    if (!usuarioSeleccionado) return;

    try {
      const endpoint =
        accionTipo === "asignar"
          ? `http://localhost:3000/api/usuarios/${usuarioSeleccionado.idUsuario}/asignar-jefe`
          : `http://localhost:3000/api/usuarios/${usuarioSeleccionado.idUsuario}/revocar-jefe`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error en la operación");

      setMensajeExito(data.mensaje);
      setTimeout(() => setMensajeExito(null), 4000);

      cargarDatos(activeTab, busqueda);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setModalAbierto(false);
      setUsuarioSeleccionado(null);
    }
  };

  const listaActual = activeTab === "asignar" ? candidatos : jefesActivos;

  return (
    <div className="space-y-6 font-merriweather text-gray-800 w-full p-4">
      <div className="mb-2">
        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          <span className="font-merriweather text-[16px] mr-3">← Volver al menú</span>
        </button>
      </div>

      <h1 className="text-[32px] font-bold text-gray-900 font-merriweather">
        Asignar Jefe de Departamento
      </h1>

      {mensajeExito && (
        <div className="bg-[#38761d] text-white px-4 py-3 rounded-md flex items-center space-x-2 shadow-md max-w-xl">
          <span>✓</span>
          <span className="text-sm font-medium">{mensajeExito}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-300 shadow-sm max-w-5xl mx-auto overflow-hidden">
        
        <div className="flex border-b border-gray-300 bg-gray-50">
          <button
            onClick={() => { setActiveTab("asignar"); setBusqueda(""); }}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-r border-gray-300 ${
              activeTab === "asignar"
                ? "bg-[#e2d5d8] text-gray-900 border-b-2 border-b-[#5c1d33]"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Asignar Jefe
          </button>
          <button
            onClick={() => { setActiveTab("revocar"); setBusqueda(""); }}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === "revocar"
                ? "bg-[#e2d5d8] text-gray-900 border-b-2 border-b-[#5c1d33]"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Revocar Jefe
          </button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleBuscar} className="max-w-md">
            <div className="flex items-center border border-gray-300 rounded-md bg-white px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-[#5c1d33]">
              <Input type="text" placeholder="Buscar Correo o nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border-none p-0 focus:ring-0 text-sm w-full outline-none" />
              <button type="submit" className="text-gray-600 hover:text-gray-900 ml-2 focus:outline-none shrink-0" aria-label="Buscar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/>
                </svg>
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-gray-900 text-sm font-bold">
                  <th className="py-3 px-4">No. Empleado</th>
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4">Correo Institucional</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">Cargando registros...</td>
                  </tr>
                ) : listaActual.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">No se encontraron registros.</td>
                  </tr>
                ) : (
                  listaActual.map((item) => (
                    <tr key={item.idUsuario} className="border-b border-gray-200 hover:bg-gray-50 text-sm">
                      <td className="py-3 px-4">{item.boleta}</td>
                      <td className="py-3 px-4">{item.nombre}</td>
                      <td className="py-3 px-4">{item.correoInstitucional}</td>
                      <td className="py-3 px-4 text-right">
                        {activeTab === "asignar" ? (
                          <Button
                            text="Asignar Jefe"
                            type="button"
                            variant="primary"
                            onClick={() => abrirModal(item, "asignar")}
                            className="text-xs px-4 py-1.5 rounded-md shadow"
                          />
                        ) : (
                          <Button
                            text="Revocar"
                            type="button"
                            variant="primary"
                            onClick={() => abrirModal(item, "revocar")}
                            className="text-xs px-4 py-1.5 rounded-md shadow"
                          />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalAbierto && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6 animate-fadeIn font-merriweather">
            <h2 className="text-xl font-bold text-gray-900">
              {accionTipo === "asignar" ? "Asignar Jefe de Departamento" : "Revocar Jefe de Departamento"}
            </h2>
            <p className="text-sm text-gray-700">
              {accionTipo === "asignar"
                ? `¿Deseas asignar los permisos de Jefe de Departamento a ${usuarioSeleccionado.nombre}?`
                : `¿Deseas revocar la Jefatura a ${usuarioSeleccionado.nombre}?`}
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <Button text="Cancelar" type="button" variant="outline" onClick={() => setModalAbierto(false)} className="px-4 py-2 text-xs rounded-md"/>
              <Button text={accionTipo === "asignar" ? "Asignar" : "Confirmar"} type="button" variant="primary" onClick={ejecutarAccion} className="px-4 py-2 text-xs rounded-md"/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JefeDepartamento;