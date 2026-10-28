import React from "react";
import { useNavigate } from "react-router";
import { TextLink } from "../../atoms/TextLink/TextLink";

interface NavbarProps {
  userRole: "asistente" | "subdireccion" | "admin";
}

export function Navbar({ userRole }: NavbarProps) {
  const navigate = useNavigate();

  const getNavLinks = () => {
    switch (userRole) {
      case "asistente":
        return [
          { label: "Menú Principal", to: "menu-asistente" },
          { label: "Cartelera de eventos", to: "/asistente/cartelera" },
          { label: "Solicitar evento", to: "/solicitud-evento" },
          { label: "Mis Boletos", to: "/asistente/boletos" },
        ];
      case "admin":
        return [
          { label: "Bitácora", to: "/admin/bitacora" },
          { label: "Cuentas de usuario", to: "/admin/usuarios" },
          { label: "Espacios Físicos", to: "/gestion-espacios" },
        ];
      case "subdireccion":
      default:
        return [
          { label: "Menú", to: "/subdireccion/menu-principal" },
          { label: "Mis eventos", to: "/subdireccion/menu-principal" },
          { label: "Solicitudes Aprobadas", to: "/subdireccion/menu-principal" },
          { label: "Solicitudes Pendientes", to: "/subdireccion/lista-solicitudes" },
          { label: "Solicitar evento", to: "/solicitud-evento" },
        ];
    }
  };

  return (
    <nav className="w-full bg-[#4a1c2d] border-b border-[#60253a] px-8 py-4 flex items-center justify-between font-merriweather text-white shadow-md">
      <div className="flex items-center">
        <span className="font-bold text-xl tracking-wide text-stone-100 font-merriweather">
          Event-Os
        </span>
      </div>

      <div className="hidden md:flex items-center space-x-8">
        <div className="flex items-center space-x-8">
          {getNavLinks().map((link, index) => (
            <TextLink key={index} to={link.to} 
              className="text-stone-200 hover:text-white font-merriweather text-sm font-normal transition-colors no-underline hover:underline">
              {link.label}
            </TextLink>
          ))}
        </div>

        <div className="flex items-center space-x-6 pl-4 border-l border-[#60253a]">
          {userRole === "asistente" && (
            <button type="button" className="text-stone-200 hover:text-white focus:outline-none transition-colors" aria-label="Notificaciones">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
          )}

          <button type="button" onClick={() => navigate("/perfil")} className="text-stone-200 hover:text-white focus:outline-none transition-colors" aria-label="Perfil de usuario">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
