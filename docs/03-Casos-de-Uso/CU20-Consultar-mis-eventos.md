---
caso_de_uso: "CU20"
nombre: "Consultar mis eventos"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU20: Consultar mis eventos

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permite al Organizador visualizar el listado y los detalles específicos de los eventos que están bajo su administración. Esta pantalla actúa como el panel central para gestionar en su totalidad sus eventos.

### 📋 Ficha de Especificación

| Caso de uso | CU20 Consultar mis eventos |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Jorge Eduardo Boisson Martínez |
| Actor | Organizador |
| Propósito: | Listar los eventos creados por el usuario y servir como punto de partida para consultar su estado, modificar sus especificaciones, cancelarlos y/o emitir boletos directos. |
| Entradas: | Criterios de filtrado. Seleccionar un evento especifico de la lista. |
| Salidas: | Listado en pantalla de los eventos. Vista de detalles del evento seleccionado (estado, recinto, horario, aforo, alcance, ponentes). |
| Precondiciones: | El usuario debe haber registrado exitosamente al menos una solicitud de evento para poseer los privilegios de Organizador RN02. |
| Postcondiciones: | No se alteran registros de la base de datos (solo lectura). |
| Errores: | - |
| Tipo: | Primario |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción “Consultar mis eventos” desde la pantalla UI02 Menú Principal del Asistente.
2. ⚙️ **[Sistema]** Verifica en la base de datos qué eventos están vinculados exclusivamente a la cuenta de usuario actual.
3. ⚙️ **[Sistema]** Despliega el listado de eventos, mostrando un resumen de cada uno (nombre, estado de aprobación, fecha y recinto) pantalla UI14 Panel Consultar Mis Eventos. [Trayectoria A].
4. 👤 **[Actor]** Selecciona un evento específico del listado para consultar su información a detalle.
5. ⚙️ **[Sistema]** Muestra en pantalla de detalles del evento seleccionado (descripción, logística, alcance, ponentes). Muestra la hora utilizando el formato de 24 horas y la zona horaria de la CDMX RF10.
6. ⚙️ **[Sistema]** Habilita y muestra los botones de acción extendida correspondientes a ese evento: “Modificar logística”, “Modificar detalles de un evento”, “Cancelar evento propio” y “Emitir boletos directos”.

#### Trayectoria alternativa A:
> **Condición:** Uso de filtros de búsqueda para localizar un evento.
- 👤 **[Actor]** **A-1** Ingresa criterios de búsqueda.
- ⚙️ **[Sistema]** **A-2** Filtra los resultados en tiempo real y actualiza la vista mostrando únicamente lose eventos administrados por el Organizador que coinciden con los ingresos integrados.
- ⚙️ **[Sistema]** **A-3** Continua en el paso 4 de la trayectoria principal.

*`----- Fin de trayectoria.`*

