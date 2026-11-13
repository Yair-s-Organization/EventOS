import { Button } from "../../components/atoms/Button/Button";
import { Input } from "../../components/atoms/Input/Input";
import { useGestionUsuarios } from "../admin/hooks/useGestionUsuarios";
import { Search } from "lucide-react";

export function GestionUsuarios() {
  const {
    usuarios,
    filtroRol,
    setFiltroRol,
    busqueda,
    setBusqueda,
    loading,
    modalConfirmacion,
    modalExito,
    usuarioSeleccionado,
    mensajeExito,
    abrirModalCambioEstatus,
    cerrarModalConfirmacion,
    cerrarModalExito,
    confirmarCambioEstatus,
    handleVolverAlMenu,
  } = useGestionUsuarios();

  return (
    <div className="space-y-6 font-merriweather text-gray-800 w-full p-0">
      <div className="mb-2">
        <button onClick={handleVolverAlMenu} className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          <span className="font-merriweather text-[16px] mr-3">← Volver al menú</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-[28px] font-bold text-gray-900 font-merriweather">
          Cuentas del sistema
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-md bg-white px-2 py-1.5 shadow-sm w-full sm:w-80">
            <Input type="text" placeholder="Buscar por nombre o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border-none p-0 focus:ring-0 outline-none bg-transparent"/>
            <span className="text-gray-500">
              <Search className="w-5 h-5" />
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">Filtrar por</span>
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-merriweather shadow-sm"
            >
              <option value="Todos">Todos</option>
              <option value="Estudiante">Estudiante</option>
              <option value="Docente">Docente</option>
              <option value="Externo">Externo</option>
              <option value="Empresa">Empresa</option>
              <option value="No verificado">No verificado</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
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
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">Cargando cuentas...</td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">No se encontraron registros con este criterio.</td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.idUsuario} className="border-b border-gray-200 hover:bg-gray-50 text-sm">
                  <td className="py-3 px-4">{usuario.nombre}</td>
                  <td className="py-3 px-4">{usuario.correo}</td>
                  <td className="py-3 px-4">{usuario.rol}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        usuario.estatus
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {usuario.estatus ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      text={usuario.estatus ? "Inhabilitar" : "Habilitar"}
                      type="button"
                      variant={usuario.estatus ? "outline" : "primary"}
                      onClick={() => abrirModalCambioEstatus(usuario)}
                      className="text-xs px-4 py-1.5 rounded-md shadow-sm"
                    />
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
              {usuarioSeleccionado.estatus
                ? "¿Inhabilitar cuenta de usuario?"
                : "¿Habilitar cuenta de usuario?"}
            </h2>
            <p className="text-sm text-gray-700">
              ¿Desea {usuarioSeleccionado.estatus ? "inhabilitar" : "habilitar"} al usuario{" "}
              <span className="font-semibold">{usuarioSeleccionado.nombre}</span>?
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                text="Cancelar"
                type="button"
                variant="outline"
                onClick={cerrarModalConfirmacion}
                className="px-4 py-2 text-xs rounded-md"
              />
              <Button
                text="Aceptar"
                type="button"
                variant="primary"
                onClick={confirmarCambioEstatus}
                className="px-4 py-2 text-xs rounded-md"
              />
            </div>
          </div>
        </div>
      )}

      {modalExito && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6 font-merriweather animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900">
              Estado de cuenta actualizado
            </h2>
            <p className="text-sm text-gray-700">{mensajeExito}</p>
            <div className="flex justify-end pt-2">
              <Button
                text="Aceptar"
                type="button"
                variant="primary"
                onClick={cerrarModalExito}
                className="px-5 py-2 text-xs rounded-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionUsuarios;