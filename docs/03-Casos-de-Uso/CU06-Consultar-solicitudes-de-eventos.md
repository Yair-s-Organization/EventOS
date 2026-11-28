---
caso_de_uso: "CU-06"
nombre: "Consultar solicitudes de eventos"
actor: "Subdirección de Servicios Educativo"
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-06: Consultar solicitudes de eventos

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** Permitir al personal de Subdirección de Servicios Educativos consultar el listado de solicitudes de eventos que se encuentran pendientes de aprobación dentro de la plataforma, con la finalidad de conocer los eventos que requieren ser evaluados.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-06 Consultar solicitudes de eventos** |
| **Autor** | Marcial Jiménez Victor Ariel. |
| **Actor** | Subdirección de Servicios Educativo |
| **Propósito** | Permitir al personal de Subdirección de Servicios Educativos consultar las solicitudes de eventos pendientes de aprobación, facilitando la identificación y selección de aquellas que requieren una evaluación. |
| **Entradas** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• Solicitud de consulta de eventos pendientes de aprobación.<br>• ID de la solicitud del evento seleccionado (opcional, para ejecutar el CU-07). |
| **Salidas** | • Pantalla **UI11** "Panel de Solicitudes Pendientes".<br>• Listado de solicitudes de eventos con estatus "Pendiente de aprobación", mostrando la información general de cada solicitud.<br>• Mensaje informativo **MSG-I-01** "No hay solicitudes pendientes de aprobación en este momento.", cuando no existan solicitudes que cumplan con el criterio de consulta.<br>• Modal de Solicitud de Cambios (subcomponente de **UI12**) y envío de observaciones al solicitante u Organizador cuando se active la trayectoria alternativa C. |
| **Precondiciones** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el CU-01 "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Subdirección de Servicios Educativos. |
| **Postcondiciones** | • El sistema muestra el listado de solicitudes de eventos pendientes de aprobación o notifica que no existen solicitudes disponibles.<br>• El actor puede seleccionar una solicitud para consultar su información detallada mediante el CU-07 "Consultar datos de un evento".<br>• La sesión del actor permanece activa.<br>• La consulta del listado no modifica los registros; si se ejecuta la trayectoria alternativa C, la solicitud pasa a "En Revisión / Cambios Solicitados".<br>• En la trayectoria alternativa C, se registran las observaciones y se notifica su contenido por correo electrónico al solicitante u Organizador. |
| **Errores** | Se mostrará el mensaje **MSG-E-08** "Error de conexión con la base de datos.", cuando el sistema no pueda recuperar el listado de solicitudes debido a una falla de conexión. |
| **Tipo** | Primario para el actor Subdirección de Servicios Educativos. |


### Trayectoria Principal

1. Selecciona la opción "Consultar solicitudes de eventos" desde la pantalla UI25 "Menú Principal de Subdirección".
2. Consulta en la base de datos las solicitudes de eventos que se encuentran registradas con el estatus "Pendiente de aprobación". [Trayectoria B]
3. Verifica la existencia de solicitudes de eventos pendientes de aprobación. [Trayectoria A]
4. Muestra la pantalla **UI11** "Panel de Solicitudes Pendientes", presentando el listado de solicitudes encontradas con su información general, destacando en primer lugar con un distintivo visual aquellas catalogadas con prioridad urgente (`esUrgente = true`).
5. Visualiza el listado de solicitudes pendientes de aprobación y puede seleccionar una solicitud específica para consultar su información detallada. [Trayectoria D] [Trayectoria C]

*Fin de la trayectoria.*


### Trayectoria alternativa A: Sin solicitudes pendientes de aprobación

> **Condición**: Ocurre en el paso 3 de la trayectoria principal cuando el sistema determina que no existen solicitudes de eventos con el estatus "Pendiente de aprobación".

- **A-1.** Identifica que la consulta no ha devuelto solicitudes de eventos pendientes de aprobación.
- **A-2.** Muestra la pantalla **UI11** "Panel de Solicitudes Pendientes" sin registros y presenta el mensaje **MSG-I-01** "No hay solicitudes pendientes de aprobación en este momento.".
- **A-3.** Visualiza el mensaje informativo y finaliza la consulta.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Error de conexión con la base de datos

> **Condición:** Ocurre en el paso 2 de la trayectoria principal cuando el sistema no puede recuperar las solicitudes de eventos pendientes de aprobación debido a una falla de conexión con la base de datos.

- **B-1.** Detecta una falla de conexión con la base de datos al intentar recuperar las solicitudes de eventos pendientes de aprobación.
- **B-2.** Muestra el mensaje **MSG-E-08** "Error de conexión con la base de datos.", notificando al actor que no fue posible completar la consulta.
- **B-3.** Mantiene al actor en la pantalla UI25 "Menú Principal de Subdirección", permitiéndole intentar realizar nuevamente la consulta.

*Fin de la trayectoria.*


### Trayectoria alternativa C: Solicitar Cambios

> **Condición:** Ocurre después del paso 5 de la trayectoria principal cuando Subdirección revisa una solicitud pendiente y detecta traslapes, mantenimiento del recinto o ajustes de horario, `cupoMaximo` (`RN-07`) u otros aspectos técnicos que deben atenderse antes de aprobarla o rechazarla.

- **C-1.** El actor selecciona la solicitud desde **UI11** "Panel de Solicitudes Pendientes" y consulta sus detalles mediante el CU-07 "Consultar datos de un evento", en **UI12** "Detalles del Evento para Evaluación".
- **C-2.** Selecciona la opción [Solicitar Cambios]. El sistema muestra el modal de Solicitud de Cambios (subcomponente de **UI12**), con un campo obligatorio para registrar las observaciones técnicas y las modificaciones requeridas.
- **C-3.** El actor redacta las observaciones y selecciona [Enviar Observaciones]. El sistema valida que el campo no esté vacío y que la solicitud continúe pendiente de evaluación.
- **C-4.** El sistema actualiza el estado a "En Revisión / Cambios Solicitados" y envía un correo electrónico al solicitante u Organizador con las observaciones detalladas, sin aprobar ni rechazar el evento.
- **C-5.** El sistema actualiza **UI11** "Panel de Solicitudes Pendientes" para reflejar que la solicitud ya no está pendiente de dictamen.

*Fin de la trayectoria.*


### Trayectoria alternativa D: Consultar datos de una solicitud específica

> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor selecciona una solicitud de evento específica del listado para consultar su información detallada.

- **D-1.** Selecciona una solicitud de evento del listado mostrado en la pantalla **UI11** "Panel de Solicitudes Pendientes".
- **D-2.** Obtiene el identificador de la solicitud seleccionada y ejecuta el CU-07 "Consultar datos de un evento", correspondiente a la relación `<<extend>>` establecida en el diagrama.
- **D-3.** Muestra la pantalla **UI12** "Detalles del Evento para Evaluación", conforme a la trayectoria definida en el CU-07.
- *----- Continúa la ejecución del CU-07 "Consultar datos de un evento".*
