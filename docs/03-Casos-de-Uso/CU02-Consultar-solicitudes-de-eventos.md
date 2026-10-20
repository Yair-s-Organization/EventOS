---
caso_de_uso: "CU02"
nombre: "Consultar solicitudes de eventos"
actor: "Subdirección de Servicios Académicos"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU02: Consultar solicitudes de eventos

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Se brinda al personal de Subdirección de Servicios Académicos la posibilidad de visualizar un listado de todas las solicitudes pendientes de aprobación.
Descripción

| Caso de uso | CU2 Consultar solicitudes de eventos |
| --- | --- |
| Resumen de atributos |  |
| Actor | Subdirección de Servicios Académicos |
| Autor | Marcial Jiménez Victor Ariel |
| Propósito: | Permitir al personal de Subdirección de Servicios Académicos consultar el listado de las solicitudes de eventos pendientes de aprobación. |
| Entradas: |  |
| Salidas: | Se muestra un listado que contiene todas las solicitudes de eventos pendientes de aprobación. |
| Precondiciones: | Que exista una cuenta activa en el sistema. |
| Postcondiciones: |  |
| Errores: |  |
| Tipo: | Primario para el actor Subdirección de Servicios Académicos |

#### Trayectoria Principal
1. 👤 **[Actor]** Solicita consultar el listado de solicitudes de eventos pendientes de aprobación, seleccionando la opción Consultar solicitudes de eventos en la pantalla UIXX Menú principal de Subdirección*.
2. ⚙️ **[Sistema]** Verifica el número de solicitudes de eventos pendientes de aprobación. [Trayectoria A].
3. ⚙️ **[Sistema]** Muestra el listado de solicitudes de eventos pendientes de aprobación en la pantalla UI11 Panel de solicitudes pendientes.

*`--- Fin del caso de uso`*

#### Trayectoria alternativa A
> **Condición:** No existen solicitudes de eventos pendientes de aprobación
- ⚙️ **[Sistema]** **A-1** Muestra el mensaje MSG 02 No hay solicitudes de aprobación en este momento en la pantalla UI11 Panel de solicitudes pendientes.
- **A-2** Termina el caso de uso

*`--- Fin de la trayectoria`*

#### Trayectoria alternativa B
> **Condición:** Se ha seleccionado una solicitud de evento especifica.
- 👤 **[Actor]** **B-1** Ejecuta CU03 Consultar datos de un evento

*`--- Fin de la trayectoria`*

