---
caso_de_uso: "CU18"
nombre: "Cancelar su asistencia"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU18: Cancelar su asistencia (extend CU-17)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU17-Consultar-mis-eventos-por-asistir]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permite al Asistente cancelar su asistencia a un evento al que ya cuenta con una reserva activa.

### 📋 Ficha de Especificación

| Caso de uso | CU-18 Cancelar su asistencia |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Santiago Jaimes Jaramillo |
| **Actor:** | Asistente |
| **Propósito:** | Permitir al Asistente cancelar su reserva de lugar en un evento, liberando el cupo o lugar ocupado. |
| **Entradas:** | • Se selecciona el evento desde el listado de "Consultar sus eventos".<br>• Se confirma la cancelación mediante el botón `[Aceptar]`. |
| **Salidas:** | • Se mostrará en pantalla el mensaje `MSG-I-08` "Operación realizada con éxito." al confirmar la cancelación. |
| **Precondiciones:** | • Que el sistema se encuentre en el punto de extensión de "Consultar sus eventos" (`CU-17`).<br>• Que el asistente cuente con una reserva activa para el evento seleccionado. |
| **Postcondiciones:** | • Se actualiza el estado de la reserva a "Cancelada" en la base de datos y se libera el cupo o lugar específico ocupado. |
| **Errores:** | • Se mostrará el `MSG-E-01` "El evento ya ha concluido." cuando el asistente intente cancelar su asistencia a un evento ya finalizado. |
| **Tipo:** | Secundario para el actor Asistente, viene del caso de uso `CU-17` "Consultar mis eventos por asistir". |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona un evento con reserva activa desde `UI08` "Consultar Mis Eventos" (Reservas del Asistente).
2. 👤 **[Actor]** Selecciona la opción "Cancelar su asistencia" en `UI08` "Consultar Mis Eventos".
3. ⚙️ **[Sistema]** Muestra un mensaje de confirmación: "¿Deseas cancelar tu asistencia a este evento?" en `UI08` "Consultar Mis Eventos".
4. 👤 **[Actor]** Oprime el botón `[Aceptar]`. `[Trayectoria A]` `[Trayectoria B]`
5. ⚙️ **[Sistema]** Actualiza el estado de la reserva a "Cancelada".
6. ⚙️ **[Sistema]** Libera el cupo o lugar específico ocupado.
7. ⚙️ **[Sistema]** Muestra `MSG-I-08` "Operación realizada con éxito." en `UI08` "Consultar Mis Eventos".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Decide no cancelar su asistencia
> **Condición:** El Asistente decide no cancelar su asistencia.
- **A-1.** 👤 **[Actor]** Oprime el botón `[Rechazar]`.
- **A-2.** ⚙️ **[Sistema]** Conserva la reserva en estado "Activa".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: El evento ya concluyó
> **Condición:** El evento seleccionado ya concluyó.
- **B-1.** ⚙️ **[Sistema]** Muestra `MSG-E-01` "El evento ya ha concluido." en `UI08` "Consultar Mis Eventos".
- **B-2.** ⚙️ **[Sistema]** Termina el caso de uso.

*`----- Fin de trayectoria.`*

