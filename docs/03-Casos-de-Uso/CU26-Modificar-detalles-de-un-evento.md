---
caso_de_uso: "CU-26"
nombre: "Modificar detalles de un evento (extend CU-24)"
actor: "Organizador"
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-26: Modificar detalles de un evento (extend CU-24)

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** Permite al usuario modificar determinadas especificaciones de sus eventos.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-26 Modificar detalles de un evento (extend CU-24)** |
| **Autor** | Arciniega Valdez Yair Emmanuel |
| **Actor** | Organizador |
| **Propósito** | Permite al usuario modificar determinada especificación de sus eventos. |
| **Entradas** | Nombre del evento y descripción del evento. |
| **Salidas** | Pantalla **UI15** Administración y Detalles del Evento (Único y Multi-actividad) y acceso a **UI16** Formulario de Modificación de Evento (Único y Multi-actividad). |
| **Precondiciones** | El organizador ya ha escogido un evento previamente en UI14 Panel Consultar Mis Eventos. |
| **Postcondiciones** | Se muestra UI15 Administración y Detalles del Evento (Único y Multi-actividad) y se habilita la edición desde UI16 Formulario de Modificación de Evento (Único y Multi-actividad). |
| **Errores** | MSG-E-07 Evento finalizado o inactivo |
| **Tipo** | Secundario para el organizador, viene del CU-24 “Consultar mis eventos” (`<<extend>>`). |


### Trayectoria Principal

1. Muestra la información actual del evento.
2. Selecciona la opción editar información general del evento. [Trayectoria A] [Trayectoria B]
3. Muestra UI15 Administración y Detalles del Evento (Único y Multi-actividad) y abre **UI16** Formulario de Modificación de Evento (Único y Multi-actividad) al editar detalles, ponentes (`CU-10`) o requerimientos técnicos (`CU-28`).

*Fin de la trayectoria.*


### Trayectoria alternativa A:

> **Condición:** El organizador desea regresar a consultar sus eventos.

- **A-1.** Oprime el botón “Regresar”.
- **A-2.** Muestra la UI14 Panel Consultar Mis Eventos.

*Fin de la trayectoria.*


### Trayectoria alternativa B:

> **Condición:** El evento seleccionado se encuentra finalizado o inactivo al intentar editar sus detalles o requerimientos técnicos.

- **B-1.** Muestra en UI15 Panel de Administración y Detalles del Evento el MSG-E-07 Evento finalizado o inactivo.
- **B-2.** Termina el caso de uso.

*Fin de la trayectoria.*
