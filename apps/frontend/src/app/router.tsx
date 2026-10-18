import { BrowserRouter, Route, Routes } from "react-router";

import { MainLayout } from "../components/templates/MainLayout";
import { SolicitudEventos } from "../features/events/SolicitudEventos";
import { LoginForm } from "../features/auth/LoginForm";
import { Registro } from "../features/auth/Registro";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<h1>Bienvenido a EventOS</h1>} />
          <Route path="/solicitud-evento" element={<SolicitudEventos />} />
          <Route path="login" element={<LoginForm/>} />
          <Route path="registro" element={<Registro/>}/>
          <Route path="*" element={<h1>Página no encontrada</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
