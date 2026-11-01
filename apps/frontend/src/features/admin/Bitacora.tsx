import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/atoms/Button/Button";
import { Input } from "../../components/atoms/Input/Input";
import { Modal } from "../../components/molecules/Modal";

interface BitacoraItem {
  idBitacora?: number;
  evento: string;
  estado: string;
  usuario: string;
  fecha: string;
  hora: string;
}

export function BitacoraGeneral() {
  const navigate = useNavigate();
  const [bitacora, setBitacora] = useState<BitacoraItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalExito, setModalExito] = useState(false);

  const getToken = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    return usuario.token || localStorage.getItem("token") || "";
  };

  const cargarBitacora = async (query = "") => {
    setLoading(true);
    try {
      const endpoint = `http://localhost:3000/api/bitacora${query ? `?buscar=${encodeURIComponent(query)}` : ""}`;
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBitacora(data);
      }
    } catch (err) {
      console.error("Error al cargar la bitácora", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBitacora();
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarBitacora(busqueda);
  };

  const handleExportar = () => {
    // Manejador exportación PDF
    setModalExito(true);
  };

  const bitacoraFiltrada = bitacora.filter((item) => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return true;
    return (
      item.usuario.toLowerCase().includes(termino) ||
      item.evento.toLowerCase().includes(termino) ||
      item.estado.toLowerCase().includes(termino)
    );
  });

  return (
    <div className="space-y-6 font-merriweather text-gray-800 w-full p-6">
        <div className="mb-2">
        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          <span className="font-merriweather text-[16px] mr-3">← Volver al menú</span>
        </button>
      </div>

      <h1 className="text-[32px] font-bold text-gray-900 font-merriweather">
        Bitácora general de movimientos
      </h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <form onSubmit={handleBuscar} className="w-full md:w-96">
          <div className="flex items-center border border-gray-300 rounded-md bg-white px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-[#5c1d33]">
            <Input type="text" placeholder="Buscar evento" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="border-none p-0 focus:ring-0 text-sm w-full outline-none bg-transparent"/>
            <button type="submit" className="text-gray-500 hover:text-gray-700 ml-2 focus:outline-none shrink-0" aria-label="Buscar">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/>
              </svg>
            </button>
          </div>
        </form>

        <Button text="Exportar" type="button" variant="primary" onClick={handleExportar} className="px-6 py-2.5 rounded-md text-sm shadow transition-colors"/>
      </div>

      <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-gray-900 text-sm font-bold">
              <th className="py-3 px-4">Evento</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Usuario</th>
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Hora</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">Cargando registros de bitácora...</td>
              </tr>
            ) : bitacoraFiltrada.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">No se encontraron movimientos registrados.</td>
              </tr>
            ) : (
              bitacoraFiltrada.map((item, index) => (
                <tr key={item.idBitacora || index} className="border-b border-gray-200 hover:bg-gray-50 text-sm">
                  <td className="py-3 px-4">{item.evento}</td>
                  <td className="py-3 px-4">{item.estado}</td>
                  <td className="py-3 px-4">{item.usuario}</td>
                  <td className="py-3 px-4">{item.fecha}</td>
                  <td className="py-3 px-4">{item.hora}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="text-center">          
      <Modal mostrarModal={modalExito} cerrarModal={() => setModalExito(false)} titulo="Bitácora exportada correctamente" contenido="">
        <div className="flex justify-end pt-4">
          <Button text="Aceptar" type="button" variant="primary" onClick={() => setModalExito(false)} className="px-4 py-1.5 text-xs rounded-md shadow"/>
        </div>
      </Modal>
      </div>      
    </div>
  );
}

export default BitacoraGeneral;