import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { API_BASE_URL } from "../../../lib/apiClient";

export interface PerfilData {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  tipoCuenta: string;
  cuenta: string;
  tipoUsuario: string;
  fechaUltimaVerificacion: string | null;
  verificacionVigente: boolean;
  solicitudPendiente?: boolean;
  estadoSolicitud?: "Sin solicitud" | "Pendiente" | "Verificado";
}

export function usePerfil() {
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
        const response = await fetch(`${API_BASE_URL}/usuarios/perfil`, {
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

  const esVerificado = perfil?.cuenta === "Verificado" || perfil?.verificacionVigente === true;
  const solicitudPendiente = perfil?.solicitudPendiente === true || perfil?.estadoSolicitud === "Pendiente";

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
  const esPersonalDirectivoOAdmin = datosDinamicos.rol === "Administrador" || datosDinamicos.rol === "Subdirección";

  const handleVolverAlMenu = () => {
    const rolActual = datosDinamicos.rol.toLowerCase();

    if (rolActual.includes("administrador")) {
      navigate("/menu-admin");
    } else if (rolActual.includes("subdirección") || rolActual.includes("subdir")) {
      navigate("/subdireccion/menu-principal");
    } else {
      navigate("/menu-asistente");
    }
  };

  const handleIrAVerificacion = () => {
    navigate("/verificacion");
  };

  return {
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
  };
}