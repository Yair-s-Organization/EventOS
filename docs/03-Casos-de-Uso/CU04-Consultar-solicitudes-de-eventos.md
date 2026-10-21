---
caso_de_uso: "CU04"
nombre: "Consultar solicitudes de eventos"
actor: "Subdirección de Servicios Educativos"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU04: Consultar solicitudes de eventos

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al personal de Subdirección de Servicios Educativos consultar el listado de solicitudes de eventos que se encuentran pendientes de aprobación dentro de la plataforma, con la finalidad de conocer los eventos que requieren ser evaluados.

### 📋 Ficha de Especificación

| Caso de uso | CU-04 Consultar solicitudes de eventos |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Marcial Jiménez Victor Ariel. |
| **Actor:** | Subdirección de Servicios Educativos. |
| **Propósito:** | Permitir al personal de Subdirección de Servicios Educativos consultar las solicitudes de eventos pendientes de aprobación, facilitando la identificación y selección de aquellas que requieren una evaluación. |
| **Entradas:** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• Solicitud de consulta de eventos pendientes de aprobación.<br>• ID de la solicitud del evento seleccionado (opcional, para ejecutar el `CU-05`). |
| **Salidas:** | • Pantalla `UI11` "Panel de Solicitudes Pendientes".<br>• Listado de solicitudes de eventos con estatus "Pendiente de aprobación", mostrando la información general de cada solicitud.<br>• Mensaje informativo `MSG-I-01` "No hay solicitudes pendientes de aprobación en este momento.", cuando no existan solicitudes que cumplan con el criterio de consulta. |
| **Precondiciones:** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Subdirección de Servicios Educativos. |
| **Postcondiciones:** | • El sistema muestra el listado de solicitudes de eventos pendientes de aprobación o notifica que no existen solicitudes disponibles.<br>• El actor puede seleccionar una solicitud para consultar su información detallada mediante el `CU-05` "Consultar datos de un evento".<br>• La sesión del actor permanece activa.<br>• No se modifica el estado de las solicitudes ni la información almacenada en la base de datos. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando el sistema no pueda recuperar el listado de solicitudes debido a una falla de conexión. |
| **Tipo:** | Primario para el actor Subdirección de Servicios Educativos. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Consultar solicitudes de eventos" desde la pantalla `UI25` "Menú Principal de Subdirección".
2. ⚙️ **[Sistema]** Consulta en la base de datos las solicitudes de eventos que se encuentran registradas con el estatus "Pendiente de aprobación". `[Trayectoria B]`
3. ⚙️ **[Sistema]** Verifica la existencia de solicitudes de eventos pendientes de aprobación. `[Trayectoria A]`
4. ⚙️ **[Sistema]** Muestra la pantalla `UI11` "Panel de Solicitudes Pendientes", presentando el listado de solicitudes encontradas con su información general.
5. 👤 **[Actor]** Visualiza el listado de solicitudes pendientes de aprobación y puede seleccionar una solicitud específica para consultar su información detallada. `[Trayectoria C]`

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Sin solicitudes pendientes de aprobación
> **Condición:** Ocurre en el paso 3 de la trayectoria principal cuando el sistema determina que no existen solicitudes de eventos con el estatus "Pendiente de aprobación".
- **A-1.** ⚙️ **[Sistema]** Identifica que la consulta no ha devuelto solicitudes de eventos pendientes de aprobación.
- **A-2.** ⚙️ **[Sistema]** Muestra la pantalla `UI11` "Panel de Solicitudes Pendientes" sin registros y presenta el mensaje `MSG-I-01` "No hay solicitudes pendientes de aprobación en este momento.".
- **A-3.** 👤 **[Actor]** Visualiza el mensaje informativo y finaliza la consulta.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Error de conexión con la base de datos
> **Condición:** Ocurre en el paso 2 de la trayectoria principal cuando el sistema no puede recuperar las solicitudes de eventos pendientes de aprobación debido a una falla de conexión con la base de datos.
- **B-1.** ⚙️ **[Sistema]** Detecta una falla de conexión con la base de datos al intentar recuperar las solicitudes de eventos pendientes de aprobación.
- **B-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos.", notificando al actor que no fue posible completar la consulta.
- **B-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI25` "Menú Principal de Subdirección", permitiéndole intentar realizar nuevamente la consulta.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Consultar datos de una solicitud específica
> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor selecciona una solicitud de evento específica del listado para consultar su información detallada.
- **C-1.** 👤 **[Actor]** Selecciona una solicitud de evento del listado mostrado en la pantalla `UI11` "Panel de Solicitudes Pendientes".
- **C-2.** ⚙️ **[Sistema]** Obtiene el identificador de la solicitud seleccionada y ejecuta el `CU-05` "Consultar datos de un evento", correspondiente a la relación `<<extend>>` establecida en el diagrama.
- **C-3.** ⚙️ **[Sistema]** Muestra la pantalla `UI12` "Detalles del Evento para Evaluación", conforme a la trayectoria definida en el `CU-05`.

*`----- Continúa la ejecución del CU-05 "Consultar datos de un evento".`*

