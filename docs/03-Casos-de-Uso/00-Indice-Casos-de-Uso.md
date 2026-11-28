---
proyecto: "EventOS"
materia: "Análisis y Diseño de Sistemas"
version: "2.1"
tags:
  - apunte
  - escuela
  - ads
  - eventos
  - casos-de-uso
---

# Índice de Casos de Uso (`CU-01` – `CU-39`) — EventOS (v2.1)

> [!TIP] Consulta Modular para Desarrollo y Testing
> Cada Caso de Uso está documentado en su propio archivo modular con su resumen, tabla de atributos (Autor, Actor, Propósito, Entradas, Salidas, Precondiciones, Postcondiciones, Errores, Tipo) y sus trayectorias (Principal y Alternativas), conforme a la Especificación Consolidada v2.1 (`UI01`–`UI32` y política de cupo configurable sin sobrecupo).
>
> **Hub del Proyecto:** [00-Proyecto-EventOS](../00-Proyecto-EventOS.md) | **Reglas de Negocio:** [01-Requerimientos-y-Reglas-de-Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md) | **Catálogos UI/MSG:** [02-Actores-y-Catalogos](../02-Actores-y-Catalogos.md)

---

## Tabla General de Casos de Uso por Actores (`CU-01` – `CU-39`)

### Universales (Todos los Actores)

| Código | Caso de Uso (Enlace) | Actor(es) | Propósito |
| :--- | :--- | :--- | :--- |
| **CU-01** | [CU-01 Iniciar sesión](./CU01-Iniciar-sesion.md) | Todos los actores | Autenticar al usuario en el sistema para acceder a las funciones según sus permisos (`UI01`). |
| **CU-02** | [CU-02 Ver perfil](./CU02-Ver-perfil.md) | Todos los actores | Permitir al actor consultar la información registrada en su cuenta, datos personales, tipo de usuario y rol asignado (`UI28`). |
| **CU-03** | [CU-03 Cerrar sesión](./CU03-Cerrar-sesion.md) | Todos los actores | Permitir al actor finalizar su sesión de trabajo activa en la plataforma de forma segura (`UI03`, `UI04`, `UI25`, `UI26`). |
| **CU-04** | [CU-04 Consultar cartelera de eventos](./CU04-Consultar-cartelera-de-eventos.md) | Todos / Público General | Explorar y filtrar la cartelera de eventos aprobados disponibles en la institución (`UI04`). |
| **CU-05** | [CU-05 Visualizar detalles del evento](./CU05-Visualizar-detalles-del-evento.md) | Todos / Público General / Logística | Consultar la información detallada de un evento y subeventos (`UI05`, `UI05.1`), acceso por enlace privado y entrada a reserva o escáner QR según el rol. |
| **CU-39** | [CU-39 Restablecer contraseña](./CU39-Restablecer-contrasena.md) | Todos los actores / Público | Permitir al usuario redefinir su contraseña de acceso mediante validación de token temporal de recuperación enviado a su correo registrado (`UI01` / `UI29`). |

### Subdirección de Servicios Educativos

| Código | Caso de Uso (Enlace) | Actor(es) | Propósito |
| :--- | :--- | :--- | :--- |
| **CU-06** | [CU-06 Consultar solicitudes de eventos](./CU06-Consultar-solicitudes-de-eventos.md) | Subdirección de Servicios Educativos | Consultar las solicitudes de eventos pendientes de aprobación para identificar aquellas que requieren evaluación (`UI11`). |
| **CU-07** | [CU-07 Consultar datos de un evento (extend de CU-06)](./CU07-Consultar-datos-de-un-evento.md) | Subdirección de Servicios Educativos | Consultar los datos de una solicitud específica para su evaluación y dictaminar su aprobación, rechazo o solicitud de cambios (`UI12`). |
| **CU-08** | [CU-08 Consultar eventos aprobados](./CU08-Consultar-eventos-aprobados.md) | Subdirección de Servicios Educativos | Visualizar y consultar los eventos con estatus "Aprobado" y acceder a operaciones adicionales (`UI13`). |
| **CU-09** | [CU-09 Cancelar evento (extend de CU-08)](./CU09-Cancelar-evento.md) | Subdirección de Servicios Educativos | Cancelar un evento aprobado registrando motivo obligatorio, liberando espacio e informando a los asistentes (`UI13`). |
| **CU-10** | [CU-10 Agregar ponente (extend de CU-08)](./CU10-Agregar-ponente.md) | Subdirección / Organizador | Registrar y asociar ponentes a eventos previamente aprobados dentro de la modificación/administración del evento (`UI16`). |
| **CU-11** | [CU-11 Solicitar evento](./CU11-Solicitar-evento.md) | Subdirección de Servicios Educativos | Registrar solicitudes de eventos institucionales con uno o más subeventos y cupo máximo configurable (`UI07`), con aprobación automática sin modal de urgencia (`RN-13`). |
| **CU-12** | [CU-12 Registrar personal de logística](./CU12-Registrar-personal-de-logistica.md) | Subdirección de Servicios Educativos | Registrar y asignar personal de logística a un evento aprobado (`UI27`, activación por token en `/activar-logistica` de `UI02`). |

