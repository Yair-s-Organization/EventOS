import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { MainLayout } from "../components/templates/MainLayout";
import { LoginForm } from "../features/auth/LoginForm";
import { Registro } from "../features/auth/Registro";
import { DashboardLayout } from "../components/templates/DashboardLayout";
import { ProtectedRoute } from "../app/ProtectedRoutes";

import { SolicitudEvento } from "../features/events/SolicitudEventos";
import { DetallesSolicitud } from "../features/educational-services/DetallesSolicitud";
import { ListadoSolicitudes } from "../features/educational-services/ListadoSolicitudes";
import { MenuAsistente } from "../features/assistant/menu-asistente";
import { GestionEspacios } from "../features/admin/Gestion-Espacios";
import { GestionEquipos } from "../features/admin/Gestion-Equipos";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/login" index element={<LoginForm />} />
          <Route path="/registro" element={<Registro />} />
          {/*Colocar aqui rutas para probar sin tener que hacer login(no apareceran con el navbar correspondiente 
             pero solo es para probar visualización)*/}
          <Route path="/solicitud-evento" element={<SolicitudEvento/>}/>
          <Route path="/detalles-solicitud/" element={<DetallesSolicitud/>}/>
        </Route>

        {/* Rutas para asistente*/}
        <Route element={<ProtectedRoute allowedRoles={["Asistente", "Usuario Externo", "Usuario Interno"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/menu-asistente" element={<MenuAsistente />} />
            <Route path="/solicitud-evento" element={<SolicitudEvento />} />
          </Route>
        </Route>

        {/* Rutas para Admin*/}    
        <Route element={<ProtectedRoute allowedRoles={["Administrador"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/gestion-espacios" element={<GestionEspacios />} />
            <Route path="/gestion-equipos" element={<GestionEquipos />} />
          </Route>
        </Route>

        {/* Rutas para Subdirección*/}    
        <Route element={<ProtectedRoute allowedRoles={["Subdirección"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/detalles-solicitud/:id" element={<DetallesSolicitud />} />
            <Route path="/lista-solicitudes" element={<ListadoSolicitudes />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}