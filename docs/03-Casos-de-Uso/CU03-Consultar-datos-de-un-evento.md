---
caso_de_uso: "CU03"
nombre: "Consultar datos de un evento"
actor: "Subdirección de Servicios Académicos"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU03: Consultar datos de un evento

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Se brinda al personal de Subdirección de Servicios Académicos la posibilidad de visualizar los detalles de una solicitud específica para dictaminar si debe ser rechazada o aprobada
Descripción

| Caso de uso | CU03 Consultar datos de un evento |
| --- | --- |
| Resumen de atributos |  |
| Actor | Subdirección de Servicios Académicos |
| Autor | Marcial Jiménez Victor Ariel |
| Propósito: | Permitir al personal de Subdirección de Servicios Académicos consultar los datos de una solicitud específica para su evaluación. |
| Entradas: |  |
| Salidas: | Se mostrará la pantalla UI12 Detalles de la solicitud para su evaluación con los datos de la solicitud seleccionada.<br>Se mostrará el MSG24 La solicitud fue aprobada exitosamente en la pantalla UI12 Detalles de la solicitud para su evaluación |
| Precondiciones: | Que exista una cuenta activa en el sistema<br>Que se haya seleccionado una solicitud en particular del listado de solicitudes de eventos pendientes por aprobar de la pantalla UI11 Panel de solicitudes pendientes. |
| Postcondiciones: | El estado de la solicitud seleccionada cambia su estado de “pendiente” a “aprobada”.<br>Se muestra el evento aprobado en la pantalla UI15 Panel de eventos aprobados. |
| Errores: |  |
| Tipo: | Secundario para el actor Subdirección de Servicios Académicos, viene del caso de uso CU02 Consultar solicitudes de eventos. |

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona una solicitud de evento especifica en la pantalla UI11 Panel de solicitudes pendientes.
2. ⚙️ **[Sistema]** Muestra la pantalla UI12 Detalles de la solicitud para su evaluación que contiene los datos correspondientes al evento cuya solicitud fue seleccionada.
3. 👤 **[Actor]** Oprime el botón [Aceptar] de la pantalla UI12 Detalles de la solicitud para su evaluación [Trayectoria A]
4. ⚙️ **[Sistema]** Muestra el MSG24 La solicitud fue aprobada exitosamente en la pantalla UI12 Detalles de la solicitud para su evaluación
5. ⚙️ **[Sistema]** Actualiza el estado de la solicitud del evento de “pendiente” a “aprobada”.

*`--- Fin del caso de uso`*

#### Trayectoria alternativa A
> **Condición:** El personal de Subdirección de Servicios Académicos desea rechazar la solicitud de evento
- 👤 **[Actor]** **A-1** Oprime el botón [cancelar] en la pantalla UI12 Detalles de la solicitud para su evaluación
- ⚙️ **[Sistema]** **A-2** Actualiza el estado de la solicitud del evento de “pendiente” a “rechazada”.
- ⚙️ **[Sistema]** **A-3** Muestra el MSG24 La solicitud fue rechazada exitosamente en la UI12 Detalles de la solicitud para su evaluación
- ⚙️ **[Sistema]** **A-4** Termina el caso de uso.

*`--- Fin de la trayectoria`*

