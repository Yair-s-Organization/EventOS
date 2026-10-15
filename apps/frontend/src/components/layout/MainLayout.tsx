
import { Link, Outlet } from 'react-router';

export function MainLayout() {
  return (
    <>
      <header>
        <h1>EventOS</h1>

        <nav aria-label="Navegación principal">
          <Link to="/eventos">Eventos</Link>
          {' | '}
          <Link to="/mis-boletos">Mis Boletos</Link>
          {' | '}
          <Link to="/iniciar-sesion">Iniciar sesión</Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}
