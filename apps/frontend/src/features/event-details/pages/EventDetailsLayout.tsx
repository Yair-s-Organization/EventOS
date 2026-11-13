import { useEffect, useState } from "react";
import { DashboardLayout } from "../../../components/templates/DashboardLayout";
import { MainLayout } from "../../../components/templates/MainLayout";
import { ApiError, apiRequest } from "../../../lib/apiClient";
import type { PerfilAutenticado } from "../../../app/ProtectedRoutes";

type EstadoLayout =
  | { tipo: "verificando" }
  | { tipo: "publico" }
  | {
  tipo: "autenticado";
  perfil: PerfilAutenticado;
  token: string;
};

const rolesPermitidos = new Set([
  "Administrador",
  "Subdirección",
  "Asistente",
  "Usuario Externo",
  "Usuario Interno",
]);

function esPerfilValido(valor: unknown): valor is PerfilAutenticado {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) {
    return false;
  }

  const perfil = valor as Record<string, unknown>;

  return (
    typeof perfil.idUsuario === "number" &&
    Number.isInteger(perfil.idUsuario) &&
    perfil.idUsuario > 0 &&
    typeof perfil.tipoCuenta === "string" &&
    rolesPermitidos.has(perfil.tipoCuenta)
  );
}

export function EventDetailsLayout() {
  const token = localStorage.getItem("token");

  const [estado, setEstado] = useState<EstadoLayout>(() =>
    token ? { tipo: "verificando" } : { tipo: "publico" },
  );

  useEffect(() => {
    if (!token) {
      setEstado({ tipo: "publico" });
      return;
    }

    const controller = new AbortController();

    setEstado({ tipo: "verificando" });

    const validarSesion = async () => {
      try {
        const respuesta = await apiRequest<unknown>("usuarios/perfil", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!esPerfilValido(respuesta)) {
          throw new Error("El servidor devolvió un perfil inválido.");
        }

        if (controller.signal.aborted) return;

        if (localStorage.getItem("token") !== token) {
          setEstado({ tipo: "publico" });
          return;
        }

        setEstado({
          tipo: "autenticado",
          perfil: respuesta,
          token,
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          if (localStorage.getItem("token") === token) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
          }
        }

        setEstado({ tipo: "publico" });
      }
    };

    void validarSesion();

    return () => controller.abort();
  }, [token]);

  if (
    estado.tipo === "verificando" ||
    (estado.tipo === "autenticado" && estado.token !== token)
  ) {
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center p-6 text-center text-eventos-body-text"
      >
        Verificando sesión...
      </div>
    );
  }

  if (estado.tipo === "autenticado") {
    return <DashboardLayout perfilValidado={estado.perfil} />;
  }

  return <MainLayout />;
}