import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { MainLayout } from "../components/templates/MainLayout";
import { LoginForm } from "../features/auth/LoginForm";
import { Registro } from "../features/auth/Registro";
import { DashboardLayout } from "../components/templates/DashboardLayout";

import { SolicitudEvento } from "../features/events/SolicitudEventos";
import { DetallesSolicitud } from "../features/educational-services/DetallesSolicitud";
import { ListadoSolicitudes } from "../features/educational-services/ListadoSolicitudes";
import { MenuAsistente } from "../features/assistant/menu-asistente"
import { GestionEspacios } from "../features/admin/Gestion-Espacios";
import { GestionEquipos } from "../features/admin/Gestion-Equipos";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout/>}>
          <Route path="/login" index element={<LoginForm />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/gestion-espacios" element={<GestionEspacios/>}/>
          <Route path="/gestion-equipos" element={<GestionEquipos/>}/>
          {/*Colocar aqui rutas para probar (no apareceran con el navbar correspondiente pero solo es para
          probar visualización)*/}
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/menu-asistente" element={<MenuAsistente />} />
          <Route path="/solicitud-evento" element={<SolicitudEvento />} />
          
          
          
          <Route path="/detalles-solicitud/:id" element={<DetallesSolicitud/>} />
          <Route path="/lista-solicitudes" element={<ListadoSolicitudes/>}/>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}