---
caso_de_uso: "CU09"
nombre: "Consultar Cartelera de Eventos"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU09: Consultar Cartelera de Eventos

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: El actor asistente podrá ver los eventos disponibles a los que puede asistir de acuerdo con su alcance (público general, comunidad, privado).

### 📋 Ficha de Especificación

| Caso de uso | CU-09 Consultar Cartelera de Eventos |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Vazquez Perez Axel Daniel |
| Actor | Asistente |
| Propósito: | Permitir a los asistentes ver qué eventos están disponibles. |
| Entradas: | Clic en ver cartelera.<br>Filtros de búsqueda opcionales (fecha, categoría, espacio y ponente). |
| Salidas: | Presentación de todos los eventos disponibles a los que se puede registrar. |
| Precondiciones: | El asistente ha iniciado sesión en su cuenta. |
| Postcondiciones: | Los registros en la base de datos no se modifican, la operación es de solo lectura. |
| Errores: | MSG-18. No hay eventos disponibles, consulte más tarde.<br>MSG-19 no hay eventos disponibles que cumplan con los filtros seleccionados. |
| Tipo: | Primario |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción “Ver cartelera de eventos” en la pantalla UI03 Menú principal del asistente.
2. ⚙️ **[Sistema]** Valida el alcance del asistente autenticado y solicita el catálogo de eventos a la base de datos.
3. ⚙️ **[Sistema]** Obtiene la lista de eventos cuyo alcance coincide con el tipo de usuario. [Trayectoria A]
4. ⚙️ **[Sistema]** Despliega la cartelera con los eventos disponibles mostrando su información general (nombre, fecha, categoría, lugar, ponente).
5. 👤 **[Actor]** El asistente visualiza la lista de eventos en la pantalla UI04(cartelera de eventos). [Trayectoria B]

*`----- Fin del caso de uso.`*

#### Trayectoria alternativa A:
> **Condición:** La base de datos no tiene registro de ningún evento.
- ⚙️ **[Sistema]** **A-1** Muestra el MSG-18 no hay eventos disponibles, consulte más tarde.
- ⚙️ **[Sistema]** **A-2** Muestra la pantalla UI03 Menú principal del asistente.

*`A-3 Fin del caso de uso.`*

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** El actor desea agregar filtros a su búsqueda.
- 👤 **[Actor]** **B-1** Selecciona uno o más filtros de búsqueda (fecha, categoría, espacio, ponente) y presiona “buscar”.
- ⚙️ **[Sistema]** **B-2** Filtra la lista de eventos según los criterios ingresados y actualiza la pantalla UI04(cartelera de eventos). [Trayectoria C] [Trayectoria D].

*`B-3 Fin del caso de uso.`*

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C:
> **Condición:** La base de datos no encuentra ningún evento que cumpla con los filtros solicitados.
- ⚙️ **[Sistema]** **C-1** Muestra el MSG-19 no hay eventos disponibles que cumplan con los filtros seleccionados.
- ⚙️ **[Sistema]** **C-2** Muestra la pantalla UI04(cartelera de eventos). vacía y el botón “limpiar filtros”. [Trayectoria D].

*`C-3 Fin del caso de uso.`*

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D:
> **Condición:** El actor desea eliminar los filtros aplicados
- 👤 **[Actor]** **D-1** Selecciona el botón “limpiar filtros” en la UI04(cartelera de eventos).
- ⚙️ **[Sistema]** **D-2** Elimina los filtros de manera automática.
- ⚙️ **[Sistema]** **D-3** Continúa en el paso 2 de la trayectoria principal.

*`----- Fin de trayectoria.`*