### Asistente

| Código | Caso de Uso (Enlace) | Actor(es) | Propósito |
| :--- | :--- | :--- | :--- |
| **CU-13** | [CU-13 Registrar usuario](./CU13-Registrar-usuario.md) | Asistente / Logística | Registrar una nueva cuenta en la plataforma mediante autogestión y confirmación por correo (`UI02` y `/confirmar-registro`). |
| **CU-14** | [CU-14 Visualizar bitácora de eventos realizados](./CU14-Visualizar-bitacora-de-eventos-realizados.md) | Asistente | Consultar el historial de eventos pasados en los que el asistente participó (consolidado en `UI08`, sin pantalla dedicada independiente). |
| **CU-15** | [CU-15 Reservar lugar a un evento](./CU15-Reservar-lugar-a-un-evento.md) | Asistente | Reservar una butaca con retención temporal de 5 min (`UI06`) o un lugar en admisión general / registro simple sin QR (`UI30`) respetando `min(cupoMaximo, aforoRecinto)`. |
| **CU-16** | [CU-16 Consultar disponibilidad de lugares (include de CU-15)](./CU16-Consultar-disponibilidad-de-lugares.md) | Asistente | Verificar en tiempo real la disponibilidad de cupo general o butacas en mapa del recinto y su modalidad de acceso (`UI06`). |
| **CU-17** | [CU-17 Generar código QR (include de CU-15)](./CU17-Generar-codigo-QR.md) | Asistente | Generar el boleto digital con código QR único firmado criptográficamente al confirmar una reserva en modalidades con QR (`UI09`). |
| **CU-18** | [CU-18 Consultar mis eventos por asistir](./CU18-Consultar-mis-eventos-por-asistir.md) | Asistente | Consultar el listado de eventos próximos en los que el asistente cuenta con una reserva activa (`UI08`). |
| **CU-19** | [CU-19 Cancelar su asistencia (extend de CU-18)](./CU19-Cancelar-su-asistencia.md) | Asistente | Cancelar una reserva activa liberando el cupo o recurso asignado e invalidando el código QR (`UI08`). |
| **CU-20** | [CU-20 Visualizar QR de acceso (extend de CU-18)](./CU20-Visualizar-QR-de-acceso.md) | Asistente | Mostrar en pantalla el boleto digital y código QR asociado a una reserva activa (`UI09`). |
| **CU-21** | [CU-21 Solicitar evento](./CU21-Solicitar-evento.md) | Asistente | Solicitar la organización de un evento (`UI07`), exigiendo contar con identidad verificada (`UI32`, `MSG-E-54`). |

### Personal de Logística

| Código | Caso de Uso (Enlace) | Actor(es) | Propósito |
| :--- | :--- | :--- | :--- |
| **CU-22** | [CU-22 Consultar eventos asignados](./CU22-Consultar-eventos-asignados.md) | Personal de Logística | Consultar los eventos próximos en los que ha sido asignado (`UI18`) y acceder al control de acceso por subevento (`UI17`). |
| **CU-23** | [CU-23 Escanear QR (extend de CU-05)](./CU23-Escanear-QR.md) | Personal de Logística | Validar el acceso de los asistentes desde control de acceso (`UI17`) escaneando sus códigos QR (`UI19`) y actualizando el boleto a `Ingresado`. |

### Organizador

