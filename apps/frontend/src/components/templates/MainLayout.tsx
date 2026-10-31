import { Outlet, Link } from "react-router";

export function MainLayout() {
  return (
    <>
      <header className="bg-primary px-6 py-5 flex items-center justify-between shadow-sm">
        <span className="font-merriweather font-bold text-[24px] text-white">Event-OS</span>
        
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-merriweather font-semibold text-white hover:text-gray-200 transition-colors">
            Iniciar Sesión
          </Link>
          
          <Link to="/registro" className="px-4 py-2 text-sm font-merriweather font-semibold bg-white text-primary rounded-md hover:bg-gray-100 transition-colors shadow-sm">
            Registrarse
          </Link>
        </div>
      </header>

      <main className="px-7 py-8">
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;