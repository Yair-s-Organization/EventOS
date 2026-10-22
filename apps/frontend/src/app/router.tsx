import { BrowserRouter, Route, Routes } from "react-router";

import { MainLayout } from "../components/templates/MainLayout";
import { SolicitudEvento } from "../features/events/SolicitudEventos";
import { LoginForm } from "../features/auth/LoginForm";
import { Registro } from "../features/auth/Registro";
import { DetallesEvento } from "../features/educational-services/DetallesEvento";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<h1>Bienvenido a EventOS</h1>} />
          <Route path="/solicitud-evento" element={<SolicitudEvento />} />
          <Route path="login" element={<LoginForm/>} />
          <Route path="registro" element={<Registro/>}/>
          <Route path="*" element={<h1>Página no encontrada</h1>} />
          <Route path="/detalles-evento" element={<DetallesEvento/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
