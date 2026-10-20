---
caso_de_uso: "CU04"
nombre: "Consultar eventos aprobados"
actor: "Subdirección de Servicios Académicos"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU04: Consultar eventos aprobados

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Este caso de uso permitirá al tipo de usuario “Subdirección de Servicios Académicos” consultar todos los eventos que han sido aprobados, permitiendo tener una visualización compacta de todos estos eventos.

### 📋 Ficha de Especificación

| Caso de uso | CU04 Consultar eventos aprobados |
| --- | --- |
| Resumen de atributos |  |
| Actor | Subdirección de Servicios Académicos |
| Autor | Moreno Ramirez Jose Jorge |
| Propósito: | Permitir al personal de Subdirección de Servicios visualizar un listado de las solicitudes de eventos que se han aprobado. |
| Entradas: |  |
| Salidas: | Se muestra un panel de información con los datos de la solicitud seleccionada. |
| Precondiciones: | Que exista una cuenta activa en el sistema<br>Que existan eventos previamente aprobados |
| Postcondiciones: |  |
| Errores: | Se mostrará en pantalla el mensaje MSG14 Sin eventos asignados en la bitácora cuando no haya eventos asignados previamente |
| Tipo: | Primario para el actor Subdirección de Servicios Académicos. |

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona el panel para ver las solicitudes aprobadas.
2. ⚙️ **[Sistema]** Muestra la P13 Panel de Eventos Aprobados que contiene el listado de los eventos ya aprobados.
3. 👤 **[Actor]** Oprime el botón [Regresar]
4. ⚙️ **[Sistema]** Regresa a la pantalla XX Nombre por definir

*`--- Fin del caso de uso`*

