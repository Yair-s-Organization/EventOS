---
caso_de_uso: "CU13"
nombre: "Consultar cartelera de eventos"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU13: Consultar cartelera de eventos

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
El actor asistente podrá ver los eventos disponibles a los que puede asistir de acuerdo con su alcance (público general, comunidad, privado).

### 📋 Ficha de Especificación

| Caso de uso | CU-13 Consultar Cartelera de Eventos |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Vazquez Perez Axel Daniel |
| **Actor:** | Asistente |
| **Propósito:** | Permitir a los asistentes ver qué eventos están disponibles. |
| **Entradas:** | • Clic en ver cartelera.<br>• Filtros de búsqueda opcionales (fecha, categoría, espacio y ponente). |
| **Salidas:** | • Presentación de todos los eventos disponibles a los que se puede registrar en `UI04` "Cartelera de Eventos". |
| **Precondiciones:** | • El asistente ha iniciado sesión en su cuenta. |
| **Postcondiciones:** | • Los registros en la base de datos no se modifican, la operación es de solo lectura. |
| **Errores:** | • `MSG-I-14`: "No hay eventos disponibles, consulte más tarde."<br>• `MSG-I-15`: "No hay eventos disponibles que cumplan con los filtros seleccionados."<br>• `MSG-E-08`: "Error de conexión con la base de datos." |
| **Tipo:** | Primario |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Ver cartelera de eventos" en la pantalla `UI03` "Menú Principal del Asistente".
2. ⚙️ **[Sistema]** Valida el alcance del asistente autenticado y solicita el catálogo de eventos a la base de datos.
3. ⚙️ **[Sistema]** Obtiene la lista de eventos cuyo alcance coincide con el tipo de usuario. `[Trayectoria A]` `[Trayectoria E]`
4. ⚙️ **[Sistema]** Despliega la cartelera con los eventos disponibles mostrando su información general (nombre, fecha, categoría, lugar).
5. 👤 **[Actor]** El asistente visualiza la lista de eventos en la pantalla `UI04` ("Cartelera de Eventos"). `[Trayectoria B]` `[Trayectoria F]`

*`----- Fin del caso de uso.`*

#### Trayectoria alternativa A: Sin eventos registrados
> **Condición:** La base de datos no tiene registro de ningún evento.
- **A-1.** ⚙️ **[Sistema]** Muestra el `MSG-I-14` "No hay eventos disponibles, consulte más tarde.".
- **A-2.** ⚙️ **[Sistema]** Muestra la pantalla `UI03` "Menú Principal del Asistente".
- **A-3.** ⚙️ **[Sistema]** Fin del caso de uso.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Aplicar filtros de búsqueda
> **Condición:** El actor desea agregar filtros a su búsqueda.
- **B-1.** 👤 **[Actor]** Selecciona uno o más filtros de búsqueda (fecha, categoría, espacio, ponente) y presiona "buscar".
- **B-2.** ⚙️ **[Sistema]** Filtra la lista de eventos según los criterios ingresados y actualiza la pantalla `UI04` ("Cartelera de Eventos"). `[Trayectoria C]` `[Trayectoria D]`
- **B-3.** ⚙️ **[Sistema]** Fin del caso de uso.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Sin resultados con los filtros seleccionados
> **Condición:** La base de datos no encuentra ningún evento que cumpla con los filtros solicitados.
- **C-1.** ⚙️ **[Sistema]** Muestra el `MSG-I-15` "No hay eventos disponibles que cumplan con los filtros seleccionados.".
- **C-2.** ⚙️ **[Sistema]** Muestra la pantalla `UI04` ("Cartelera de Eventos") vacía y el botón "limpiar filtros". `[Trayectoria D]`
- **C-3.** ⚙️ **[Sistema]** Fin del caso de uso.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Limpiar filtros aplicados
> **Condición:** El actor desea eliminar los filtros aplicados.
- **D-1.** 👤 **[Actor]** Selecciona el botón "limpiar filtros" en la `UI04` ("Cartelera de Eventos").
- **D-2.** ⚙️ **[Sistema]** Elimina los filtros de manera automática.
- **D-3.** ⚙️ **[Sistema]** Continúa en el paso 2 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa E: Error de conexión con la base de datos
> **Condición:** No se puede conectar con la base de datos y por ende no se pueden consultar los eventos.
- **E-1.** ⚙️ **[Sistema]** Detecta la interrupción o falla al intentar consultar los registros.
- **E-2.** ⚙️ **[Sistema]** Detiene el proceso y muestra el mensaje de error `MSG-E-08` "Error de conexión con la base de datos.".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa F: Ver detalles de un evento
> **Condición:** El Asistente desea ver la información completa de un evento antes de decidir si reserva un lugar.
- **F-1.** 👤 **[Actor]** Selecciona el botón "Ver detalles" en la tarjeta del evento deseado dentro de la pantalla `UI03` ("Menú Principal del Asistente") o `UI04` ("Cartelera de Eventos").
- **F-2.** ⚙️ **[Sistema]** Obtiene el identificador del evento y consulta su información completa en la base de datos.
- **F-3.** ⚙️ **[Sistema]** Muestra la pantalla `UI05` ("Detalles del Evento"), desplegando la descripción, logística, alcance, ponentes y el botón para reservar.

*`----- Fin de trayectoria.`*

