import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { MainLayout } from "../components/templates/MainLayout";
import { LoginForm } from "../features/auth/LoginForm";
import { Registro } from "../features/auth/Registro";
import { ConfirmarRegistro } from "../features/auth/ConfirmarRegistro";
import { DashboardLayout } from "../components/templates/DashboardLayout";
import { ProtectedRoute } from "../app/ProtectedRoutes";

import { SolicitudEvento } from "../features/events/SolicitudEventos";
import { DetallesSolicitud } from "../features/educational-services/DetallesSolicitud";
import { ListadoSolicitudes } from "../features/educational-services/ListadoSolicitudes";
import { MenuAsistente } from "../features/assistant/menu-asistente";
import { GestionEspacios } from "../features/admin/Gestion-Espacios";
import { GestionEquipos } from "../features/admin/Gestion-Equipos";
import { MenuSubdireccion } from "../features/educational-services/MenuSubdireccion";
import { ListaVerificaciones } from "../features/educational-services/ListaVerificaciones";
import { DetalleVerificacion } from "../features/educational-services/DetalleVerificacion";
import { Perfil } from "../features/account/miPerfil";
import { Verificacion } from "../features/account/verificacion";
import { JefeDepartamento } from "../features/admin/JefeDepartamento";
import { GestionUsuarios } from "../features/admin/Gestion-Usuarios";
import { BitacoraGeneral } from "../features/admin/Bitacora";
import { MenuPrincipalAdministracion } from "../features/admin/menu-admin";
import { SolicitarRecuperacion } from "../features/RecuperacionContrasena/SolicitarRecuperacion";
import { RestablecerContrasena } from "../features/RecuperacionContrasena/RestablecerContrasena";

import { EventCatalogPage } from "../features/event-catalog/pages/EventCatalogPage";
import { EventDetailsLayout } from "../features/event-details/pages/EventDetailsLayout";
import { EventDetailsRoute } from "../features/event-details/pages/EventDetailsRoute";
import { SubEventDetailsRoute } from "../features/event-details/pages/SubEventDetailsRoute";
import { ReservationRoute } from "../features/reservations/pages/ReservationRoute";
import { MyTicketsRoute } from "../features/tickets/pages/MyTicketsRoute";
import { DigitalTicketRoute } from "../features/tickets/pages/DigitalTicketRoute";

import { SolicitudesAprobadas } from "../features/educational-services/SolicitudesAprobadas";
import { MisEventos } from "../features/organizer/MisEventos";

import { AdministracionEvento } from "../features/organizer/AdministracionEvento";
import { EditarEvento } from "../features/organizer/EditarEvento";
import { AdministracionEventoConSubeventos } from "../features/organizer/AdministrarEventoConSubeventos";
import { EditarEventoConSubeventos } from "../features/organizer/EditarEventoConSubeventos";

import { PanelEventosAsignados } from "../features/logistics/PanelEventosAsignados";
import { ControlAcceso } from "../features/logistics/ControlAcceso";
import { EscanearBoleto } from "../features/logistics/EscanearBoleto";

import { AgregarLogistica } from "../features/organizer/components/AgregarLogistica";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/confirmar-registro" element={<ConfirmarRegistro />} />
          <Route path="/detalles-solicitud/" element={<DetallesSolicitud />} />
          <Route path="/cartelera" element={<EventCatalogPage />} />
          <Route path="/recuperar-contrasena" element={<SolicitarRecuperacion />} />
          <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
        </Route>

        <Route element={<EventDetailsLayout />}>
          <Route path="/eventos/:idEvento" element={<EventDetailsRoute />} />
          <Route path="/eventos/:idEvento/actividades/:idSubEvento" element={<SubEventDetailsRoute />}/>
          <Route path="/eventos/:idEvento/actividades/:idSubEvento/reservar" element={<ReservationRoute />}/>
        </Route>

        {/*Solicitud evento para subdirección y asistentes (Organizador)*/}
        <Route element={<ProtectedRoute allowedRoles={["Subdirección", "Asistente", "Usuario Externo", "Usuario Interno",]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/solicitud-evento" element={<SolicitudEvento />} />
            <Route path="/organizador/mis-eventos" element={<MisEventos />} />
            <Route path="/organizador/administrar-evento/:idEvento" element={<AdministracionEvento />}/>
            <Route path="/organizador/administrar-evento/:idEvento/subevento/:idSubEvento" element={<AdministracionEvento />}/>
            <Route path="/organizador/editar-evento/:idEvento" element={<EditarEvento />}/>
            <Route path="/organizador/editar-evento/:idEvento/subevento/:idSubEvento" element={<EditarEvento />}/>
            <Route path="/organizador/administrar-evento-subeventos/:idEvento" element={<AdministracionEventoConSubeventos />}/>
            <Route path="/organizador/editar-evento-subeventos/:idEvento" element={<EditarEventoConSubeventos />}/>
            <Route path="/organizador/administrar-evento/:idEvento/agregar-logistica" element={<AgregarLogistica />}/>
          </Route>
        </Route>

        {/*Pantalla Perfil compartida*/}
        <Route element={<ProtectedRoute allowedRoles={["Administrador","Subdirección","Asistente","Usuario Externo","Usuario Interno",]}/>}>
          <Route element={<DashboardLayout />}>
            <Route path="/perfil" element={<Perfil />} />
          </Route>
        </Route>

        {/* Rutas para asistente*/}
        <Route
          element={<ProtectedRoute allowedRoles={["Asistente", "Usuario Externo", "Usuario Interno"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/menu-asistente" element={<MenuAsistente />} />
            <Route path="/asistente/cartelera" element={<EventCatalogPage />} />
            <Route path="/asistente/boletos" element={<MyTicketsRoute />} />
            <Route path="/asistente/boletos/:idBoleto" element={<DigitalTicketRoute />} />
            <Route path="/verificacion" element={<Verificacion />} />
            <Route path="/panel-eventos-asignados" element={<PanelEventosAsignados />} />
            <Route path="/control-acceso/:idSubEvento" element={<ControlAcceso />} />
            <Route path="/escanear-boleto/:idSubEvento" element={<EscanearBoleto />} />
          </Route>
        </Route>

        {/* Rutas para Admin*/}
        <Route element={<ProtectedRoute allowedRoles={["Administrador"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/gestion-espacios" element={<GestionEspacios />} />
            <Route path="/gestion-equipos/:id" element={<GestionEquipos />} />
            <Route path="admin/jefe-departamento" element={<JefeDepartamento />}/>
            <Route path="admin/gestion-usuarios" element={<GestionUsuarios />}/>
            <Route path="admin/bitacora" element={<BitacoraGeneral />} />
            <Route path="/menu-admin" element={<MenuPrincipalAdministracion />}/>
          </Route>
        </Route>

        {/* Rutas para Subdirección*/}
        <Route element={<ProtectedRoute allowedRoles={["Subdirección"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/detalles-solicitud/:id" element={<DetallesSolicitud />}/>
            <Route path="/subdireccion/lista-solicitudes" element={<ListadoSolicitudes />}/>
            <Route path="/subdireccion/menu-principal" element={<MenuSubdireccion />}/>
            <Route path="/subdireccion/solicitudes-aprobadas" element={<SolicitudesAprobadas />}/>
            <Route path="/subdireccion/verificaciones" element={<ListaVerificaciones />}/>
            <Route path="/subdireccion/verificaciones/:id" element={<DetalleVerificacion />}/>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/cartelera" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