| Código | Caso de Uso (Enlace) | Actor(es) | Propósito |
| :--- | :--- | :--- | :--- |
| **CU-24** | [CU-24 Consultar mis eventos](./CU24-Consultar-mis-eventos.md) | Organizador | Listar los eventos administrados por el organizador (`UI14`) y acceder a su administración y detalles (`UI15`). |
| **CU-25** | [CU-25 Modificar logística (fecha, hora, espacio) del evento (extend de CU-24)](./CU25-Modificar-logistica-del-evento.md) | Organizador | Reprogramar o reubicar fecha, hora, espacio, modalidad o `cupoMaximo` de un evento con motivo obligatorio (`UI15`, `UI16`), aplicando matriz de recintos y flujo FIFO. |
| **CU-26** | [CU-26 Modificar detalles de un evento (extend de CU-24)](./CU26-Modificar-detalles-de-un-evento.md) | Organizador | Acceder a la edición de especificaciones generales, requerimientos técnicos o ponentes de un evento (`UI15`, `UI16`). |
| **CU-27** | [CU-27 Actualizar información general del evento (extend de CU-26)](./CU27-Actualizar-informacion-general-del-evento.md) | Organizador | Modificar descripción, alcance (Público, Interno, Privado), póster y etiquetas temáticas del evento (`UI16`). |
| **CU-28** | [CU-28 Solicitar requerimientos técnicos (extend de CU-26)](./CU28-Solicitar-requerimientos-tecnicos.md) | Organizador | Registrar la cantidad de equipos de cómputo funcionales requeridos para un subevento en laboratorio desde el modal integrado en `UI07`, `UI15` y `UI16`. |
| **CU-29** | [CU-29 Cancelar evento propio (extend de CU-24)](./CU29-Cancelar-evento-propio.md) | Organizador | Cancelar un evento propio especificando justificación obligatoria, notificando a los asistentes. |
| **CU-30** | [CU-30 Invitar asistentes a eventos privados (extend de CU-24)](./CU30-Emitir-boletos-directos.md) | Organizador | Gestionar invitados privados **por subevento** mediante correo individual, carga masiva por lotes/CSV o enlace compartible (`/eventos/privado/:tokenSubEvento`) dentro de `UI15` y `UI16`. |
| **CU-31** | [CU-31 Asignar personal de logística](./CU31-Asignar-personal-de-logistica.md) | Organizador | Seleccionar usuarios activos del listado del sistema para asignarlos como personal de logística del evento (`UI27`). |
| **CU-32** | [CU-32 Registrar personal de logística](./CU32-Registrar-personal-de-logistica.md) | Organizador | Registrar de forma independiente personal de logística con invitación por token de 48 horas (`UI27`, activación en `/activar-logistica` de `UI02`). |

### Administrador

| Código | Caso de Uso (Enlace) | Actor(es) | Propósito |
| :--- | :--- | :--- | :--- |
| **CU-33** | [CU-33 Registrar jefe de área](./CU33-Registrar-jefe-de-area.md) | Administrador | Registrar y asignar la jefatura de un departamento académico o administrativo con correo `@ipn.mx` (`UI24`, `UI26`). |
| **CU-34** | [CU-34 Cambiar estatus de cuenta de usuario](./CU34-Cambiar-estatus-de-cuenta-de-usuario.md) | Administrador | Activar o desactivar cuentas de usuario (`Activo` / `Inactivo`) en `UI21` aplicando borrado lógico. |
| **CU-35** | [CU-35 Gestionar espacios físicos](./CU35-Gestionar-espacios-fisicos.md) | Administrador | Consultar y modificar el estado operativo (`Activo`, `Mantenimiento`, `Inactivo`) y aforo máximo oficial (`242`, `100`, `36+1`) de los espacios físicos (`UI22`). |
| **CU-36** | [CU-36 Gestionar inventario de equipos de cómputo](./CU36-Gestionar-inventario-de-equipos-de-computo.md) | Administrador | Consultar y modificar el estado de los equipos de cómputo de un laboratorio (`UI23`), recalculando su capacidad operativa. |
| **CU-37** | [CU-37 Consultar y exportar bitácora histórica](./CU37-Consultar-y-exportar-bitacora-historica.md) | Administrador | Consultar, filtrar y exportar en formato CSV (`.csv`) los registros históricos de eventos y acciones del sistema (`UI20`). |
| **CU-38** | [CU-38 Gestionar estado de verificación de usuarios](./CU38-Gestionar-estado-de-verificacion-de-usuarios.md) | Subdirección / Administrador | Consultar solicitudes pendientes (`UI10`) y dictaminar la verificación (`Verificado` / `No verificado`) con constancia PDF en R2 (`UI31`) para Alumnos, Profesores y Empresas. |
