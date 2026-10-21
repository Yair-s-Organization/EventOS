---
caso_de_uso: "CU23"
nombre: "Visualizar detalles del evento"
actor: "Personal de Logística"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU23: Visualizar detalles del evento (extend CU-22)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU22-Consultar-eventos-asignados]] | **Extendido por:** [[CU24-Escanear-QR]]

### 📌 Resumen
Permitir al personal de logística consultar la información detallada de un evento al que haya sido asignado, con la finalidad de conocer sus características, fecha, horario y recinto donde realizará la validación de acceso de los asistentes.

### 📋 Ficha de Especificación

| Caso de uso | CU-23 Visualizar detalles del evento (extend CU-22) |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Lorena Zuñiga Gonzalez. |
| **Actor:** | Personal de Logística. |
| **Propósito:** | Permitir al personal de logística visualizar la información detallada de un evento asignado para conocer los datos necesarios para realizar sus actividades de validación de acceso. |
| **Entradas:** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• ID del evento seleccionado desde la pantalla `UI18` "Panel de Eventos Asignados".<br>• Solicitud de visualización de los detalles del evento. |
| **Salidas:** | • Pantalla `UI05` "Detalles del Evento".<br>• Información detallada del evento seleccionado, incluyendo nombre, descripción, fecha, horario, recinto y estado del evento.<br>• Opción para acceder a la función de escaneo de códigos QR correspondiente al `CU-24` "Escanear QR". |
| **Precondiciones:** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Personal de Logística.<br>• El evento seleccionado debe encontrarse vinculado al perfil del actor.<br>• El actor debe haber seleccionado un evento desde la pantalla `UI18` "Panel de Eventos Asignados", mediante el `CU-22` "Consultar eventos asignados". |
| **Postcondiciones:** | • El actor visualiza la información detallada del evento seleccionado.<br>• El actor puede acceder a la función de escaneo de códigos QR mediante el `CU-24` "Escanear QR", cuando corresponda.<br>• La información del evento permanece sin modificaciones en la base de datos.<br>• La sesión del actor permanece activa. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando el sistema no pueda recuperar la información del evento seleccionado.<br>• Se mostrará el mensaje `MSG-E-06` "Evento no encontrado o cancelado.", cuando el evento seleccionado no exista o haya sido cancelado.<br>• Se mostrará el mensaje `MSG-E-41` "No tiene autorización para consultar este evento porque no se encuentra asignado a él.", cuando el actor intente acceder a un evento que no se encuentre vinculado a su perfil. |
| **Tipo:** | Secundario para el actor Personal de Logística (extend de `CU-22`). |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona un evento específico desde la pantalla `UI18` "Panel de Eventos Asignados".
2. ⚙️ **[Sistema]** Obtiene el identificador del evento seleccionado y consulta en la base de datos su información, verificando que se encuentre asignado al actor. `[Trayectoria A]` `[Trayectoria B]`
3. ⚙️ **[Sistema]** Verifica que el evento exista y no se encuentre cancelado. `[Trayectoria C]`
4. ⚙️ **[Sistema]** Muestra la pantalla `UI05` "Detalles del Evento", presentando su nombre, descripción, fecha, horario, recinto y estado actual.
5. 👤 **[Actor]** Visualiza la información detallada del evento y puede seleccionar la opción `[Escanear QR]` para realizar la validación de acceso de los asistentes. `[Trayectoria D]`

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Evento no asignado al usuario
> **Condición:** Ocurre en el paso 2 de la trayectoria principal cuando el sistema detecta que el evento seleccionado no se encuentra vinculado al perfil del actor.
- **A-1.** ⚙️ **[Sistema]** Detecta que el evento seleccionado no se encuentra asociado al usuario autenticado.
- **A-2.** ⚙️ **[Sistema]** Impide el acceso a la información detallada del evento y muestra el mensaje `MSG-E-41` "No tiene autorización para consultar este evento porque no se encuentra asignado a él.".
- **A-3.** ⚙️ **[Sistema]** Redirige al actor a la pantalla `UI18` "Panel de Eventos Asignados".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Error de conexión con la base de datos
> **Condición:** Ocurre en el paso 2 de la trayectoria principal cuando el sistema no puede recuperar la información del evento seleccionado debido a una falla de conexión con la base de datos.
- **B-1.** ⚙️ **[Sistema]** Detecta una falla de conexión con la base de datos al intentar consultar la información del evento seleccionado.
- **B-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos.", notificando al actor que no fue posible completar la consulta.
- **B-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI18` "Panel de Eventos Asignados", permitiéndole intentar nuevamente la consulta.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Evento no encontrado o cancelado
> **Condición:** Ocurre en el paso 3 de la trayectoria principal cuando el sistema identifica que el evento seleccionado no existe o ha sido cancelado.
- **C-1.** ⚙️ **[Sistema]** Detecta que el evento seleccionado no se encuentra disponible debido a que fue cancelado o no existe en la base de datos.
- **C-2.** ⚙️ **[Sistema]** Impide continuar con la consulta y muestra el mensaje `MSG-E-06` "Evento no encontrado o cancelado.".
- **C-3.** ⚙️ **[Sistema]** Regresa al actor a la pantalla `UI18` "Panel de Eventos Asignados", actualizando el listado de eventos disponibles.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Escanear código QR de un asistente
> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor selecciona la opción `[Escanear QR]` para validar el acceso de los asistentes al evento.
- **D-1.** 👤 **[Actor]** Selecciona la opción `[Escanear QR]` desde la pantalla `UI05` "Detalles del Evento".
- **D-2.** ⚙️ **[Sistema]** Obtiene el identificador del evento seleccionado y ejecuta el `CU-24` "Escanear QR", conforme a la relación `<<extend>>` establecida en el diagrama.
- **D-3.** ⚙️ **[Sistema]** Muestra la pantalla `UI19` "Pantalla de Escáner QR", de acuerdo con la trayectoria definida en el `CU-24`.

*`----- Continúa la ejecución del CU-24 "Escanear QR".`*

