import { useId, useRef, useState } from "react";
import { Link, NavLink } from "react-router";
import { Bell, CircleUserRound, Menu, X } from "lucide-react";

interface NavbarProps {
  userRole: "asistente" | "subdireccion" | "admin";
}

const linksByRole = {
  asistente: [
    { label: "Menú Principal", to: "/menu-asistente" },
    { label: "Cartelera de eventos", to: "/asistente/cartelera" },
    { label: "Mis Boletos", to: "/asistente/boletos" },
    { label: "Mis eventos", to: "/organizador/mis-eventos" },
    { label: "Control de Acceso", to: "/panel-eventos-asignados" },
  ],
  admin: [
    { label: "Menú", to: "/menu-admin" },
    { label: "Bitácora", to: "/admin/bitacora" },
    { label: "Gestión de Jefes de departamento", to: "/admin/jefe-departamento" },
    { label: "Gestión de espacios", to: "/gestion-espacios" },
    { label: "Gestión de usuarios", to: "/admin/gestion-usuarios" },
  ],
  subdireccion: [
    { label: "Menú", to: "/subdireccion/menu-principal" },
    { label: "Mis eventos", to: "/organizador/mis-eventos" },
    { label: "Solicitudes Aprobadas", to: "/subdireccion/solicitudes-aprobadas" },
    { label: "Solicitudes Pendientes", to: "/subdireccion/lista-solicitudes" },
    { label: "Verificación de cuentas", to: "/subdireccion/verificaciones" },
    { label: "Solicitar evento", to: "/solicitud-evento" },
  ],
} satisfies Record<NavbarProps["userRole"], { label: string; to: string }[]>;

const keyboardFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-navbar-focus";

export function Navbar({ userRole }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navLinks = linksByRole[userRole];

  return (
    <nav
      aria-label="Navegación principal"
      className="w-full border-b border-eventos-navbar-divider bg-eventos-primary px-4 py-3 font-merriweather text-eventos-on-primary shadow-md sm:px-6 xl:px-8 xl:py-4"
      onKeyDown={(event) => {
        if (mobileMenuOpen && event.key === "Escape") {
          setMobileMenuOpen(false);
          menuButtonRef.current?.focus();
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="shrink-0 text-eventos-brand font-bold tracking-wide text-eventos-on-primary">
          Event-Os
        </span>

        <div className="hidden items-center gap-3 xl:flex 2xl:gap-6">
          <div className="flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={`${link.to}-${link.label}`}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-md px-2 py-2 text-sm text-eventos-navbar-link transition-colors hover:text-eventos-on-primary hover:underline ${keyboardFocus} ${isActive ? "font-semibold underline underline-offset-4" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2 border-l border-eventos-navbar-divider pl-3 xl:gap-4">
            <Link
              to="/perfil"
              aria-label="Perfil de usuario"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-md text-eventos-navbar-link transition-colors hover:text-eventos-on-primary ${keyboardFocus}`}
            >
              <CircleUserRound size={27} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileMenuOpen}
          aria-controls={mobileMenuId}
          onClick={() => setMobileMenuOpen((open) => !open)}
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-eventos-on-primary transition-colors hover:bg-eventos-action-hover xl:hidden ${keyboardFocus}`}
        >
          {mobileMenuOpen ? (
            <X size={25} aria-hidden="true" />
          ) : (
            <Menu size={25} aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id={mobileMenuId}
        className={`${mobileMenuOpen ? "block" : "hidden"} mt-3 border-t border-eventos-navbar-divider pt-3 xl:hidden`}
      >
        <div className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={`${link.to}-${link.label}`}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-md px-3 py-3 text-sm text-eventos-navbar-link transition-colors hover:bg-eventos-action-hover hover:text-eventos-on-primary ${keyboardFocus} ${isActive ? "bg-eventos-action-hover font-semibold" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/perfil"
            onClick={() => setMobileMenuOpen(false)}
            className={`mt-2 flex items-center gap-2 rounded-md border-t border-eventos-navbar-divider px-3 py-3 text-sm text-eventos-navbar-link transition-colors hover:bg-eventos-action-hover hover:text-eventos-on-primary ${keyboardFocus}`}
          >
            <CircleUserRound size={21} aria-hidden="true" />
            Perfil de usuario
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
