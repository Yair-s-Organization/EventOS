import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import {
  ApiError,
  apiRequest,
  SESSION_REVALIDATION_EVENT,
} from "../lib/apiClient";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export interface PerfilAutenticado {
  idUsuario: number;
  tipoCuenta: string;
}

type EstadoSesion =
  | { tipo: "cargando" }
  | { tipo: "autenticado"; perfil: PerfilAutenticado; token: string }
  | { tipo: "sinSesion" }
  | { tipo: "error" };

function esPerfilAutenticado(valor: unknown): valor is PerfilAutenticado {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) {
    return false;
  }

  const perfil = valor as Record<string, unknown>;

  return (
    typeof perfil.idUsuario === "number" &&
    Number.isInteger(perfil.idUsuario) &&
    perfil.idUsuario > 0 &&
    typeof perfil.tipoCuenta === "string" &&
    perfil.tipoCuenta.trim().length > 0
  );
}

function obtenerRutaPorRol(rol: string): string {
  if (rol === "Administrador") {
    return "/menu-admin";
  }

  if (rol === "Subdirección") {
    return "/subdireccion/menu-principal";
  }

  if (
    rol === "Asistente" ||
    rol === "Usuario Externo" ||
    rol === "Usuario Interno"
  ) {
    return "/menu-asistente";
  }

  return "/login";
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const [estado, setEstado] = useState<EstadoSesion>({ tipo: "cargando" });
  const [intento, setIntento] = useState(0);
  const [revalidacion, setRevalidacion] = useState(0);

  useEffect(() => {
    const solicitarRevalidacion = () => {
      setRevalidacion((valor) => valor + 1);
    };

    window.addEventListener(SESSION_REVALIDATION_EVENT, solicitarRevalidacion);

    return () => {
      window.removeEventListener(
        SESSION_REVALIDATION_EVENT,
        solicitarRevalidacion,
      );
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    if (!token) {
      setEstado({ tipo: "sinSesion" });
      return () => controller.abort();
    }

    setEstado((actual) =>
      actual.tipo === "autenticado" && actual.token === token
        ? actual
        : { tipo: "cargando" },
    );

    const validarSesion = async () => {
      try {
        const respuesta = await apiRequest<unknown>("usuarios/perfil", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!esPerfilAutenticado(respuesta)) {
          throw new Error("El servidor devolvió un perfil inválido.");
        }

        if (controller.signal.aborted) {
          return;
        }

        if (localStorage.getItem("token") !== token) {
          setEstado({ tipo: "sinSesion" });
          return;
        }

        setEstado({
          tipo: "autenticado",
          perfil: respuesta,
          token,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          if (localStorage.getItem("token") === token) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
          }

          setEstado({ tipo: "sinSesion" });
          return;
        }

        setEstado({ tipo: "error" });
      }
    };

    void validarSesion();

    return () => controller.abort();
  }, [token, intento, revalidacion]);

  if (estado.tipo === "sinSesion") {
    return <Navigate to="/login" replace />;
  }

  if (
    estado.tipo === "cargando" ||
    (estado.tipo === "autenticado" && estado.token !== token)
  ) {
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center p-6"
      >
        Verificando sesión...
      </div>
    );
  }

  if (estado.tipo === "error") {
    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center"
      >
        <p>
          No fue posible verificar tu sesión. Revisa tu conexión e inténtalo
          nuevamente.
        </p>
        <button
          type="button"
          onClick={() => setIntento((anterior) => anterior + 1)}
          className="rounded-md bg-eventos-primary px-5 py-3 text-eventos-on-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!allowedRoles.includes(estado.perfil.tipoCuenta)) {
    return (
      <Navigate to={obtenerRutaPorRol(estado.perfil.tipoCuenta)} replace />
    );
  }

  return <Outlet context={estado.perfil} />;
}
