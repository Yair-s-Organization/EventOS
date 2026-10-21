import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "EventOS Docs",
  description: "Documentación Oficial de Análisis y Diseño de Sistemas — Sinergia Ágil (ESCOM IPN)",
  base: process.env.VITEPRESS_BASE || '/',
  lang: 'es-MX',
  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Hub del Proyecto', link: '/00-Proyecto-EventOS' },
      { text: 'Requisitos y Reglas', link: '/01-Requerimientos-y-Reglas-de-Negocio' },
      { text: 'Catálogos y Actores', link: '/02-Actores-y-Catalogos' },
      { text: 'Casos de Uso', link: '/03-Casos-de-Uso/00-Indice-Casos-de-Uso' },
      { text: 'Mockups UI', link: '/04-Diseno-UI' },
      { text: 'Sprints', link: '/05-Planeacion-y-Sprints' },
    ],

    sidebar: [
      {
        text: 'Documentación General',
        items: [
          { text: '🚀 Hub del Proyecto', link: '/00-Proyecto-EventOS' },
          { text: '📋 Requerimientos y Reglas de Negocio', link: '/01-Requerimientos-y-Reglas-de-Negocio' },
          { text: '👥 Actores y Catálogos Oficiales', link: '/02-Actores-y-Catalogos' },
          { text: '🎨 Diseño de Interfaces (Mockups UI)', link: '/04-Diseno-UI' },
          { text: '📅 Planeación y Sprints (Scrum)', link: '/05-Planeacion-y-Sprints' },
        ]
      },
      {
        text: 'Casos de Uso (CU01 – CU37)',
        collapsed: false,
        items: [
          { text: '📑 Índice General de Casos de Uso', link: '/03-Casos-de-Uso/00-Indice-Casos-de-Uso' },
          {
            text: 'Universales',
            collapsed: true,
            items: [
              { text: 'CU01: Iniciar sesión', link: '/03-Casos-de-Uso/CU01-Iniciar-sesion' },
              { text: 'CU02: Ver perfil', link: '/03-Casos-de-Uso/CU02-Ver-perfil' },
              { text: 'CU03: Cerrar sesión', link: '/03-Casos-de-Uso/CU03-Cerrar-sesion' },
            ]
          },
          {
            text: 'Subdirección de Servicios Educativos',
            collapsed: true,
            items: [
              { text: 'CU04: Consultar solicitudes de eventos', link: '/03-Casos-de-Uso/CU04-Consultar-solicitudes-de-eventos' },
              { text: 'CU05: Consultar datos de un evento', link: '/03-Casos-de-Uso/CU05-Consultar-datos-de-un-evento' },
              { text: 'CU06: Consultar eventos aprobados', link: '/03-Casos-de-Uso/CU06-Consultar-eventos-aprobados' },
              { text: 'CU07: Cancelar evento', link: '/03-Casos-de-Uso/CU07-Cancelar-evento' },
              { text: 'CU08: Agregar ponente', link: '/03-Casos-de-Uso/CU08-Agregar-ponente' },
              { text: 'CU09: Solicitar evento', link: '/03-Casos-de-Uso/CU09-Solicitar-evento' },
              { text: 'CU10: Registrar personal de logística', link: '/03-Casos-de-Uso/CU10-Registrar-personal-de-logistica' },
            ]
          },
          {
            text: 'Asistente',
            collapsed: true,
            items: [
              { text: 'CU11: Registrar usuario', link: '/03-Casos-de-Uso/CU11-Registrar-usuario' },
              { text: 'CU12: Visualizar bitácora de eventos realizados', link: '/03-Casos-de-Uso/CU12-Visualizar-bitacora-de-eventos-realizados' },
              { text: 'CU13: Consultar cartelera de eventos', link: '/03-Casos-de-Uso/CU13-Consultar-cartelera-de-eventos' },
              { text: 'CU14: Reservar lugar a un evento', link: '/03-Casos-de-Uso/CU14-Reservar-lugar-a-un-evento' },
              { text: 'CU15: Consultar disponibilidad de lugares', link: '/03-Casos-de-Uso/CU15-Consultar-disponibilidad-de-lugares' },
              { text: 'CU16: Generar código QR', link: '/03-Casos-de-Uso/CU16-Generar-codigo-QR' },
              { text: 'CU17: Consultar mis eventos por asistir', link: '/03-Casos-de-Uso/CU17-Consultar-mis-eventos-por-asistir' },
              { text: 'CU18: Cancelar su asistencia', link: '/03-Casos-de-Uso/CU18-Cancelar-su-asistencia' },
              { text: 'CU19: Visualizar QR de acceso', link: '/03-Casos-de-Uso/CU19-Visualizar-QR-de-acceso' },
              { text: 'CU20: Solicitar evento (Asistente)', link: '/03-Casos-de-Uso/CU20-Solicitar-evento' },
              { text: 'CU21: Agregar etiquetas', link: '/03-Casos-de-Uso/CU21-Agregar-etiquetas' },
            ]
          },
          {
            text: 'Personal de Logística',
            collapsed: true,
            items: [
              { text: 'CU22: Consultar eventos asignados', link: '/03-Casos-de-Uso/CU22-Consultar-eventos-asignados' },
              { text: 'CU23: Visualizar detalles del evento', link: '/03-Casos-de-Uso/CU23-Visualizar-detalles-del-evento' },
              { text: 'CU24: Escanear QR', link: '/03-Casos-de-Uso/CU24-Escanear-QR' },
            ]
          },
          {
            text: 'Organizador',
            collapsed: true,
            items: [
              { text: 'CU25: Consultar mis eventos', link: '/03-Casos-de-Uso/CU25-Consultar-mis-eventos' },
              { text: 'CU26: Modificar logística del evento', link: '/03-Casos-de-Uso/CU26-Modificar-logistica-del-evento' },
              { text: 'CU27: Modificar detalles de un evento', link: '/03-Casos-de-Uso/CU27-Modificar-detalles-de-un-evento' },
              { text: 'CU28: Actualizar información general del evento', link: '/03-Casos-de-Uso/CU28-Actualizar-informacion-general-del-evento' },
              { text: 'CU29: Solicitar requerimientos técnicos', link: '/03-Casos-de-Uso/CU29-Solicitar-requerimientos-tecnicos' },
              { text: 'CU30: Cancelar evento propio', link: '/03-Casos-de-Uso/CU30-Cancelar-evento-propio' },
              { text: 'CU31: Emitir boletos directos', link: '/03-Casos-de-Uso/CU31-Emitir-boletos-directos' },
              { text: 'CU32: Asignar personal de logística', link: '/03-Casos-de-Uso/CU32-Asignar-personal-de-logistica' },
            ]
          },
          {
            text: 'Administrador',
            collapsed: true,
            items: [
              { text: 'CU33: Cambiar estatus de cuenta de usuario', link: '/03-Casos-de-Uso/CU33-Cambiar-estatus-de-cuenta-de-usuario' },
              { text: 'CU34: Gestionar espacios físicos', link: '/03-Casos-de-Uso/CU34-Gestionar-espacios-fisicos' },
              { text: 'CU35: Gestionar inventario de equipos de cómputo', link: '/03-Casos-de-Uso/CU35-Gestionar-inventario-de-equipos-de-computo' },
              { text: 'CU36: Consultar y exportar bitácora histórica', link: '/03-Casos-de-Uso/CU36-Consultar-y-exportar-bitacora-historica' },
              { text: 'CU37: Gestionar estado de verificación de usuarios', link: '/03-Casos-de-Uso/CU37-Gestionar-estado-de-verificacion-de-usuarios' },
            ]
          }
        ]
      }
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Buscar en la documentación',
            buttonAriaLabel: 'Buscar en la documentación'
          },
          modal: {
            noResultsText: 'No se encontraron resultados para',
            resetButtonTitle: 'Limpiar búsqueda',
            footer: {
              selectText: 'para seleccionar',
              navigateText: 'para navegar',
              closeText: 'para cerrar'
            }
          }
        }
      }
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Yair-s-Organization/EventOS' }
    ],

    docFooter: {
      prev: 'Página anterior',
      next: 'Próxima página'
    },

    outline: {
      label: 'En esta página',
      level: [2, 3]
    },

    footer: {
      message: 'Proyecto de Análisis y Diseño de Sistemas — ESCOM IPN',
      copyright: 'Copyright © 2026 Sinergia Ágil'
    }
  }
});
