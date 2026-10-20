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

# 🗂️ Índice de Casos de Uso (`CU01` – `CU31`) — EventOS

> [!TIP] Consulta Modular para Desarrollo y Testing
> Cada Caso de Uso está documentado en su propia nota atómica con su tabla de atributos (Autor, Actor, Entradas, Salidas, Precondiciones, Postcondiciones, Errores) y sus trayectorias (Principal y Alternativas con distinción explícita entre pasos de 👤 **[Actor]** y ⚙️ **[Sistema]**).
>
> 🔗 **Hub del Proyecto:** [[00-Proyecto-EventOS]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

---

## Tabla General de Casos de Uso

| Código | Caso de Uso (Enlace) | Actor(es) | Propósito |
| :--- | :--- | :--- | :--- |
| **CU01** | [[CU01-Iniciar-sesion\|CU01 - Iniciar sesión]] | Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador. | Autenticar al usuario en el sistema para acceder a las funciones del sistema según sus permisos. |
| **CU02** | [[CU02-Consultar-solicitudes-de-eventos\|CU02 - Consultar solicitudes de eventos]] | Subdirección de Servicios Académicos | Permitir al personal de Subdirección de Servicios Académicos consultar el listado de las solicitudes de eventos pendientes de aprobación. |
| **CU03** | [[CU03-Consultar-datos-de-un-evento\|CU03 - Consultar datos de un evento]] | Subdirección de Servicios Académicos | Permitir al personal de Subdirección de Servicios Académicos consultar los datos de una solicitud específica para su evaluación. |
| **CU04** | [[CU04-Consultar-eventos-aprobados\|CU04 - Consultar eventos aprobados]] | Subdirección de Servicios Académicos | Permitir al personal de Subdirección de Servicios visualizar un listado de las solicitudes de eventos que se han aprobado. |
| **CU05** | [[CU05-Cancelar-evento\|CU05 - Cancelar evento]] | Subdirección de Servicios Educativos | Permitir la anulación de un evento de forma controlada, garantizando que los espacios físicos vuelvan a estar disponibles y que la comunidad sea informada adecuadamente. |
| **CU06** | [[CU06-Solicitar-un-evento\|CU06 - Solicitar un evento]] | Asistente, Subdirección de Servicios Educativos | Permitir al Asistente o a Subdirección de Servicios Educativos registrar una solicitud de evento; en el caso del Asistente queda pendiente de evaluación, mientras que si la registra Subdirección se aprueba automáticamente. |
| **CU07** | [[CU07-Cerrar-sesion\|CU07 - Cerrar sesión]] | Asistente, subdirección de servicios educativos, organizador, persona de logística o administrador (Cualquier usuario autenticado del sistema). | Permitir al actor finalizar su sesión de trabajo activa en la plataforma de forma segura. |
| **CU08** | [[CU08-Visualizar-Bitacora-de-Eventos-Realizados\|CU08 - Visualizar Bitácora de Eventos Realizados]] | Asistente. | Permitir al usuario consultar el historial completo y llevar un control de los eventos que ha organizado o realizados dentro del sistema. |
| **CU09** | [[CU09-Consultar-Cartelera-de-Eventos\|CU09 - Consultar Cartelera de Eventos]] | Asistente | Permitir a los asistentes ver qué eventos están disponibles. |
| **CU10** | [[CU10-Reservar-lugar-a-un-evento\|CU10 - Reservar lugar a un evento]] | Asistente | Permitir a los asistentes registrarse en un evento de su interés y obtener una entrada que le asegura un lugar en el evento. |
| **CU11** | [[CU11-Recibir-confirmacion-de-reserva-por-correo\|CU11 - Recibir confirmación de reserva por correo]] | Asistente | Permitir al asistente solicitar y recibir en su correo electrónico el comprobante de su reserva y su pase de acceso al evento. |
| **CU12** | [[CU12-Consultar-disponibilidad-de-lugares\|CU12 - Consultar disponibilidad de lugares]] | Asistente | Permitir al Asistente conocer la cantidad de lugares disponibles de un evento antes de iniciar o continuar con el proceso de reserva. |
| **CU13** | [[CU13-Generar-codigo-QR\|CU13 - Generar código QR]] | Asistente | Generar el código QR único asociado a la reserva confirmada del Asistente y permitir la emisión de su boleto digital para acceder al evento. |
| **CU14** | [[CU14-Consultar-sus-eventos\|CU14 - Consultar sus eventos]] | Asistente | Permitir al Asistente consultar los eventos en los que cuenta con una reserva, así como acceder a las opciones de cancelar su asistencia o visualizar el código QR de acceso correspondiente. |
| **CU15** | [[CU15-Cancelar-su-asistencia\|CU15 - Cancelar su asistencia]] | Asistente | Permitir al Asistente cancelar su reserva de lugar en un evento, liberando el cupo o lugar ocupado. |
| **CU16** | [[CU16-Visualizar-QR-de-acceso\|CU16 - Visualizar QR de acceso]] | Asistente | Permitir al Asistente visualizar el código QR de su boleto digital para presentarlo al personal de logística el día del evento. |
| **CU17** | [[CU17-Consultar-Eventos-Asignados\|CU17 - Consultar Eventos Asignados]] | Personal de Logística | Permitir al personal de logística visualizar los eventos próximos en los que tiene asignada la validación de acceso. |
| **CU18** | [[CU18-Visualizar-detalles-del-evento\|CU18 - Visualizar detalles del evento]] | Personal de Logística | Permitir al personal de logística visualizar los detalles de un evento del que validará el acceso |
| **CU19** | [[CU19-Escanear-QR\|CU19 - Escanear QR]] | Personal de Logística | Permitir al personal de logística escanear el código QR del asistente para permitir su acceso para un evento |
| **CU20** | [[CU20-Consultar-mis-eventos\|CU20 - Consultar mis eventos]] | Organizador | Listar los eventos creados por el usuario y servir como punto de partida para consultar su estado, modificar sus especificaciones, cancelarlos y/o emitir boletos directos. |
| **CU21** | [[CU21-Modificar-logistica-del-evento\|CU21 - Modificar logística del evento]] | Organizador | Actualizar la logística del evento, garantizando que los asistentes estén informados y que no existan empalmes de infraestructura y horario en la escuela. |
| **CU22** | [[CU22-Modificar-detalles-de-un-evento\|CU22 - Modificar detalles de un evento]] | Organizador | Permite al usuario modificar determinada especificación de sus eventos. |
| **CU23** | [[CU23-Actualizar-informacion-general-del-evento\|CU23 - Actualizar información general del evento]] | Organizador | Permitir al Organizador modificar el texto descriptivo, configurar la accesibilidad, y asignar o editar etiquetas temáticas y áreas de conocimiento del evento. |
| **CU24** | [[CU24-Solicitar-requerimientos-tecnicos\|CU24 - Solicitar requerimientos técnicos]] | Organizador | Registrar la cantidad de computadoras necesarias para el evento, garantizando que no se supere la capacidad instalada. |
| **CU25** | [[CU25-Cancelar-evento-propio\|CU25 - Cancelar evento propio]] | Organizador | Permitir al organizador la cancelación de un evento particular, ingresando una justificación de cancelación para ser notificada a los asistentes. |
| **CU26** | [[CU26-Emitir-boletos-directos\|CU26 - Emitir boletos directos]] | Organizador | Generar y asignar boletos directos para un evento controlando estrictamente el límite de asistencia por seguridad. |
| **CU27** | [[CU27-Asignar-personal-de-Logistica\|CU27 - Asignar personal de Logística]] | Organizador | Permitir al organizador buscar opciones entre los usuarios del sistema para asignarlos como parte del personal de logística de su evento ya agendado. |
| **CU28** | [[CU28-Cambiar-estatus-de-cuenta-de-usuario\|CU28 - Cambiar estatus de cuenta de usuario]] | Administrador | Cambiar el estatus de un usuario entre activo e inactivo en caso de que se requiera deshabilitar una cuenta. |
| **CU29** | [[CU29-Gestionar-Espacios-Fisicos-Administrador\|CU29 - Gestionar Espacios Físicos (Administrador)]] | Administrador | Mantener actualizado el catálogo general de recintos (Auditorio, Sala 14 y Laboratorios de Cómputo), controlando su aforo y estado operativo. |
| **CU30** | [[CU30-Gestionar-Inventario-de-Equipos-de-Computo-Administrador\|CU30 - Gestionar Inventario de Equipos de Cómputo (Administrador)]] | Administrador | Controlar la cantidad de equipos funcionales en cada laboratorio, lo cual determina el límite máximo de aforo para los eventos en esos espacios. |
| **CU31** | [[CU31-Consultar-y-Exportar-Bitacora-Historica\|CU31 - Consultar y Exportar Bitácora Histórica]] | Administrador | Consultar la trazabilidad de los eventos y acciones del sistema, y exportar la información para auditorías institucionales sin alterar los registros. |
