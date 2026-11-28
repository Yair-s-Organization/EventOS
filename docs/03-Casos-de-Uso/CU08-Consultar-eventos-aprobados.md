---
caso_de_uso: "CU-08"
nombre: "Consultar eventos aprobados"
actor: "Subdirección de Servicios Educativos."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-08: Consultar eventos aprobados

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** Permitir al personal de Subdirección de Servicios Educativos consultar el listado de eventos que han sido aprobados dentro de la plataforma, proporcionando una visualización compacta de su información general y facilitando el acceso a las operaciones disponibles sobre dichos eventos.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-08 Consultar eventos aprobados** |
| **Autor** | Moreno Ramirez Jose Jorge. |
| **Actor** | Subdirección de Servicios Educativos. |
| **Propósito** | Permitir al personal de Subdirección de Servicios Educativos visualizar y consultar los eventos que cuentan con el estatus "Aprobado", facilitando su identificación y el acceso a las operaciones correspondientes. |
| **Entradas** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• Solicitud de consulta del listado de eventos aprobados.<br>• ID del evento seleccionado para ver detalle o cancelar (opcional).<br>• Texto de búsqueda ingresado por el actor (opcional, por nombre del evento o responsable).<br>• Filtro de recinto seleccionado (opcional: Auditorio, Sala 14, Labs). |
| **Salidas** | • Pantalla **UI13** "Panel de Eventos Aprobados", presentando la tabla interactiva de eventos aprobados con buscador.<br>• Tabla con Folio, Evento, Responsable, Recinto, Fecha, `cupoMaximo` / aforo físico y Horario; filtros por nombre, responsable y recinto.<br>• Mensaje informativo **MSG-I-21** "No hay eventos aprobados registrados en este momento.", cuando no existan eventos que cumplan con el criterio de consulta.<br>• Modal de Detalle del Evento, con sinopsis, ponentes y requerimientos técnicos.<br>• Mensaje **MSG-I-22**: "No se encontraron eventos que coincidan con el criterio de búsqueda." |
| **Precondiciones** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el CU-01 "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Subdirección de Servicios Educativos. |
| **Postcondiciones** | • El sistema muestra el listado de eventos aprobados o notifica que no existen eventos disponibles.<br>• El actor puede seleccionar un evento aprobado para ejecutar las operaciones de cancelación o incorporación de ponentes, conforme a los casos de uso correspondientes.<br>• La consulta no modifica el estado ni la información de los eventos almacenados en la base de datos.<br>• La sesión del actor permanece activa. |
| **Errores** | Se mostrará el mensaje **MSG-E-08** "Error de conexión con la base de datos.", cuando el sistema no pueda recuperar la información de los eventos aprobados debido a una falla de conexión. |
| **Tipo** | Primario para el actor Subdirección de Servicios Educativos. |


### Trayectoria Principal

1. selecciona la opción "Eventos Aprobados" disponible en la barra de navegación superior (Navbar).
2. consulta en la base de datos todos los eventos registrados con el estatus "Aprobado". [Trayectoria B: Error de conexión]
3. verifica la existencia de registros. [Trayectoria A: Sin eventos aprobados]
4. despliega la pantalla **UI13** "Panel de Eventos Aprobados", presentando la tabla de control con las columnas: Folio, Evento, Responsable, Recinto, Fecha y Horario, junto con la barra de búsqueda y filtros.
5. puede interactuar con el listado:
   a) Si ingresa texto en el buscador o selecciona un recinto: El sistema filtra reactivamente las filas de la tabla en pantalla. [Trayectoria E: Búsqueda sin coincidencias]
   b) Si selecciona el botón [Ver detalles] de una fila: El sistema despliega el Modal de Detalle del Evento mostrando la ficha técnica y logística.
   c) Si selecciona el botón [Cancelar] de una fila: El sistema ejecuta el punto de extensión hacia el CU-09 "Cancelar evento". [Trayectoria C]
6. consulta la información requerida y finaliza la sesión o navega a otra interfaz desde el Navbar.

*Fin de la trayectoria.*


### Trayectoria alternativa A: Sin eventos aprobados registrados

> **Condición: Ocurre en el paso 3 de la trayectoria principal cuando el sistema determina que no existen eventos registrados con el estatus "Aprobado".**

- **A-1.** Identifica que la consulta realizada no ha devuelto registros de eventos aprobados.
- **A-2.** Muestra la pantalla **UI13** "Panel de Eventos Aprobados" sin registros y presenta el mensaje **MSG-I-21** "No hay eventos aprobados registrados en este momento.".
- **A-3.** Visualiza el mensaje informativo y finaliza la consulta.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Error de conexión con la base de datos

> **Condición:** Ocurre en el paso 2 de la trayectoria principal cuando el sistema no puede recuperar el listado de eventos aprobados debido a una falla de conexión con la base de datos.

- **B-1.** Detecta una falla de conexión con la base de datos al intentar recuperar la información de los eventos aprobados.
- **B-2.** Muestra el mensaje **MSG-E-08** "Error de conexión con la base de datos.", notificando al actor que no fue posible completar la consulta.
- **B-3.** Mantiene al actor en la pantalla **UI25** "Menú Principal de Subdirección", permitiéndole intentar realizar nuevamente la consulta.

*Fin de la trayectoria.*


### Trayectoria alternativa C: Cancelar un evento aprobado

> **Condición: Ocurre en el paso 5c cuando el actor presiona el botón [Cancelar] en la fila de un evento.**

- **C-1.** captura el identificador del evento seleccionado.
- **C-2.** Se transfiere el control y los datos al CU-09 "Cancelar evento" bajo la relación `<<extend>>`.
- *----- Continúa la ejecución del CU-09 "Cancelar evento".*

### Trayectoria alternativa D: Agregar ponente a un evento aprobado

> **Condición: Ocurre cuando el actor selecciona [Agregar ponente] para un evento aprobado desde UI13, conforme al CU-10.**

- **D-1.** Selecciona un evento específico del listado mostrado en la pantalla **UI13** "Panel de Eventos Aprobados".
- **D-2.** Selecciona la opción [Agregar ponente] correspondiente al evento seleccionado.
- **D-3.** Obtiene el identificador del evento seleccionado y ejecuta el caso de uso "Agregar Ponente" (`CU-10`), conforme a la relación `<<extend>>` establecida en el diagrama.
- **D-4.** Muestra la sección/modal de ponentes dentro de **UI16** "Formulario de Modificación de Evento" (o acceso equivalente desde `UI13`/`UI15`), conforme a la trayectoria definida en el `CU-10`.
- *----- Continúa la ejecución del caso de uso "Agregar Ponente".*

### Trayectoria alternativa E: Búsqueda sin coincidencias

> **Condición: Ocurre cuando el texto ingresado en el buscador no coincide con ningún evento aprobado.**

- **E-1.** detecta que el filtro arroja 0 registros.
- **E-2.** La tabla oculta las filas y despliega la leyenda informativa: "No se encontraron eventos que coincidan con tu búsqueda" (**MSG-I-22**).
- **E-3.** limpia el buscador o ajusta los términos; el sistema restablece las filas de la tabla.

*Fin de la trayectoria.*
