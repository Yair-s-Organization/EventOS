import { useId, useRef, useState } from "react";
import { Link, Outlet } from "react-router";
import { Menu, X } from "lucide-react";

const keyboardFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-navbar-focus";

export function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <header className="bg-eventos-primary shadow-sm font-merriweather">
        <nav
          aria-label="Navegación pública"
          className="w-full border-b border-eventos-navbar-divider bg-eventos-primary px-4 py-3 font-merriweather text-eventos-on-primary shadow-md sm:px-6 lg:px-8"
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

            <div className="hidden sm:flex items-center gap-1 sm:gap-3">
              <Link
                to="/cartelera"
                className={`rounded-md px-3 py-2 font-merriweather text-sm font-semibold text-eventos-on-primary transition-colors hover:bg-eventos-action-hover ${keyboardFocus}`}
              >
                Inicio
              </Link>
              <Link
                to="/login"
                className={`rounded-md px-3 py-2 font-merriweather text-sm font-semibold text-eventos-on-primary transition-colors hover:bg-eventos-action-hover ${keyboardFocus}`}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/registro"
                className={`rounded-md bg-eventos-on-primary px-3 py-2 font-merriweather text-sm font-semibold text-eventos-primary shadow-sm transition-colors hover:bg-eventos-primary-light ${keyboardFocus}`}
              >
                Registrarse
              </Link>
            </div>

            <button
              ref={menuButtonRef}
              type="button"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
              aria-controls={mobileMenuId}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-eventos-on-primary transition-colors hover:bg-eventos-action-hover sm:hidden ${keyboardFocus}`}
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
            className={`${mobileMenuOpen ? "block" : "hidden"} mt-3 border-t border-eventos-navbar-divider pt-3 sm:hidden`}
          >
            <div className="flex flex-col gap-1">
              <Link
                to="/cartelera"
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-md px-3 py-3 text-sm font-semibold text-eventos-navbar-link transition-colors hover:bg-eventos-action-hover hover:text-eventos-on-primary ${keyboardFocus}`}
              >
                Inicio
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-md px-3 py-3 text-sm font-semibold text-eventos-navbar-link transition-colors hover:bg-eventos-action-hover hover:text-eventos-on-primary ${keyboardFocus}`}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/registro"
                onClick={() => setMobileMenuOpen(false)}
                className={`mt-1 rounded-md bg-eventos-on-primary px-3 py-2.5 text-center text-sm font-semibold text-eventos-primary shadow-sm transition-colors hover:bg-eventos-primary-light ${keyboardFocus}`}
              >
                Registrarse
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="px-4 py-8 sm:px-7">
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;
