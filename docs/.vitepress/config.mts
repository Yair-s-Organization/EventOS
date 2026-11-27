import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'EventOS Docs',
  description: 'Documentación Oficial de Análisis y Diseño de Sistemas (v2.1) — Sinergia Ágil (ESCOM - IPN)',
  base: process.env.VITEPRESS_BASE || '/',
  lang: 'es-MX',
  cleanUrls: true,
  ignoreDeadLinks: true,

  vite: {
    ssr: {
      noExternal: ['vue', '@vue/server-renderer']
    }
  },

  themeConfig: {
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Hub Proyecto', link: '/00-Proyecto-EventOS' },
      { text: 'Requerimientos y Reglas', link: '/01-Requerimientos-y-Reglas-de-Negocio' },
      { text: 'Actores y Catálogos', link: '/02-Actores-y-Catalogos' },
      { text: 'Casos de Uso (CU-01–39)', link: '/03-Casos-de-Uso/00-Indice-Casos-de-Uso' },
      { text: 'Diseño UI', link: '/04-Diseno-UI' },
      { text: 'Sprints', link: '/05-Planeacion-y-Sprints' },
    ],

    sidebar: [
      {
        text: 'Visión General',
        items: [
          { text: 'Hub del Proyecto EventOS', link: '/00-Proyecto-EventOS' },
          { text: 'Requerimientos y Reglas de Negocio', link: '/01-Requerimientos-y-Reglas-de-Negocio' },
          { text: 'Actores, Diagramas y Catálogos', link: '/02-Actores-y-Catalogos' },
          { text: 'Diseño de Interfaces (UI)', link: '/04-Diseno-UI' },
          { text: 'Planeación y Sprints', link: '/05-Planeacion-y-Sprints' },
        ]
      },
      {
        text: 'Casos de Uso — Universales',
        collapsed: false,
        items: [
          { text: 'Índice General (CU-01 – CU-39)', link: '/03-Casos-de-Uso/00-Indice-Casos-de-Uso' },
          { text: 'CU-01 Iniciar sesión', link: '/03-Casos-de-Uso/CU01-Iniciar-sesion' },
          { text: 'CU-02 Ver perfil', link: '/03-Casos-de-Uso/CU02-Ver-perfil' },
          { text: 'CU-03 Cerrar sesión', link: '/03-Casos-de-Uso/CU03-Cerrar-sesion' },
          { text: 'CU-04 Consultar cartelera de eventos', link: '/03-Casos-de-Uso/CU04-Consultar-cartelera-de-eventos' },
          { text: 'CU-05 Visualizar detalles del evento', link: '/03-Casos-de-Uso/CU05-Visualizar-detalles-del-evento' },
          { text: 'CU-39 Restablecer contraseña', link: '/03-Casos-de-Uso/CU39-Restablecer-contrasena' },
        ]
      },
      {
        text: 'Casos de Uso — Subdirección',
        collapsed: false,
        items: [
          { text: 'CU-06 Consultar solicitudes de eventos', link: '/03-Casos-de-Uso/CU06-Consultar-solicitudes-de-eventos' },
          { text: 'CU-07 Consultar datos de un evento', link: '/03-Casos-de-Uso/CU07-Consultar-datos-de-un-evento' },
          { text: 'CU-08 Consultar eventos aprobados', link: '/03-Casos-de-Uso/CU08-Consultar-eventos-aprobados' },
          { text: 'CU-09 Cancelar evento', link: '/03-Casos-de-Uso/CU09-Cancelar-evento' },
          { text: 'CU-10 Agregar ponente', link: '/03-Casos-de-Uso/CU10-Agregar-ponente' },
          { text: 'CU-11 Solicitar evento (Subdirección)', link: '/03-Casos-de-Uso/CU11-Solicitar-evento' },
          { text: 'CU-12 Registrar personal de logística (Subdirección)', link: '/03-Casos-de-Uso/CU12-Registrar-personal-de-logistica' },
        ]
      },
      {
        text: 'Casos de Uso — Asistente',
        collapsed: false,
        items: [
          { text: 'CU-13 Registrar usuario', link: '/03-Casos-de-Uso/CU13-Registrar-usuario' },
          { text: 'CU-14 Visualizar bitácora de eventos', link: '/03-Casos-de-Uso/CU14-Visualizar-bitacora-de-eventos-realizados' },
          { text: 'CU-15 Reservar lugar a un evento', link: '/03-Casos-de-Uso/CU15-Reservar-lugar-a-un-evento' },
          { text: 'CU-16 Consultar disponibilidad de lugares', link: '/03-Casos-de-Uso/CU16-Consultar-disponibilidad-de-lugares' },
          { text: 'CU-17 Generar código QR', link: '/03-Casos-de-Uso/CU17-Generar-codigo-QR' },
          { text: 'CU-18 Consultar mis eventos por asistir', link: '/03-Casos-de-Uso/CU18-Consultar-mis-eventos-por-asistir' },
          { text: 'CU-19 Cancelar su asistencia', link: '/03-Casos-de-Uso/CU19-Cancelar-su-asistencia' },
          { text: 'CU-20 Visualizar QR de acceso', link: '/03-Casos-de-Uso/CU20-Visualizar-QR-de-acceso' },
          { text: 'CU-21 Solicitar evento (Asistente)', link: '/03-Casos-de-Uso/CU21-Solicitar-evento' },
        ]
      },
      {
        text: 'Casos de Uso — Logística',
        collapsed: false,
        items: [
          { text: 'CU-22 Consultar eventos asignados', link: '/03-Casos-de-Uso/CU22-Consultar-eventos-asignados' },
          { text: 'CU-23 Escanear QR', link: '/03-Casos-de-Uso/CU23-Escanear-QR' },
        ]
      },
      {
        text: 'Casos de Uso — Organizador',
        collapsed: false,
        items: [
          { text: 'CU-24 Consultar mis eventos', link: '/03-Casos-de-Uso/CU24-Consultar-mis-eventos' },
          { text: 'CU-25 Modificar logística del evento', link: '/03-Casos-de-Uso/CU25-Modificar-logistica-del-evento' },
          { text: 'CU-26 Modificar detalles de un evento', link: '/03-Casos-de-Uso/CU26-Modificar-detalles-de-un-evento' },
          { text: 'CU-27 Actualizar información general', link: '/03-Casos-de-Uso/CU27-Actualizar-informacion-general-del-evento' },
          { text: 'CU-28 Solicitar requerimientos técnicos', link: '/03-Casos-de-Uso/CU28-Solicitar-requerimientos-tecnicos' },
          { text: 'CU-29 Cancelar evento propio', link: '/03-Casos-de-Uso/CU29-Cancelar-evento-propio' },
          { text: 'CU-30 Emitir boletos directos', link: '/03-Casos-de-Uso/CU30-Emitir-boletos-directos' },
          { text: 'CU-31 Asignar personal de logística', link: '/03-Casos-de-Uso/CU31-Asignar-personal-de-logistica' },
          { text: 'CU-32 Registrar personal de logística (Organizador)', link: '/03-Casos-de-Uso/CU32-Registrar-personal-de-logistica' },
        ]
      },
      {
        text: 'Casos de Uso — Administrador',
        collapsed: false,
        items: [
          { text: 'CU-33 Registrar jefe de área', link: '/03-Casos-de-Uso/CU33-Registrar-jefe-de-area' },
          { text: 'CU-34 Cambiar estatus de cuenta', link: '/03-Casos-de-Uso/CU34-Cambiar-estatus-de-cuenta-de-usuario' },
          { text: 'CU-35 Gestionar espacios físicos', link: '/03-Casos-de-Uso/CU35-Gestionar-espacios-fisicos' },
          { text: 'CU-36 Gestionar inventario de cómputo', link: '/03-Casos-de-Uso/CU36-Gestionar-inventario-de-equipos-de-computo' },
          { text: 'CU-37 Consultar y exportar bitácora', link: '/03-Casos-de-Uso/CU37-Consultar-y-exportar-bitacora-historica' },
          { text: 'CU-38 Gestionar verificación de usuarios', link: '/03-Casos-de-Uso/CU38-Gestionar-estado-de-verificacion-de-usuarios' },
        ]
      }
    ],

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: 'En esta página'
    },

    docFooter: {
      prev: 'Anterior',
      next: 'Siguiente'
    }
  }
})
