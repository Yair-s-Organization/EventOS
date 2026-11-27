---
caso_de_uso: "CU-36"
nombre: "Gestionar inventario de equipos de cómputo"
actor: "Administrador"
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-36: Gestionar inventario de equipos de cómputo

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:**

Permitir al Administrador consultar y modificar el estado de los equipos de cómputo registrados en los laboratorios de la Escuela Superior de Cómputo (ESCOM), mediante una representación visual de su inventario. Los equipos podrán cambiar su estado entre Activo, Inactivo y Mantenimiento, actualizando automáticamente la capacidad operativa del laboratorio.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-36 Gestionar inventario de equipos de cómputo** |
| **Autor** | Zempoalteca Salinas Enrique |
| **Actor** | Administrador |
| **Propósito** | Permitir al Administrador controlar el estado operativo de los equipos de cómputo existentes en cada laboratorio (`2104`–`2107`, dotación estándar de **36 equipos de alumno reservables + 1 estación de docente**), manteniendo actualizada la cantidad de equipos funcionales y el techo operativo `min(cupoMaximo, equiposFuncionales)` (`RN-07`, `RN-18`) para la realización de eventos. |
| **Entradas** | • ID del Administrador autenticado, obtenido de la sesión activa.<br>• ID del laboratorio seleccionado.<br>• ID del equipo de cómputo que se desea modificar.<br>• Nuevo estado del equipo: Activo, Inactivo o Mantenimiento. |
| **Salidas** | • Pantalla **UI23** "Gestión de Equipos de Laboratorio".<br>• Representación visual de los equipos registrados en el laboratorio, mostrando su estado actual.<br>• Mensaje informativo **MSG-I-08** "Operación realizada con éxito.", cuando se actualice correctamente el estado del equipo.<br>• Actualización visual del estado del equipo seleccionado.<br>• Recálculo automático de la cantidad de equipos funcionales y de la capacidad operativa del laboratorio. |
| **Precondiciones** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el CU-01 "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Administrador.<br>• El laboratorio seleccionado debe encontrarse registrado en la base de datos.<br>• El equipo que se desea modificar debe pertenecer al laboratorio seleccionado. |
| **Postcondiciones** | • El estado del equipo seleccionado se actualiza correctamente en la base de datos.<br>• La representación visual del inventario muestra el nuevo estado del equipo.<br>• El sistema recalcula la cantidad de equipos funcionales del laboratorio.<br>• Los equipos con estado "Inactivo" o "Mantenimiento" dejan de considerarse disponibles para la realización de actividades que requieran su utilización.<br>• Si la cantidad de equipos funcionales disminuye, el sistema verifica si existen eventos aprobados que podrían verse afectados.<br>• Los eventos previamente aprobados no se cancelan automáticamente al modificar el estado de un equipo.<br>• Si el Administrador cancela la operación, el estado del equipo permanece sin modificaciones.<br>• La sesión del Administrador permanece activa. |
| **Errores** | Se mostrará el mensaje **MSG-E-08** "Error de conexión con la base de datos.", cuando el sistema no pueda recuperar la información del inventario.<br>Se mostrará el mensaje **MSG-E-19** "Operación fallida al intentar actualizar el estado del equipo.", cuando no sea posible guardar el cambio de estado solicitado. |
| **Tipo** | Primario para el actor Administrador. |

**Trayectorias del caso de uso:**


### Trayectoria Principal

1. Accede a la pantalla **UI22** "Panel de Gestión de Espacios Físicos" y selecciona el laboratorio de cómputo cuyo inventario desea consultar.
2. Selecciona la opción [Gestionar inventario] correspondiente al laboratorio seleccionado.
3. Consulta en la base de datos los equipos de cómputo registrados en el laboratorio y sus estados actuales. [Trayectoria B]
4. Muestra la pantalla **UI23** "Gestión de Equipos de Laboratorio", presentando una representación visual de los equipos y su estado operativo.
5. Selecciona el equipo de cómputo que desea modificar.
6. Muestra el estado actual del equipo y permite seleccionar entre las opciones "Activo", "Inactivo" o "Mantenimiento".
7. Selecciona el nuevo estado del equipo y presiona el botón [Guardar cambios]. [Trayectoria A]
8. Actualiza en la base de datos el estado del equipo seleccionado. [Trayectoria B]
9. Recalcula la cantidad de equipos funcionales del laboratorio y verifica si la nueva capacidad operativa afecta a los eventos previamente aprobados. [Trayectoria C]
10. Muestra el mensaje **MSG-I-08** "Operación realizada con éxito.", confirmando que el estado del equipo fue actualizado.
11. Actualiza la representación visual del equipo y la capacidad operativa mostrada en la pantalla **UI23** "Gestión de Equipos de Laboratorio".
12. Visualiza los cambios realizados y finaliza la operación.

*Fin de la trayectoria.*


### Trayectoria alternativa A: Cancelar la modificación del equipo

> **Condición:** Ocurre en el paso 7 de la trayectoria principal cuando el Administrador decide abandonar la modificación sin guardar los cambios.

- **A-1.** Selecciona la opción [Cancelar] en lugar de guardar el nuevo estado del equipo.
- **A-2.** Interrumpe la operación sin modificar la información del equipo en la base de datos.
- **A-3.** Mantiene al Administrador en la pantalla **UI23** "Gestión de Equipos de Laboratorio", mostrando el estado original del equipo seleccionado.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Error de conexión o actualización de la base de datos

> **Condición:** Ocurre en los pasos 3 o 8 de la trayectoria principal cuando el sistema presenta una falla al consultar el inventario o guardar el estado del equipo.

- **B-1.** Detecta un error al intentar consultar la información del laboratorio o actualizar el estado del equipo seleccionado.
- **B-2.** Muestra el mensaje **MSG-E-08** "Error de conexión con la base de datos.", cuando no puede recuperar el inventario, o el mensaje **MSG-E-19** "Operación fallida al intentar actualizar el estado del equipo.", cuando no es posible completar la modificación solicitada.
- **B-3.** No presenta la modificación como exitosa mientras no pueda comprobar que fue registrada correctamente.
- **B-4.** Mantiene al Administrador en la pantalla **UI23** "Gestión de Equipos de Laboratorio", cuando esta se encuentre disponible, permitiéndole intentar nuevamente la operación después de consultar el estado actual del equipo.

*Fin de la trayectoria.*


### Trayectoria alternativa C: Disminución de la capacidad operativa del laboratorio

> **Condición:** Ocurre en el paso 9 de la trayectoria principal cuando el Administrador cambia el estado de un equipo a "Inactivo" o "Mantenimiento" y la disminución de equipos funcionales afecta la capacidad requerida por eventos previamente aprobados.

- **C-1.** Detecta que la cantidad de equipos funcionales del laboratorio ha disminuido y que existen eventos aprobados que podrían verse afectados por el cambio.
- **C-2.** Conserva el nuevo estado del equipo y la capacidad operativa actualizada, sin cancelar automáticamente los eventos previamente aprobados.
- **C-3.** Muestra el mensaje **MSG-I-25** "La capacidad operativa del laboratorio ha disminuido. Existen eventos aprobados que requieren revisión.".
- **C-4.** Mantiene al Administrador en la pantalla **UI23** "Gestión de Equipos de Laboratorio", permitiéndole consultar la información actualizada.
- **C-5.** Retoma la ejecución desde el paso 11 de la trayectoria principal.

*Fin de la trayectoria.*
