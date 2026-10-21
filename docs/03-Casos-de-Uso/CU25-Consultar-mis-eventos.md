---
caso_de_uso: "CU25"
nombre: "Consultar mis eventos"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU25: Consultar mis eventos

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permite al Organizador visualizar el listado y los detalles específicos de los eventos que están bajo su administración. Esta pantalla actúa como el panel central para gestionar en su totalidad sus eventos.

### 📋 Ficha de Especificación

| Caso de uso | CU-25 Consultar mis eventos |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Jorge Eduardo Boisson Martínez |
| **Actor:** | Organizador |
| **Propósito:** | Listar los eventos creados por el usuario y servir como punto de partida para consultar su estado, modificar sus especificaciones, cancelarlos y/o emitir boletos directos. |
| **Entradas:** | • Criterios de filtrado.<br>• Seleccionar un evento específico de la lista. |
| **Salidas:** | • Listado en pantalla de los eventos en `UI14` "Panel de Consulta de Mis Eventos".<br>• Vista de detalles del evento seleccionado en `UI15` "Panel de Administración y Detalles del Evento" (estado, recinto, horario, aforo, alcance, ponentes). |
| **Precondiciones:** | • El usuario debe haber registrado exitosamente al menos una solicitud de evento para poseer los privilegios de Organizador (`RN-02`). |
| **Postcondiciones:** | • No se alteran registros de la base de datos (solo lectura). |
| **Errores:** | • Se mostrará en pantalla el mensaje `MSG-E-08` "Error de conexión con la base de datos.". |
| **Tipo:** | Primario. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Consultar mis eventos" desde la pantalla `UI03` "Menú Principal del Asistente".
2. ⚙️ **[Sistema]** Verifica en la base de datos qué eventos están vinculados exclusivamente a la cuenta de usuario actual. `[Trayectoria B]`
3. ⚙️ **[Sistema]** Despliega el listado de eventos, mostrando un resumen de cada uno (nombre, estado de aprobación, fecha y recinto) en la pantalla `UI14` "Panel de Consulta de Mis Eventos". `[Trayectoria A]`
4. 👤 **[Actor]** Selecciona un evento específico del listado para consultar su información a detalle.
5. ⚙️ **[Sistema]** Muestra en pantalla de detalles del evento seleccionado (`UI15`, descripción, logística, alcance, ponentes, lugar, hora de inicio, hora de finalización, modalidad de cupo, fecha, aforo estimado). Muestra la hora utilizando el formato de 24 horas y la zona horaria de la CDMX (`RNF-10`).
6. ⚙️ **[Sistema]** Habilita y muestra los botones de acción extendida correspondientes a ese evento: `"Modificar logística"`, `"Modificar detalles de un evento"`, `"Cancelar evento propio"` y `"Emitir boletos directos"`.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Filtrado de búsqueda
> **Condición:** Uso de filtros de búsqueda para localizar un evento.
- **A-1.** 👤 **[Actor]** Ingresa criterios de búsqueda.
- **A-2.** ⚙️ **[Sistema]** Filtra los resultados en tiempo real y actualiza la vista mostrando únicamente los eventos administrados por el Organizador que coinciden con los criterios ingresados.
- **A-3.** ⚙️ **[Sistema]** Continúa en el paso 4 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Error de conexión con la base de datos
> **Condición:** El sistema pierde conexión o agota el tiempo de respuesta al intentar consultar la base de datos.
- **B-1.** ⚙️ **[Sistema]** Detecta una interrupción o error de conexión al intentar recuperar los datos de los eventos.
- **B-2.** ⚙️ **[Sistema]** Muestra en pantalla el mensaje `MSG-E-08`: "Error de conexión con la base de datos.".
- **B-3.** ⚙️ **[Sistema]** Mantiene al usuario en la pantalla actual (o lo regresa al menú anterior) habilitando la opción de reintentar.

*`----- Fin de trayectoria.`*

