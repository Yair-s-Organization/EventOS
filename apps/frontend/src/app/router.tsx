
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router';

import { MainLayout } from '../components/layout/MainLayout';

import { LoginPage } from '../features/auth/pages/LoginPage';
import { EventsPage } from '../features/events/pages/EventsPage';
import { MyTicketsPage } from '../features/tickets/pages/MyTicketsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={<Navigate to="/eventos" replace />}
          />

          <Route
            path="/iniciar-sesion"
            element={<LoginPage />}
          />

          <Route
            path="/eventos"
            element={<EventsPage />}
          />

          <Route
            path="/mis-boletos"
            element={<MyTicketsPage />}
          />
        </Route>

        <Route
          path="*"
          element={<h1>Página no encontrada</h1>}
        />
      </Routes>
    </BrowserRouter>
  );
}
