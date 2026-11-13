import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/atoms/Button/Button";
import { SearchBar } from "../../components/molecules/SearchBar";
import { Table, type Columna } from "../../components/organisms/Table/Table";
import { API_BASE_URL } from "../../lib/apiClient";
import type { SolicitudVerificacionItem } from "@eventos/shared";
import { UserCheck, Clock } from "lucide-react";

export function ListaVerificaciones() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<SolicitudVerificacionItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    return usuario.token || localStorage.getItem("token") || "";
  };

  const cargarSolicitudes = useCallback(async (termino?: string) => {
    setCargando(true);
    setError(null);
    try {
      const url = new URL(`${API_BASE_URL}/usuarios/verificaciones/pendientes`);
      if (termino && termino.trim() !== "") {
        url.searchParams.set("buscar", termino.trim());
      }

      const res = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) {
        throw new Error("No se pudieron cargar las solicitudes de verificación.");
      }

      const data = await res.json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarSolicitudes(busqueda);
  }, [cargarSolicitudes]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    cargarSolicitudes(busqueda);
  };

  const solicitudesFiltradas = solicitudes.filter((item) => {
    if (!busqueda.trim()) return true;
    const term = busqueda.toLowerCase().trim();
    return (
      item.nombre.toLowerCase().includes(term) ||
      item.perfilSolicita.toLowerCase().includes(term) ||
      item.correo.toLowerCase().includes(term) ||
      (item.numeroBoleta && item.numeroBoleta.toLowerCase().includes(term))
    );
  });

  const columnas: Columna<SolicitudVerificacionItem>[] = [
    {
      id: "nombre",
      encabezado: "Nombre del solicitante",
      render: (item) => (
        <span className="font-merriweather font-medium text-gray-900 text-base">
          {item.nombre}
        </span>
      ),
      className: "px-6 py-4 text-center font-merriweather text-base font-medium text-gray-900",
    },
    {
      id: "rol",
      encabezado: "Rol",
      render: (item) => (
        <span className="font-merriweather text-gray-800 text-base">
          {item.perfilSolicita}
        </span>
      ),
      className: "px-6 py-4 text-center font-merriweather text-base font-medium text-gray-900",
    },
    {
      id: "solicitud",
      encabezado: "Solicitud",
      render: (item) => (
        <Button
          text="Ver solicitud"
          type="button"
          onClick={() => navigate(`/subdireccion/verificaciones/${item.idVerificacion}`)}
          className="bg-[#5F1B36] hover:bg-eventos-action-hover text-white px-5 py-2 rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
        />
      ),
      className: "px-6 py-4 text-center font-merriweather text-base font-medium text-gray-900",
    },
  ];

  return (
    <section className="space-y-6 font-merriweather">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-merriweather font-bold text-2xl md:text-[32px] text-gray-900">
          Solicitudes de verificación de cuentas
        </h1>

        <div className="w-full md:w-80">
          <SearchBar
            value={busqueda}
            texto="Buscar Rol o Solicitante..."
            onChangeEvent={(e) => {
              setBusqueda(e.target.value);
            }}
            handle={handleSearchSubmit}
          />
        </div>
      </div>

      {cargando && (
        <div className="flex min-h-87.5 items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600 font-merriweather">
            <Clock className="w-6 h-6 animate-spin text-[#5F1B36]" />
            <span>Cargando solicitudes de verificación...</span>
          </div>
        </div>
      )}

      {error && !cargando && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg font-merriweather">
          {error}
        </div>
      )}

      {!cargando && !error && solicitudesFiltradas.length === 0 && (
        <div className="flex min-h-87.5 flex-col items-center justify-center text-center space-y-3 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <UserCheck className="w-16 h-16 text-gray-400" />
          <p className="font-merriweather text-xl font-semibold text-gray-800">
            {busqueda.trim()
              ? "No se encontraron solicitudes que coincidan con la búsqueda."
              : "No hay solicitudes de verificación de cuentas pendientes."}
          </p>
          <p className="text-sm text-gray-500 max-w-md">
            {busqueda.trim()
              ? "Intenta buscando por otro nombre o rol de solicitante."
              : "Las nuevas solicitudes de alumnos, docentes, empresas o externos aparecerán aquí para su validación."}
          </p>
        </div>
      )}

      {!cargando && !error && solicitudesFiltradas.length > 0 && (
        <div className="mx-auto w-full overflow-x-auto shadow-sm rounded-lg border border-gray-200 bg-white">
          <Table
            columnas={columnas}
            filas={solicitudesFiltradas}
            obtenerClave={(item) => item.idVerificacion}
            className="table-auto min-w-full text-center [&_tbody_tr]:h-20 [&_thead_tr]:h-17.5 [&_thead_tr]:border-b [&_thead_tr]:border-gray-300 [&_tbody_tr]:border-b [&_tbody_tr]:border-gray-200"
          />
        </div>
      )}
    </section>
  );
}

export default ListaVerificaciones;
