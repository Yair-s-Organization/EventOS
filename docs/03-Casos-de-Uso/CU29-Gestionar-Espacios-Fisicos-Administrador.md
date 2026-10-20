---
caso_de_uso: "CU29"
nombre: "Gestionar Espacios Físicos (Administrador)"
actor: "Administrador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU29: Gestionar Espacios Físicos (Administrador)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: Este caso de uso permite al administrador del sistema visualizar un panel con tarjetas representativas de los recintos de la Escuela Superior de Cómputo (ESCOM). Desde aquí, puede crear nuevos espacios, o seleccionar una tarjeta existente para editar sus características o inhabilitarla, lo que repercutirá en la disponibilidad para nuevos eventos.

### 📋 Ficha de Especificación

| Caso de uso | CU29 Gestionar Espacios Físicos (Administrador) |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Zempoalteca Salinas Enrique |
| Actor | Administrador |
| Propósito: | Mantener actualizado el catálogo general de recintos (Auditorio, Sala 14 y Laboratorios de Cómputo), controlando su aforo y estado operativo. |
| Entradas: | Datos del nuevo espacio (Nombre, tipo y aforo máximo).<br>Clic sobre la tarjeta de un espacio en la pantalla UI23 Panel de Gestión de Espacios Físicos, para editar estado (Activo/Mantenimiento/Inactivo). |
| Salidas: | Actualización de las tarjetas en el panel principal UI23 Panel de Gestión de Espacios Físicos.<br>Mensaje de éxito (MSG-17 “Operación realizada con éxito. Recinto actualizado). |
| Precondiciones: | Haber iniciado sesión con rol de Administrador y navegado a la pantalla UI23 Panel de Gestión de Espacios Físicos. |
| Postcondiciones: | El estado o capacidad del recinto se actualiza en la base de datos.<br>Si un espacio pasa a “Mantenimiento”, se inhabilitan nuevas reservas para él. |
| Errores: | MSG-E-18. Error de conexión a la base de datos al cargar las tarjetas. |
| Tipo: | Primario para el actor Administrador. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción “Gestionar Espacios Físicos” desde el menú de navegación del administrador.
2. ⚙️ **[Sistema]** El sistema despliega la pantalla UI23 Panel de Gestión de Espacios Físicos con tarjetas de los espacios registrados (Auditorio, Sala 14 y Laboratorios). [Trayectoria A]
3. 👤 **[Actor]** Selecciona (click) la tarjeta de un espacio físico existente en la pantalla UI23.
4. ⚙️ **[Sistema]** Muestra un formulario con los datos actuales del espacio (Nombre, Aforo, Estado).
5. 👤 **[Actor]** Modifica el estado del espacio de “Activo” a “Mantenimiento”.
6. 👤 **[Actor]** Oprime el botón “Guardar Cambios”.
7. ⚙️ **[Sistema]** Valida que los datos ingresados sean correctos.
8. ⚙️ **[Sistema]** Actualiza el estado del espacio en la base de datos (se aplica un bloqueo preventivo a la agenda). [Trayectoria B]
9. 👤 **[Actor]** Cierra el formulario modal, actualiza visualmente la tarjeta en la pantalla UI23 y muestra el MSG-17 Operación realizada con éxito. Recinto actualizado.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** Fallo de conexión al cargar el panel de tarjetas.
- ⚙️ **[Sistema]** **A-1** Falla la consulta a la base de datos al intentar cargar la información a la pantalla P23.
- ⚙️ **[Sistema]** **A-2** Muestra el MSG-E-18 Error de conexión con la base de datos al cargar las tarjetas.
- ⚙️ **[Sistema]** **A-3** Muestra la pantalla UI23 vacía con un botón de “Reintentar”.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** El administrador intenta eliminar un espacio.
- 👤 **[Actor]** **B-1** El Administrador oprime un botón de “Eliminar” en la tarjeta.
- ⚙️ **[Sistema]** **B-2** El sistema intercepta la acción para proteger los registros históricos del recinto.
- ⚙️ **[Sistema]** **B-3** El sistema aplica un borrado lógico, cambiando el estado a “inactivo” en lugar de borrar la fila de la base de datos.
- ⚙️ **[Sistema]** **B-4** El sistema retoma el paso 9 de la trayectoria principal.

*`----- Fin de trayectoria.`*

