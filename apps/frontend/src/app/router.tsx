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
import { MenuSubdireccion } from "../features/educational-services/MenuSubdireccion";
import { Perfil } from "../features/account/miPerfil";
import { Verificacion } from "../features/account/verificacion";
import { JefeDepartamento } from "../features/admin/JefeDepartamento";
import { GestionUsuarios } from "../features/admin/Gestion-Usuarios";
import { BitacoraGeneral } from "../features/admin/Bitacora";

import { ReservationDemoPage } from "../features/reservations/pages/ReservationDemoPage";
import { MyTicketsDemoPage } from "../features/tickets/pages/MyTicketsDemoPage";
import { DigitalTicketDemoPage } from "../features/tickets/pages/DigitalTicketsDemo";
import { ReservationAvailabilityPreviewPage } from "../features/reservations/pages/ReservationAvailabilityPreviewPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/login" index element={<LoginForm />} />
          <Route path="/registro" element={<Registro />} />
          {/*Colocar aqui rutas para probar sin tener que hacer login(no apareceran con el navbar correspondiente 
             pero solo es para probar visualización)*/}
          <Route path="/demo-reservacion" element={<ReservationDemoPage />} />
          <Route path="/demo-boletos" element={<MyTicketsDemoPage />} />
          <Route path="/detalles-solicitud/" element={<DetallesSolicitud />} />

        </Route>

        <Route path="/demo-boleto" element={<DigitalTicketDemoPage />} />

        <Route
          path="/demo-disponibilidad/:idSubEvento"
          element={<ReservationAvailabilityPreviewPage />}
        />

        {/*Pantalla Perfil compartida*/}
        <Route element={<ProtectedRoute allowedRoles={["Administrador","Subdirección","Asistente", "Usuario Externo", "Usuario Interno"]}/>}>
          <Route element={<DashboardLayout />}>
            <Route path="/perfil" element={<Perfil />} />
          </Route>
        </Route>

        {/* Rutas para asistente*/}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["Asistente", "Usuario Externo", "Usuario Interno", "Subdirección"]}
            />
          }>
          <Route element={<DashboardLayout />}>
            <Route path="/menu-asistente" element={<MenuAsistente />} />
            <Route path="/solicitud-evento" element={<SolicitudEvento />} />
            <Route path="/verificacion" element={<Verificacion />} />
          </Route>
        </Route>

        {/* Rutas para Admin*/}
        <Route element={<ProtectedRoute allowedRoles={["Administrador"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/gestion-espacios" element={<GestionEspacios />} />
            <Route path="/gestion-equipos/:id" element={<GestionEquipos />} />
            <Route path="admin/jefe-departamento" element={<JefeDepartamento />} />
            <Route path="admin/gestion-usuarios" element={<GestionUsuarios />} />
            <Route path="admin/bitacora" element={<BitacoraGeneral />} />
          </Route>
        </Route>

        {/* Rutas para Subdirección*/}
        <Route element={<ProtectedRoute allowedRoles={["Subdirección"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/detalles-solicitud/:id" element={<DetallesSolicitud />} />
            <Route path="/subdireccion/lista-solicitudes" element={<ListadoSolicitudes />} />
            <Route path="/subdireccion/menu-principal" element={<MenuSubdireccion />}/>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
