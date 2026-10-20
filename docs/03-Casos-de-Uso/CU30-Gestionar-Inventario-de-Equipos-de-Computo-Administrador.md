---
caso_de_uso: "CU30"
nombre: "Gestionar Inventario de Equipos de Cómputo (Administrador)"
actor: "Administrador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU30: Gestionar Inventario de Equipos de Cómputo (Administrador)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: El caso de uso permite al administrador ingresar a la vista específica de un laboratorio de cómputo para gestionar su inventario interno. Mediante una interfaz gráfica, puede visualizar los equipos de cómputo y cambiar su estado individual (activo, inactivo, mantenimiento) para reflejar la capacidad real del recinto.

### 📋 Ficha de Especificación

| Caso de uso | CU30 Gestionar Inventario de Equipos de Cómputo (Administrador) |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Zempoalteca Salinas Enrique |
| Actor | Administrador |
| Propósito: | Controlar la cantidad de equipos funcionales en cada laboratorio, lo cual determina el límite máximo de aforo para los eventos en esos espacios. |
| Entradas: | Selección del Laboratorio de Cómputo a editar desde la pantalla UI23 Panel de Gestión de Espacios Físicos.<br>Click sobre el icono de un equipo específico en la pantalla UI24 Mapa Visual de Inventario de Equipos de Laboratorio, para cambiar su estado. |
| Salidas: | Actualización visual del color/estado del cuadro en el modo de edición de la UI24.<br>Recálculo automático de la capacidad del laboratorio. |
| Precondiciones: | Que el espacio físico exista en el catálogo y esté “Activo” o en “Mantenimiento”.<br>El administrador debe haber navegado desde la UI23 Panel de Gestión de Espacios Físicos, hacia la UI24 Mapa Visual de Inventario de Equipos de Laboratorio. |
| Postcondiciones: | El estado individual del equipo se actualiza.<br>Si la capacidad de equipos disminuye, el sistema revalida las reservas futuras de ese laboratorio. |
| Errores: | MSG-E-19. Operación fallida al intentar actualizar el estado del equipo. |
| Tipo: | Secundario (extendido desde CU29 Gestionar Espacios Físicos). |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción de “Gestionar Equipos” dentro de la tarjeta de un Laboratorio de Cómputo específico en la pantalla UI23.
2. ⚙️ **[Sistema]** El sistema transiciona y muestra la pantalla UI24 Mapa Visual de Inventario de Equipos de Laboratorio: un mapa interactivo con cuadros que representan cada equipo de cómputo y su estado actual.
3. 👤 **[Actor]** Selecciona un cuadro (equipo de cómputo) que se encuentre en estado “Activo” dentro de la pantalla UI24.
4. ⚙️ **[Sistema]** Despliega un menú de opciones rápidas para ese equipo.
5. 👤 **[Actor]** Selecciona la opción “Marcar en Mantenimiento/inactivo”. [Trayectoria A]
6. ⚙️ **[Sistema]** Valida la instrucción y actualiza el estado del equipo en la base de datos.
7. ⚙️ **[Sistema]** Disminuye el contador de la “Capacidad Total” del laboratorio.
8. Cambia el color/estado visual del cuadro en el modo edición de la UI24 y muestra mensaje de éxito MSG-12. Operación exitosa, estado del equipo actualizado.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** El Administrador se equivoca o cancela la acción.
- 👤 **[Actor]** **A-1** hace click fuera del menú de opciones rápidas sin seleccionar un estado nuevo en la pantalla UI24.
- ⚙️ **[Sistema]** **A-2** Cierra el menú flotante sin realizar cambios en la base de datos
- ⚙️ **[Sistema]** **A-3** El modo de edición de la pantalla UI24 permanece en su estado anterior, esperando una nueva acción.

*`----- Fin de trayectoria.`*

