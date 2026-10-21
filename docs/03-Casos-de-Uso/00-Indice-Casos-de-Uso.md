---
proyecto: "EventOS"
materia: "Análisis y Diseño de Sistemas"
tags:
  - apunte
  - escuela
  - ads
  - eventos
  - casos-de-uso
---

# 🗂️ Índice de Casos de Uso (`CU01` – `CU37`) — EventOS

> [!TIP] Consulta Modular para Desarrollo y Testing
> Cada Caso de Uso está documentado en su propia nota atómica con su tabla de atributos (Autor, Actor, Entradas, Salidas, Precondiciones, Postcondiciones, Errores) y sus trayectorias (Principal y Alternativas con distinción explícita entre pasos de 👤 **[Actor]** y ⚙️ **[Sistema]**), conforme al Documento Definitivo de Especificaciones de Uso.
>
> 🔗 **Hub del Proyecto:** [[00-Proyecto-EventOS]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

---

## Tabla General de Casos de Uso por Actores (`CU01` – `CU37`)

### 🌐 Universales (Todos los Actores)

| Código | Caso de Uso (Enlace) | Actor(es) | Propósito |
| :--- | :--- | :--- | :--- |
| **CU01** | [[CU01-Iniciar-sesion\|CU01 - Iniciar sesión]] | Todos los actores | Autenticar al usuario en el sistema para acceder a las funciones según sus permisos. |
| **CU02** | [[CU02-Ver-perfil\|CU02 - Ver perfil]] | Todos los actores | Permitir al actor consultar la información registrada en su cuenta, datos personales, tipo de usuario y rol asignado. |
| **CU03** | [[CU03-Cerrar-sesion\|CU03 - Cerrar sesión]] | Todos los actores | Permitir al actor finalizar su sesión de trabajo activa en la plataforma de forma segura. |

### 🏛️ Subdirección de Servicios Educativos

| Código | Caso de Uso (Enlace) | Actor(es) | Propósito |
| :--- | :--- | :--- | :--- |
| **CU04** | [[CU04-Consultar-solicitudes-de-eventos\|CU04 - Consultar solicitudes de eventos]] | Subdirección de Servicios Educativos | Consultar las solicitudes de eventos pendientes de aprobación para identificar aquellas que requieren evaluación. |
| **CU05** | [[CU05-Consultar-datos-de-un-evento\|CU05 - Consultar datos de un evento (extend de CU-04)]] | Subdirección de Servicios Educativos | Consultar los datos de una solicitud específica para su evaluación y dictaminar su aprobación o rechazo. |
| **CU06** | [[CU06-Consultar-eventos-aprobados\|CU06 - Consultar eventos aprobados]] | Subdirección de Servicios Educativos | Visualizar y consultar los eventos con estatus "Aprobado" y acceder a operaciones adicionales. |
| **CU07** | [[CU07-Cancelar-evento\|CU07 - Cancelar evento (extend de CU-06)]] | Subdirección de Servicios Educativos | Cancelar un evento aprobado registrando motivo obligatorio, liberando espacio e informando a los asistentes en la aplicación. |
| **CU08** | [[CU08-Agregar-ponente\|CU08 - Agregar ponente (extend de CU-06 y CU-27)]] | Subdirección / Organizador | Registrar y asociar ponentes a eventos previamente aprobados (`UI29`). |
| **CU09** | [[CU09-Solicitar-evento\|CU09 - Solicitar evento]] | Asistente / Subdirección | Registrar solicitudes de eventos con uno o más bloques de subevento (`UI07`), aprobándose automáticamente si registra Subdirección (`RN-13`). |
| **CU10** | [[CU10-Registrar-personal-de-logistica\|CU10 - Registrar personal de logística]] | Subdirección / Organizador | Registrar y asignar personal de logística a un evento aprobado (`UI27`), con permisos exclusivos para ese evento. |

### 🎓 Asistente

| Código | Caso de Uso (Enlace) | Actor(es) | Propósito |
| :--- | :--- | :--- | :--- |
| **CU11** | [[CU11-Registrar-usuario\|CU11 - Registrar usuario]] | Asistente / Administrador | Permitir el alta de usuarios desde `UI02` (registro público o creación manual por Administrador). |
| **CU12** | [[CU12-Visualizar-bitacora-de-eventos-realizados\|CU12 - Visualizar bitácora de eventos realizados]] | Asistente | Consultar el historial cronológico de eventos concluidos que ha organizado o realizado (`UI10`). |
| **CU13** | [[CU13-Consultar-cartelera-de-eventos\|CU13 - Consultar cartelera de eventos]] | Asistente | Visualizar y filtrar los eventos disponibles según el alcance del asistente (`UI04`, `UI05`). |
| **CU14** | [[CU14-Reservar-lugar-a-un-evento\|CU14 - Reservar lugar a un evento]] | Asistente | Registrarse en un evento de su interés seleccionando asiento/lugar cuando corresponda (`UI06`) y obteniendo su boleto digital. |
| **CU15** | [[CU15-Consultar-disponibilidad-de-lugares\|CU15 - Consultar disponibilidad de lugares (include de CU-14)]] | Asistente | Obtener la cantidad de lugares disponibles para determinar si el Asistente puede continuar con su reserva. |
| **CU16** | [[CU16-Generar-codigo-QR\|CU16 - Generar código QR (include de CU-14)]] | Asistente | Generar un código QR único encriptado y asociarlo al boleto digital de la reserva confirmada (`UI09`). |
| **CU17** | [[CU17-Consultar-mis-eventos-por-asistir\|CU17 - Consultar mis eventos por asistir]] | Asistente | Consultar el listado de eventos en los que el Asistente cuenta con una reserva activa (`UI08`). |
| **CU18** | [[CU18-Cancelar-su-asistencia\|CU18 - Cancelar su asistencia (extend de CU-17)]] | Asistente | Cancelar su reserva de lugar en un evento activo, liberando el cupo o lugar específico ocupado. |
| **CU19** | [[CU19-Visualizar-QR-de-acceso\|CU19 - Visualizar QR de acceso (extend de CU-17)]] | Asistente | Visualizar el código QR de su boleto digital (`UI09`) para presentarlo al personal de logística el día del evento. |
| **CU20** | [[CU20-Solicitar-evento\|CU20 - Solicitar evento]] | Asistente | Solicitar un evento de una o varias fechas (subeventos) en `UI07`, adjuntando documento según tipo de solicitante. |
| **CU21** | [[CU21-Agregar-etiquetas\|CU21 - Agregar etiquetas (extend de CU-20)]] | Asistente | Incorporar etiquetas temáticas o áreas de conocimiento a un evento (`UI30`). |

### 🪪 Personal de Logística

| Código | Caso de Uso (Enlace) | Actor(es) | Propósito |
| :--- | :--- | :--- | :--- |
| **CU22** | [[CU22-Consultar-eventos-asignados\|CU22 - Consultar eventos asignados]] | Personal de Logística | Consultar los eventos próximos en los que ha sido asignado para validar el acceso de los asistentes (`UI18`). |
| **CU23** | [[CU23-Visualizar-detalles-del-evento\|CU23 - Visualizar detalles del evento (extend de CU-22)]] | Personal de Logística | Visualizar la información detallada de un evento asignado (`UI05`) y acceder al escáner QR. |
| **CU24** | [[CU24-Escanear-QR\|CU24 - Escanear QR (extend de CU-23)]] | Personal de Logística | Validar el acceso de los asistentes escaneando sus códigos QR (`UI19`) y actualizando el boleto a `Ingresado`. |

### 📋 Organizador

| Código | Caso de Uso (Enlace) | Actor(es) | Propósito |
| :--- | :--- | :--- | :--- |
| **CU25** | [[CU25-Consultar-mis-eventos\|CU25 - Consultar mis eventos]] | Organizador | Listar los eventos administrados por el organizador (`UI14`) y acceder a su panel de administración (`UI15`). |
| **CU26** | [[CU26-Modificar-logistica-del-evento\|CU26 - Modificar logística del evento (extend de CU-25)]] | Organizador | Reprogramar o reubicar fecha, hora o espacio de un evento con motivo obligatorio y notificación interna en la aplicación. |
| **CU27** | [[CU27-Modificar-detalles-de-un-evento\|CU27 - Modificar detalles de un evento (extend de CU-25)]] | Organizador | Acceder a la edición de especificaciones generales, requerimientos técnicos o ponentes de un evento (`UI15`). |
| **CU28** | [[CU28-Actualizar-informacion-general-del-evento\|CU28 - Actualizar información general del evento (extend de CU-27)]] | Organizador | Modificar descripción, alcance (Público, Interno, Privado) y etiquetas temáticas del evento (`UI16`). |
| **CU29** | [[CU29-Solicitar-requerimientos-tecnicos\|CU29 - Solicitar requerimientos técnicos (extend de CU-27)]] | Organizador | Registrar la cantidad de computadoras necesarias para un evento en laboratorio (`UI17`). |
| **CU08** | [[CU08-Agregar-ponente\|CU08 - Agregar ponente (extend de CU-27)]] | Organizador / Subdirección | Registrar y asociar ponentes a un evento aprobado (`UI29`). |
| **CU30** | [[CU30-Cancelar-evento-propio\|CU30 - Cancelar evento propio (extend de CU-25)]] | Organizador | Cancelar un evento propio especificando justificación obligatoria, notificando internamente a los asistentes. |
| **CU31** | [[CU31-Emitir-boletos-directos\|CU31 - Emitir boletos directos (extend de CU-25)]] | Organizador | Emitir boletos directos individuales para destinatarios con cuenta activa, disponibles en la aplicación sin envío de correo. |
| **CU32** | [[CU32-Asignar-personal-de-logistica\|CU32 - Asignar personal de logística (extend de CU-25)]] | Organizador | Seleccionar usuarios activos del listado del sistema para asignarlos como personal de logística del evento. |
| **CU10** | [[CU10-Registrar-personal-de-logistica\|CU10 - Registrar personal de logística]] | Organizador / Subdirección | Registrar y asignar personal de logística mediante nombre y correo en `UI27`. |

### 🛡️ Administrador

| Código | Caso de Uso (Enlace) | Actor(es) | Propósito |
| :--- | :--- | :--- | :--- |
| **CU11** | [[CU11-Registrar-usuario\|CU11 - Registrar usuario]] | Administrador / Asistente | Registrar manualmente cuentas de usuario asignando el rol de Asistente o Subdirección (`UI02`). |
| **CU33** | [[CU33-Cambiar-estatus-de-cuenta-de-usuario\|CU33 - Cambiar estatus de cuenta de usuario]] | Administrador | Activar o desactivar cuentas de usuario (`Activo` / `Inactivo`) en `UI21` sin eliminar su información. |
| **CU34** | [[CU34-Gestionar-espacios-fisicos\|CU34 - Gestionar espacios físicos]] | Administrador | Consultar y modificar el estado operativo (`Activo`, `Mantenimiento`, `Inactivo`) y aforo máximo de los espacios físicos (`UI22`). |
| **CU35** | [[CU35-Gestionar-inventario-de-equipos-de-computo\|CU35 - Gestionar inventario de equipos de cómputo]] | Administrador | Consultar y modificar el estado de los equipos de cómputo de un laboratorio (`UI23`), recalculando su capacidad operativa. |
| **CU36** | [[CU36-Consultar-y-exportar-bitacora-historica\|CU36 - Consultar y exportar bitácora histórica]] | Administrador | Consultar, filtrar y exportar en formato PDF los registros históricos de eventos y acciones del sistema (`UI20`). |
| **CU37** | [[CU37-Gestionar-estado-de-verificacion-de-usuarios\|CU37 - Gestionar estado de verificación de usuarios]] | Administrador | Gestionar el estado de verificación (`Verificado` / `No verificado`) de Alumnos, Profesores y Empresas (`UI31`). |
