import { Navigate, Outlet } from "react-router";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const rolUsuario = usuarioGuardado.tipoCuenta;

  if (!rolUsuario) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(rolUsuario)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}