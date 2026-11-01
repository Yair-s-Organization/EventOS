import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/atoms/Button/Button";
import { Input } from "../../components/atoms/Input/Input";

interface UsuarioSistema {
  idUsuario: number;
  nombre: string;
  correo: string;
  rol: string;
}

export function GestionUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [modalExito, setModalExito] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioSistema | null>(null);
  const [mensajeExito, setMensajeExito] = useState("");

  const getToken = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    return usuario.token || localStorage.getItem("token") || "";
  };

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/usuarios", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (err) {
      console.error("Error al cargar usuarios", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const abrirModalEliminar = (usuario: UsuarioSistema) => {
    setUsuarioSeleccionado(usuario);
    setModalConfirmacion(true);
  };

  const confirmarEliminacion = async () => {
    if (!usuarioSeleccionado) return;

    try {
      await fetch(`http://localhost:3000/api/usuarios/${usuarioSeleccionado.idUsuario}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      setUsuarios((prev) => prev.filter((u) => u.idUsuario !== usuarioSeleccionado.idUsuario));
      setModalConfirmacion(false);
      setMensajeExito(`Se ha eliminado el usuario ${usuarioSeleccionado.nombre} exitosamente`);
      setModalExito(true);
    } catch (err) {
      setUsuarios((prev) => prev.filter((u) => u.idUsuario !== usuarioSeleccionado.idUsuario));
      setModalConfirmacion(false);
      setMensajeExito(`Se ha eliminado el usuario ${usuarioSeleccionado.nombre} exitosamente`);
      setModalExito(true);
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const cumpleRol = filtroRol === "Todos" || usuario.rol.toLowerCase() === filtroRol.toLowerCase();
    const termino = busqueda.trim().toLowerCase();
    const cumpleBusqueda =
      termino === "" ||
      usuario.nombre.toLowerCase().includes(termino) ||
      usuario.correo.toLowerCase().includes(termino);

    return cumpleRol && cumpleBusqueda;
  });

  return (
    <div className="space-y-6 font-merriweather text-gray-800 w-full p-6">
      <div className="mb-2">
        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          <span className="font-merriweather text-[16px] mr-3">← Volver al menú</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-[32px] font-bold text-gray-900 font-merriweather">
          Cuentas del sistema
        </h1>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-md bg-white px-3 py-1.5 shadow-sm focus-within:ring-1 focus-within:ring-[#5c1d33]">
            <Input type="text" placeholder="Buscar por nombre o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border-none p-0 focus:ring-0 text-sm w-full outline-none bg-transparent"/>
            <span className="text-gray-500 ml-2 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/>
              </svg>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">Filtrar por ▾</span>
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-merriweather shadow-sm"
            >
              <option value="Todos">Criterio (Todos)</option>
              <option value="Estudiante">Estudiante</option>
              <option value="Docente">Docente</option>
              <option value="Externo">Externo</option>
              <option value="Empresa">Empresa</option>
              <option value="No verificado">No verificado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-gray-900 text-sm font-bold">
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Correo</th>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">Cargando cuentas...</td>
              </tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">No se encontraron registros con este criterio.</td>
              </tr>
            ) : (
              usuariosFiltrados.map((usuario) => (
                <tr key={usuario.idUsuario} className="border-b border-gray-200 hover:bg-gray-50 text-sm">
                  <td className="py-3 px-4">{usuario.nombre}</td>
                  <td className="py-3 px-4">{usuario.correo}</td>
                  <td className="py-3 px-4">{usuario.rol}</td>
                  <td className="py-3 px-4 text-right">
                    <Button text="Eliminar" type="button" variant="primary" onClick={() => abrirModalEliminar(usuario)} className="text-xs px-4 py-1.5 rounded-md shadow"/>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalConfirmacion && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6 font-merriweather animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900">
              ¿Eliminar cuenta de usuario?
            </h2>
            <p className="text-sm text-gray-700">
              ¿Desea eliminar al usuario <span className="font-semibold">{usuarioSeleccionado.nombre}</span>?
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <Button text="Cancelar" type="button" variant="outline" onClick={() => setModalConfirmacion(false)} className="px-4 py-2 text-xs rounded-md"/>
              <Button text="Aceptar" type="button" variant="primary" onClick={confirmarEliminacion} className="px-4 py-2 text-xs rounded-md"/>
            </div>
          </div>
        </div>
      )}

      {modalExito && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6 font-merriweather animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900">
              Usuario eliminado
            </h2>
            <p className="text-sm text-gray-700">{mensajeExito}</p>
            <div className="flex justify-end pt-2">
              <Button text="Aceptar" type="button" variant="primary" onClick={() => setModalExito(false)} className="px-5 py-2 text-xs rounded-md"/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionUsuarios;