---
caso_de_uso: "CU06"
nombre: "Consultar eventos aprobados"
actor: "Subdirección de Servicios Educativos"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU06: Consultar eventos aprobados

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al personal de Subdirección de Servicios Educativos consultar el listado de eventos que han sido aprobados dentro de la plataforma, proporcionando una visualización compacta de su información general y facilitando el acceso a las operaciones disponibles sobre dichos eventos.

### 📋 Ficha de Especificación

| Caso de uso | CU-06 Consultar eventos aprobados |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Moreno Ramirez Jose Jorge. |
| **Actor:** | Subdirección de Servicios Educativos. |
| **Propósito:** | Permitir al personal de Subdirección de Servicios Educativos visualizar y consultar los eventos que cuentan con el estatus "Aprobado", facilitando su identificación y el acceso a las operaciones correspondientes. |
| **Entradas:** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• Solicitud de consulta del listado de eventos aprobados.<br>• ID del evento seleccionado (opcional, para ejecutar operaciones adicionales). |
| **Salidas:** | • Pantalla `UI13` "Panel de Eventos Aprobados", mostrando el listado de eventos con estatus "Aprobado".<br>• Información general de los eventos aprobados, incluyendo nombre, fecha de realización, recinto y estado.<br>• Mensaje informativo `MSG-I-21` "No hay eventos aprobados registrados en este momento.", cuando no existan eventos que cumplan con el criterio de consulta. |
| **Precondiciones:** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Subdirección de Servicios Educativos. |
| **Postcondiciones:** | • El sistema muestra el listado de eventos aprobados o notifica que no existen eventos disponibles.<br>• El actor puede seleccionar un evento aprobado para ejecutar las operaciones de cancelación o incorporación de ponentes, conforme a los casos de uso correspondientes.<br>• La consulta no modifica el estado ni la información de los eventos almacenados en la base de datos.<br>• La sesión del actor permanece activa. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando el sistema no pueda recuperar la información de los eventos aprobados debido a una falla de conexión. |
| **Tipo:** | Primario para el actor Subdirección de Servicios Educativos. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Consultar eventos aprobados" desde la pantalla `UI25` "Menú Principal de Subdirección".
2. ⚙️ **[Sistema]** Consulta en la base de datos los eventos registrados con el estatus "Aprobado". `[Trayectoria B]`
3. ⚙️ **[Sistema]** Verifica la existencia de eventos que cumplan con el criterio de consulta. `[Trayectoria A]`
4. ⚙️ **[Sistema]** Muestra la pantalla `UI13` "Panel de Eventos Aprobados", presentando el listado de eventos encontrados junto con su información general.
5. 👤 **[Actor]** Visualiza el listado de eventos aprobados y consulta la información presentada. Puede seleccionar un evento específico para realizar operaciones adicionales. `[Trayectoria C]` `[Trayectoria D]`

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Sin eventos aprobados registrados
> **Condición:** Ocurre en el paso 3 de la trayectoria principal cuando el sistema determina que no existen eventos registrados con el estatus "Aprobado".
- **A-1.** ⚙️ **[Sistema]** Identifica que la consulta realizada no ha devuelto registros de eventos aprobados.
- **A-2.** ⚙️ **[Sistema]** Muestra la pantalla `UI13` "Panel de Eventos Aprobados" sin registros y presenta el mensaje `MSG-I-21` "No hay eventos aprobados registrados en este momento.".
- **A-3.** 👤 **[Actor]** Visualiza el mensaje informativo y finaliza la consulta.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Error de conexión con la base de datos
> **Condición:** Ocurre en el paso 2 de la trayectoria principal cuando el sistema no puede recuperar el listado de eventos aprobados debido a una falla de conexión con la base de datos.
- **B-1.** ⚙️ **[Sistema]** Detecta una falla de conexión con la base de datos al intentar recuperar la información de los eventos aprobados.
- **B-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos.", notificando al actor que no fue posible completar la consulta.
- **B-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI25` "Menú Principal de Subdirección", permitiéndole intentar realizar nuevamente la consulta.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Cancelar un evento aprobado
> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor selecciona un evento aprobado y solicita su cancelación.
- **C-1.** 👤 **[Actor]** Selecciona un evento específico del listado mostrado en la pantalla `UI13` "Panel de Eventos Aprobados".
- **C-2.** 👤 **[Actor]** Selecciona la opción `[Cancelar evento]` correspondiente al evento seleccionado.
- **C-3.** ⚙️ **[Sistema]** Obtiene el identificador del evento seleccionado y ejecuta el `CU-07` "Cancelar evento", conforme a la relación `<<extend>>` establecida en el diagrama.

*`----- Continúa la ejecución del CU-07 "Cancelar evento".`*

#### Trayectoria alternativa D: Agregar ponente a un evento aprobado
> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor selecciona un evento aprobado y solicita agregar un ponente.
- **D-1.** 👤 **[Actor]** Selecciona un evento específico del listado mostrado en la pantalla `UI13` "Panel de Eventos Aprobados".
- **D-2.** 👤 **[Actor]** Selecciona la opción `[Agregar ponente]` correspondiente al evento seleccionado.
- **D-3.** ⚙️ **[Sistema]** Obtiene el identificador del evento seleccionado y ejecuta el caso de uso `CU-08` "Agregar ponente", conforme a la relación `<<extend>>` establecida en el diagrama.
- **D-4.** ⚙️ **[Sistema]** Muestra la pantalla `UI29` "Agregar Ponente al Evento", conforme a la trayectoria definida en el caso de uso correspondiente.

*`----- Continúa la ejecución del caso de uso CU-08 "Agregar ponente".`*

