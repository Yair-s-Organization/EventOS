import { Outlet, useOutletContext } from "react-router";
import type { PerfilAutenticado } from "../../app/ProtectedRoutes";
import { Navbar } from "../organisms/NavBar/NavBar";

interface DashboardLayoutProps {
  perfilValidado?: PerfilAutenticado;
}

export function DashboardLayout({
                                  perfilValidado,
                                }: DashboardLayoutProps) {
  const perfilRuta = useOutletContext<PerfilAutenticado | undefined>();
  const perfil = perfilValidado ?? perfilRuta;

  if (!perfil) {
    return (
      <div
        role="alert"
        className="flex min-h-screen items-center justify-center p-6 text-center text-eventos-error"
      >
        No fue posible recuperar el perfil de navegación.
      </div>
    );
  }

  const rolBackend = perfil.tipoCuenta;

  let rolNavbar: "asistente" | "subdireccion" | "admin";

  if (rolBackend === "Administrador" || rolBackend === "admin") {
    rolNavbar = "admin";
  } else if (
    rolBackend === "Subdirección" ||
    rolBackend === "subdireccion"
  ) {
    rolNavbar = "subdireccion";
  } else {
    rolNavbar = "asistente";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-merriweather">
      <Navbar userRole={rolNavbar} />
      <main className="flex flex-1 flex-col px-7 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;