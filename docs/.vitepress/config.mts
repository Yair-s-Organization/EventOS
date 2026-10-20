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
        text: 'Casos de Uso (CU01 – CU31)',
        collapsed: false,
        items: [
          { text: '📑 Índice General de Casos de Uso', link: '/03-Casos-de-Uso/00-Indice-Casos-de-Uso' },
          {
            text: 'Autenticación y Sesión',
            collapsed: true,
            items: [
              { text: 'CU01: Iniciar sesión', link: '/03-Casos-de-Uso/CU01-Iniciar-sesion' },
              { text: 'CU07: Cerrar sesión', link: '/03-Casos-de-Uso/CU07-Cerrar-sesion' },
            ]
          },
          {
            text: 'Subdirección de Servicios Educativos',
            collapsed: true,
            items: [
              { text: 'CU02: Consultar solicitudes de eventos', link: '/03-Casos-de-Uso/CU02-Consultar-solicitudes-de-eventos' },
              { text: 'CU03: Consultar datos de un evento', link: '/03-Casos-de-Uso/CU03-Consultar-datos-de-un-evento' },
              { text: 'CU04: Consultar eventos aprobados', link: '/03-Casos-de-Uso/CU04-Consultar-eventos-aprobados' },
              { text: 'CU05: Cancelar evento', link: '/03-Casos-de-Uso/CU05-Cancelar-evento' },
              { text: 'CU08: Visualizar Bitácora de Eventos Realizados', link: '/03-Casos-de-Uso/CU08-Visualizar-Bitacora-de-Eventos-Realizados' },
              { text: 'CU26: Emitir boletos directos', link: '/03-Casos-de-Uso/CU26-Emitir-boletos-directos' },
            ]
          },
          {
            text: 'Organizador',
            collapsed: true,
            items: [
              { text: 'CU06: Solicitar un evento', link: '/03-Casos-de-Uso/CU06-Solicitar-un-evento' },
              { text: 'CU20: Consultar mis eventos', link: '/03-Casos-de-Uso/CU20-Consultar-mis-eventos' },
              { text: 'CU21: Modificar logística del evento', link: '/03-Casos-de-Uso/CU21-Modificar-logistica-del-evento' },
              { text: 'CU22: Modificar detalles de un evento', link: '/03-Casos-de-Uso/CU22-Modificar-detalles-de-un-evento' },
              { text: 'CU23: Actualizar información general del evento', link: '/03-Casos-de-Uso/CU23-Actualizar-informacion-general-del-evento' },
              { text: 'CU24: Solicitar requerimientos técnicos', link: '/03-Casos-de-Uso/CU24-Solicitar-requerimientos-tecnicos' },
              { text: 'CU25: Cancelar evento propio', link: '/03-Casos-de-Uso/CU25-Cancelar-evento-propio' },
              { text: 'CU27: Asignar personal de Logística', link: '/03-Casos-de-Uso/CU27-Asignar-personal-de-Logistica' },
            ]
          },
          {
            text: 'Asistente',
            collapsed: true,
            items: [
              { text: 'CU09: Consultar Cartelera de Eventos', link: '/03-Casos-de-Uso/CU09-Consultar-Cartelera-de-Eventos' },
              { text: 'CU10: Reservar lugar a un evento', link: '/03-Casos-de-Uso/CU10-Reservar-lugar-a-un-evento' },
              { text: 'CU11: Recibir confirmación de reserva por correo', link: '/03-Casos-de-Uso/CU11-Recibir-confirmacion-de-reserva-por-correo' },
              { text: 'CU12: Consultar disponibilidad de lugares', link: '/03-Casos-de-Uso/CU12-Consultar-disponibilidad-de-lugares' },
              { text: 'CU13: Generar código QR', link: '/03-Casos-de-Uso/CU13-Generar-codigo-QR' },
              { text: 'CU14: Consultar sus eventos', link: '/03-Casos-de-Uso/CU14-Consultar-sus-eventos' },
              { text: 'CU15: Cancelar su asistencia', link: '/03-Casos-de-Uso/CU15-Cancelar-su-asistencia' },
              { text: 'CU16: Visualizar QR de acceso', link: '/03-Casos-de-Uso/CU16-Visualizar-QR-de-acceso' },
            ]
          },
          {
            text: 'Personal de Logística',
            collapsed: true,
            items: [
              { text: 'CU17: Consultar Eventos Asignados', link: '/03-Casos-de-Uso/CU17-Consultar-Eventos-Asignados' },
              { text: 'CU18: Visualizar detalles del evento', link: '/03-Casos-de-Uso/CU18-Visualizar-detalles-del-evento' },
              { text: 'CU19: Escanear QR', link: '/03-Casos-de-Uso/CU19-Escanear-QR' },
            ]
          },
          {
            text: 'Administrador',
            collapsed: true,
            items: [
              { text: 'CU28: Cambiar estatus de cuenta de usuario', link: '/03-Casos-de-Uso/CU28-Cambiar-estatus-de-cuenta-de-usuario' },
              { text: 'CU29: Gestionar Espacios Físicos', link: '/03-Casos-de-Uso/CU29-Gestionar-Espacios-Fisicos-Administrador' },
              { text: 'CU30: Gestionar Inventario de Equipos de Cómputo', link: '/03-Casos-de-Uso/CU30-Gestionar-Inventario-de-Equipos-de-Computo-Administrador' },
              { text: 'CU31: Consultar y Exportar Bitácora Histórica', link: '/03-Casos-de-Uso/CU31-Consultar-y-Exportar-Bitacora-Historica' },
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
