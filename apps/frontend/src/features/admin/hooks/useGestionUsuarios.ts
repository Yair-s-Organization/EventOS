import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { API_BASE_URL } from "../../../lib/apiClient";

export interface UsuarioSistema {
  idUsuario: number;
  nombre: string;
  correo: string;
  rol: string;
  estatus: boolean;
  estado?: "Activo" | "Inactivo";
}

export function useGestionUsuarios() {
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

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (busqueda.trim()) {
        params.append("buscar", busqueda.trim());
      }

      // Si el filtro seleccionado es Activo o Inactivo, lo mandamos como 'estado'
      if (filtroRol === "Activo" || filtroRol === "Inactivo") {
        params.append("estado", filtroRol);
      } 
      // Si es un rol específico diferente de Todos, lo mandamos como 'rol'
      else if (filtroRol !== "Todos") {
        params.append("rol", filtroRol);
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/usuarios/admin/cuentas${queryString}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error("Error al cargar usuarios:", errData.message || response.statusText);
      }
    } catch (err) {
      console.error("Error de conexión al cargar usuarios", err);
    } finally {
      setLoading(false);
    }
  }, [busqueda, filtroRol]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      cargarUsuarios();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [busqueda, filtroRol, cargarUsuarios]);

  const abrirModalCambioEstatus = (usuario: UsuarioSistema) => {
    setUsuarioSeleccionado(usuario);
    setModalConfirmacion(true);
  };

  const cerrarModalConfirmacion = () => {
    setModalConfirmacion(false);
  };

  const cerrarModalExito = () => {
    setModalExito(false);
  };

  const confirmarCambioEstatus = async () => {
    if (!usuarioSeleccionado) return;

    try {
      const nuevoEstatus = !usuarioSeleccionado.estatus;
      const response = await fetch(`${API_BASE_URL}/usuarios/admin/cuentas/${usuarioSeleccionado.idUsuario}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ estatus: nuevoEstatus }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "No se pudo actualizar el estado de la cuenta.");
      }

      setUsuarios((prev) =>
        prev.map((u) =>
          u.idUsuario === usuarioSeleccionado.idUsuario
            ? {
                ...u,
                estatus: nuevoEstatus,
                estado: nuevoEstatus ? "Activo" : "Inactivo",
              }
            : u
        )
      );
      setModalConfirmacion(false);
      setMensajeExito(
        data.mensaje ||
          (nuevoEstatus
            ? `Se ha habilitado la cuenta de ${usuarioSeleccionado.nombre} exitosamente.`
            : `Se ha inhabilitado la cuenta de ${usuarioSeleccionado.nombre} exitosamente.`)
      );
      setModalExito(true);
    } catch (err: any) {
      setModalConfirmacion(false);
      alert(err.message || "Ocurrió un error al actualizar el estado de la cuenta.");
    }
  };

  const handleVolverAlMenu = () => {
    navigate("/menu-admin");
  };

  return {
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
  };
}