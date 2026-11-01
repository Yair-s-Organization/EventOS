import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/atoms/Button/Button";

interface PerfilData {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  tipoCuenta: string;
  cuenta: string;
  tipoUsuario: string;
  fechaUltimaVerificacion: string | null;
  verificacionVigente: boolean;
}

export function Perfil() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    return usuario.token || localStorage.getItem("token") || "";
  };

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/usuarios/perfil", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error("No se pudo obtener la información del perfil.");
        }

        const data = await response.json();
        setPerfil(data);
      } catch (err: any) {
        setError(err.message || "Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  if (loading) {
    return <div className="p-8 text-center font-merriweather text-gray-600">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="p-8 text-center font-merriweather text-eventos-error">{error}</div>;
  }

  const esVerificado = perfil?.cuenta === "Verificado" || perfil?.verificacionVigente === true;

  const obtenerRolYDinamicas = () => {
    const tipoCuenta = (perfil?.tipoCuenta || "").toLowerCase().trim();
    const tipoUsuarioBD = perfil?.tipoUsuario || "Externo";

    if (tipoCuenta.includes("admin") || tipoCuenta.includes("administrador")) {
      return { rol: "Administrador", tipo: "Administrador" };
    }
    if (tipoCuenta.includes("subdir") || tipoCuenta.includes("subdirección")) {
      return { rol: "Subdirección", tipo: "Subdirección" };
    }

    if (esVerificado) {
      return { 
        rol: "Asistente", 
        tipo: tipoUsuarioBD 
      };
    }

    if (tipoCuenta.includes("interno") || tipoCuenta.includes("usuario interno")) {
      return { rol: "Asistente", tipo: "Interno" };
    }

    return { rol: "Asistente", tipo: "Externo" };
  };

  const datosDinamicos = obtenerRolYDinamicas();

  return (
    <div className="space-y-6 font-merriweather text-gray-800">
      {!esVerificado && (
        <div className="bg-[#fff7d6] border-y border-[#fce5a8] px-7 py-3.5 flex items-center justify-between shadow-sm -mx-7 -mt-8 mb-8">
          <p className="text-sm font-medium text-gray-900">
            Verifica tu cuenta para realizar una solicitud
          </p>
          <Button 
            text="Verificar Cuenta" 
            type="button" 
            onClick={() => navigate("/verificacion")} 
            className="text-xs px-4 py-2 rounded-md transition-colors shadow"
          />
        </div>
      )}

      <div className="mb-2">
        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
          <span className="font-merriweather text-[16px] mr-3">← Volver al menú</span>
        </button>
      </div>

      <h1 className="text-[32px] font-bold text-gray-900 mb-6 font-merriweather">
        Perfil
      </h1>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 relative max-w-4xl font-merriweather">
        
        <div className="absolute top-6 right-6">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
            esVerificado 
              ? "bg-green-50 text-green-700 border-green-200" 
              : "bg-[#fff7d6] text-amber-800 border-[#fce5a8]"
          }`}>
            {esVerificado ? "Verificado" : "Sin verificar"}
          </span>
        </div>

        <div className="flex items-start space-x-6">
          <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-300 flex items-center justify-center text-gray-600 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <div className="font-merriweather space-y-2 grow">
            <h2 className="font-merriweather text-xl text-gray-900">
              {perfil?.nombreCompleto || "Nombre del Usuario"}
            </h2>
            <p className="text-sm text-gray-800 font-medium">
              Rol: <span className="font-merriweather font-normal">{datosDinamicos.rol}</span>
            </p>
            <p className="text-sm text-gray-800 font-medium">
              Tipo de usuario: <span className="font-merriweather font-normal">{datosDinamicos.tipo}</span>
            </p>

            <div className="pt-4">
              <Button text="Cerrar sesión" type="button" onClick={handleCerrarSesion} className="px-5 py-2 rounded-md text-sm transition-colors shadow-sm"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Perfil;