import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

function normalizarRol(rol: string): string {
  return rol
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const rolUsuario = usuarioGuardado.tipoCuenta;

  if (!rolUsuario) {
    return <Navigate to="/login" replace />;
  }

  const rolNorm = normalizarRol(rolUsuario);
  const permitidosNorm = allowedRoles.map(normalizarRol);

  if (!permitidosNorm.includes(rolNorm)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
