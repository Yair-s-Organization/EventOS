---
caso_de_uso: "CU22"
nombre: "Consultar eventos asignados"
actor: "Personal de Logística"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU22: Consultar eventos asignados

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extendido por:** [[CU23-Visualizar-detalles-del-evento]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al personal de logística visualizar los eventos próximos en los que ha sido asignado para realizar la validación de acceso de los asistentes, facilitando la consulta de la información general de cada evento.

### 📋 Ficha de Especificación

| Caso de uso | CU-22 Consultar eventos asignados |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Lorena Zuñiga Gonzalez. |
| **Actor:** | Personal de Logística. |
| **Propósito:** | Permitir al personal de logística consultar los eventos próximos a los que ha sido asignado, con la finalidad de conocer los eventos en los que será responsable de validar el acceso de los asistentes. |
| **Entradas:** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• Solicitud de consulta de eventos asignados.<br>• ID del evento seleccionado (opcional, para consultar sus detalles). |
| **Salidas:** | • Pantalla `UI18` "Panel de Eventos Asignados".<br>• Listado de eventos próximos asignados al personal de logística, mostrando información general como nombre del evento, fecha, horario y recinto.<br>• Mensaje informativo `MSG-I-18` "No existen eventos vinculados a este perfil.", cuando el usuario no tenga eventos asignados.<br>• Mensaje informativo `MSG-I-14` "No hay eventos disponibles, consulte más tarde.", cuando existan asignaciones anteriores, pero no haya eventos próximos disponibles. |
| **Precondiciones:** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Personal de Logística. |
| **Postcondiciones:** | • El sistema muestra el listado de eventos próximos asignados al actor o notifica que no existen eventos disponibles.<br>• El actor puede seleccionar un evento específico para consultar su información detallada mediante el `CU-23` "Visualizar detalles del evento".<br>• La información de los eventos permanece sin modificaciones en la base de datos.<br>• La sesión del actor permanece activa. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando el sistema no pueda recuperar la información de los eventos asignados debido a una falla de conexión. |
| **Tipo:** | Primario para el actor Personal de Logística. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Consultar eventos asignados" desde su panel principal.
2. ⚙️ **[Sistema]** Obtiene el identificador del usuario autenticado y consulta en la base de datos los eventos que tiene asignados como Personal de Logística. `[Trayectoria B]`
3. ⚙️ **[Sistema]** Verifica que existan eventos próximos asignados al actor y que estos no se encuentren cancelados. `[Trayectoria A]`
4. ⚙️ **[Sistema]** Ordena los eventos encontrados cronológicamente, del más próximo al más lejano.
5. ⚙️ **[Sistema]** Muestra la pantalla `UI18` "Panel de Eventos Asignados", presentando el listado de eventos con su nombre, fecha, horario y recinto correspondiente.
6. 👤 **[Actor]** Visualiza los eventos asignados y puede seleccionar uno específico para consultar su información detallada. `[Trayectoria C]`

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Sin eventos próximos asignados
> **Condición:** Ocurre en el paso 3 de la trayectoria principal cuando el sistema determina que el actor no tiene eventos próximos asignados.
- **A-1.** ⚙️ **[Sistema]** Detecta que la consulta no ha devuelto eventos próximos disponibles para el usuario.
- **A-2.** ⚙️ **[Sistema]** Muestra la pantalla `UI18` "Panel de Eventos Asignados" sin registros y presenta el mensaje `MSG-I-18` "No existen eventos vinculados a este perfil.", cuando el actor no tenga ninguna asignación registrada, o el mensaje `MSG-I-14` "No hay eventos disponibles, consulte más tarde.", cuando sus eventos asignados anteriormente ya hayan concluido.
- **A-3.** 👤 **[Actor]** Visualiza el mensaje informativo y finaliza la consulta.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Error de conexión con la base de datos
> **Condición:** Ocurre en el paso 2 de la trayectoria principal cuando el sistema no puede recuperar los eventos asignados debido a una falla de conexión con la base de datos.
- **B-1.** ⚙️ **[Sistema]** Detecta una falla de conexión con la base de datos al intentar recuperar la información de los eventos asignados al actor.
- **B-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos.", notificando al actor que no fue posible completar la consulta.
- **B-3.** ⚙️ **[Sistema]** Mantiene al actor en su panel principal, permitiéndole intentar nuevamente la consulta.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Consultar detalles de un evento asignado
> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el actor selecciona un evento específico del listado para consultar su información detallada.
- **C-1.** 👤 **[Actor]** Selecciona un evento del listado mostrado en la pantalla `UI18` "Panel de Eventos Asignados".
- **C-2.** ⚙️ **[Sistema]** Obtiene el identificador del evento seleccionado y ejecuta el `CU-23` "Visualizar detalles del evento", conforme a la relación `<<extend>>` establecida en el diagrama.
- **C-3.** ⚙️ **[Sistema]** Muestra la pantalla `UI05` "Detalles del Evento", de acuerdo con la trayectoria definida en el `CU-23`.

*`----- Continúa la ejecución del CU-23 "Visualizar detalles del evento".`*

