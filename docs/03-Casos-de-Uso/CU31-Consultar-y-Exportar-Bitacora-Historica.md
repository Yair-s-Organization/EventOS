---
caso_de_uso: "CU31"
nombre: "Consultar y Exportar Bitácora Histórica"
actor: "Administrador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU31: Consultar y Exportar Bitácora Histórica

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: Permitir al administrador visualizar y exportar el registro detallado de la actividad histórica del sistema, garantizando la inmutabilidad de los datos.

### 📋 Ficha de Especificación

| Caso de uso | CU-31 Consultar y Exportar Bitácora Histórica |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Arciniega Valdez Yair Emmanuel |
| Actor | Administrador |
| Propósito: | Consultar la trazabilidad de los eventos y acciones del sistema, y exportar la información para auditorías institucionales sin alterar los registros. |
| Entradas: | Criterios de búsqueda/filtrado y formato de exportación deseado. |
| Salidas: | Visualización en pantalla de los registros (usuario, acción, fecha, hora). · Archivo generado y descargado en el formato seleccionado. |
| Precondiciones: | El sistema cuenta con registros históricos de eventos (realizados/cancelados) y acciones de usuarios guardados en la base de datos. |
| Postcondiciones: | Se descarga un archivo Excel con la bitácora estructurada.<br>La base de datos permanece inmutable (no sufre ninguna alteración). |
| Errores: | Cuando no existen registros que coincidan con los filtros de búsqueda especificados por el administrador. |
| Tipo: | Primario para el Administrador. |

#### Trayectoria Principal
1. ⚙️ **[Sistema]** Muestra la bitácora histórica detallada (eventos realizados, cancelados, y registros de eliminación), incluyendo el usuario, fecha y hora de cada acción. Restringe cualquier opción de edición o eliminación.
2. 👤 **[Actor]** Ingresa criterios de filtrado para buscar registros específicos. [Trayectoria A]
3. 👤 **[Actor]** Selecciona la opción de exportar bitácora. [Trayectoria B]
4. ⚙️ **[Sistema]** Genera el archivo estructurado y completa la descarga en un tiempo no mayor a 5 segundos.
5. ⚙️ **[Sistema]** Muestra un mensaje indicando que la exportación fue exitosa.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** Los filtros ingresados no coinciden con ningún registro en la bitácora.
- ⚙️ **[Sistema]** **A-1** Muestra la tabla de la bitácora vacía.
- ⚙️ **[Sistema]** **A-2** Retoma el flujo en el paso 2 de la trayectoria principal para ingresar nuevos filtros.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** El Administrador solo desea consultar la bitácora sin exportar ningún archivo.
- ⚙️ **[Sistema]** **B-1** Consulta la información mostrada en pantalla.
- ⚙️ **[Sistema]** **B-2** Oprime el botón "Regresar" o selecciona otra sección del menú.
- ⚙️ **[Sistema]** **B-3** Muestra la pantalla principal del panel de administración.

*`----- Fin de trayectoria.`*

