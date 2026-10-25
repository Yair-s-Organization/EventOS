import { BrowserRouter, Route, Routes } from "react-router";

import { MainLayout } from "../components/templates/MainLayout";
import { SolicitudEvento } from "../features/events/SolicitudEventos";
import { LoginForm } from "../features/auth/LoginForm";
import { Registro } from "../features/auth/Registro";
import { DetallesSolicitud } from "../features/educational-services/DetallesSolicitud";
import { ListadoSolicitudes} from "../features/educational-services/ListadoSolicitudes"

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
          <Route path="/detalles-solicitud/:id" element={<DetallesSolicitud/>} />
          <Route path="/lista-solicitudes" element={<ListadoSolicitudes/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
