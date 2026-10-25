import { Outlet } from "react-router";
import { Navbar } from "../organisms/NavBar/NavBar";

export function DashboardLayout() {
  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const rolBackend = usuarioGuardado.tipoCuenta;

  let rolNavbar: "asistente" | "subdireccion" | "admin";

  if (rolBackend === "admin" || rolBackend === "Administrador") {
    rolNavbar = "admin";
  } else if (rolBackend === "subdireccion" || rolBackend === "Subdirección") {
    rolNavbar = "subdireccion";
  } else {
    rolNavbar = "asistente";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-merriweather">
      <Navbar userRole={rolNavbar} />
      <main className="flex-1 px-7 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;