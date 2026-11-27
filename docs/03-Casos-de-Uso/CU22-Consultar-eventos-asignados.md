---
caso_de_uso: "CU-22"
nombre: "Consultar eventos asignados"
actor: "Personal de Logística"
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-22: Consultar eventos asignados

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:**

Permitir al personal de logística visualizar los eventos próximos en los que ha sido asignado para realizar la validación de acceso de los asistentes, facilitando la consulta de la información general de cada evento.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-22 Consultar eventos asignados** |
| **Autor** | Lorena Zuñiga Gonzalez. |
| **Actor** | Personal de Logística |
| **Propósito** | Permitir al personal de logística consultar los eventos próximos a los que ha sido asignado, con la finalidad de conocer los eventos en los que será responsable de validar el acceso de los asistentes. |
| **Entradas** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• Solicitud de consulta de eventos asignados.<br>• ID del evento seleccionado (opcional, para consultar sus detalles). |
| **Salidas** | • Pantalla **UI18** "Panel de Eventos Asignados".<br>• Acceso al panel de control operativo por subevento en **UI17** "Control de Acceso" (`/control-acceso/:idSubEvento`).<br>• Listado de eventos próximos asignados al personal de logística, mostrando información general como nombre del evento, fecha, horario y recinto.<br>• Mensaje informativo **MSG-I-18** "No existen eventos vinculados a este perfil.", cuando el usuario no tenga eventos asignados.<br>• Mensaje informativo **MSG-I-14** "No hay eventos disponibles, consulte más tarde.", cuando existan asignaciones anteriores, pero no haya eventos próximos disponibles. |
| **Precondiciones** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el CU-01 "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Personal de Logística. |
| **Postcondiciones** | • El sistema muestra el listado de eventos próximos asignados al actor o notifica que no existen eventos disponibles.<br>• El actor puede seleccionar un evento o subevento específico para consultar su detalle mediante `CU-05` (`UI05`) o pasar a **UI17** "Control de Acceso" (`CU-23`).<br>• La información de los eventos permanece sin modificaciones en la base de datos.<br>• La sesión del actor permanece activa. |
| **Errores** | Se mostrará el mensaje **MSG-E-08** "Error de conexión con la base de datos.", cuando el sistema no pueda recuperar la información de los eventos asignados debido a una falla de conexión. |
| **Tipo** | Primario para el actor Personal de Logística. |

**Trayectorias del caso de uso:**


### Trayectoria Principal

1. Selecciona la opción "Consultar eventos asignados" desde su panel principal.
2. Obtiene el identificador del usuario autenticado y consulta en la base de datos los eventos que tiene asignados como Personal de Logística. [Trayectoria B]
3. Verifica que existan eventos próximos asignados al actor y que estos no se encuentren cancelados. [Trayectoria A]
4. Ordena los eventos encontrados cronológicamente, del más próximo al más lejano.
5. Muestra la pantalla **UI18** "Panel de Eventos Asignados", presentando el listado de eventos con su nombre, fecha, horario y recinto correspondiente.
6. Visualiza los eventos asignados y puede seleccionar uno específico para consultar su información detallada. [Trayectoria C]

*Fin de la trayectoria.*


### Trayectoria alternativa A: Sin eventos próximos asignados

> **Condición:** Ocurre en el paso 3 de la trayectoria principal cuando el sistema determina que el actor no tiene eventos próximos asignados.

- **A-1.** Detecta que la consulta no ha devuelto eventos próximos disponibles para el usuario.
- **A-2.** Muestra la pantalla **UI18** "Panel de Eventos Asignados" sin registros y presenta el mensaje **MSG-I-18** "No existen eventos vinculados a este perfil.", cuando el actor no tenga ninguna asignación registrada, o el mensaje **MSG-I-14** "No hay eventos disponibles, consulte más tarde.", cuando sus eventos asignados anteriormente ya hayan concluido.
- **A-3.** Visualiza el mensaje informativo y finaliza la consulta.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Error de conexión con la base de datos

> **Condición:** Ocurre en el paso 2 de la trayectoria principal cuando el sistema no puede recuperar los eventos asignados debido a una falla de conexión con la base de datos.

- **B-1.** Detecta una falla de conexión con la base de datos al intentar recuperar la información de los eventos asignados al actor.
- **B-2.** Muestra el mensaje **MSG-E-08** "Error de conexión con la base de datos.", notificando al actor que no fue posible completar la consulta.
- **B-3.** Mantiene al actor en su panel principal, permitiéndole intentar nuevamente la consulta.

*Fin de la trayectoria.*


### Trayectoria alternativa C: Consultar detalles de un evento asignado

> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el actor selecciona un evento específico del listado para consultar su información detallada.

- **C-1.** Selecciona un evento del listado mostrado en la pantalla **UI18** "Panel de Eventos Asignados".
- **C-2.** Obtiene el identificador del evento seleccionado y ejecuta el CU-05 "Visualizar detalles del evento", para mostrar los detalles de un evento asignado.
- **C-3.** Muestra la pantalla **UI05** "Detalles del Evento" (o **UI17** "Control de Acceso" al ingresar al subevento asignado), de acuerdo con la trayectoria definida en el CU-05.
- *----- Continúa la ejecución del CU-05 "Visualizar detalles del evento".*
