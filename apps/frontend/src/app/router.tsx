import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router";

import { MainLayout } from "../components/templates/MainLayout";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route
            index
            element={<h1>Bienvenido a EventOS</h1>}
          />

          <Route
            path="*"
            element={<h1>Página no encontrada</h1>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}