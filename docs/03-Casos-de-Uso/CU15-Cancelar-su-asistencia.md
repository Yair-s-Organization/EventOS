---
caso_de_uso: "CU15"
nombre: "Cancelar su asistencia"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU15: Cancelar su asistencia

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: Permite al Asistente cancelar su asistencia a un evento al que ya cuenta con una reserva activa.

### 📋 Ficha de Especificación

| Caso de uso | CU-15 Cancelar su asistencia |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Santiago Jaimes Jaramillo |
| Actor | Asistente |
| Propósito: | Permitir al Asistente cancelar su reserva de lugar en un evento, liberando el cupo o lugar ocupado. |
| Entradas: | • Se selecciona el evento desde el listado de "Consultar sus eventos".• Se confirma la cancelación mediante el botón [Aceptar]. |
| Salidas: | • Se mostrará en pantalla el mensaje MSG-24 "Operación realizada con éxito." al confirmar la cancelación. |
| Precondiciones: | • Que el sistema se encuentre en el punto de extensión de "Consultar sus eventos".• Que el asistente cuente con una reserva activa para el evento seleccionado. |
| Postcondiciones: | • Se actualiza el estado de la reserva a "Cancelada" en la base de datos y se libera el cupo o lugar específico ocupado. |
| Errores: | • Se mostrará el MSG-01 "El evento ya ha concluido." cuando el asistente intente cancelar su asistencia a un evento ya finalizado. |
| Tipo: | Secundario para el actor Asistente, viene del caso de uso CU-16 Consultar sus eventos. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** El Asistente selecciona un evento con reserva activa desde UI08 “Consultar Sus Eventos (Reservas del Asistente)”.
2. 👤 **[Actor]** El Asistente selecciona la opción “Cancelar su asistencia” en UI08 “Consultar Sus Eventos (Reservas del Asistente)”.
3. ⚙️ **[Sistema]** El sistema muestra un mensaje de confirmación: “¿Deseas cancelar tu asistencia a este evento?” en UI08 “Consultar Sus Eventos (Reservas del Asistente)”.
4. 👤 **[Actor]** El Asistente oprime el botón [Aceptar]. [Trayectoria A] [Trayectoria B]
5. ⚙️ **[Sistema]** El sistema actualiza el estado de la reserva a "Cancelada".
6. ⚙️ **[Sistema]** El sistema libera el cupo o lugar específico ocupado.
7. ⚙️ **[Sistema]** El sistema muestra el MSG-24 en UI08 “Consultar Sus Eventos (Reservas del Asistente)”.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** El Asistente decide no cancelar su asistencia.
- 👤 **[Actor]** **A-1** El Asistente oprime el botón [Rechazar].
- ⚙️ **[Sistema]** **A-2** El sistema conserva la reserva en estado "Activa".
- ⚙️ **[Sistema]** **A-3** Termina el caso de uso.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** El evento seleccionado ya concluyó.
- ⚙️ **[Sistema]** **B-1** El sistema muestra el MSG-01 en UI08 “Consultar Sus Eventos (Reservas del Asistente)”.
- ⚙️ **[Sistema]** **B-2** Termina el caso de uso.

*`----- Fin de trayectoria.`*

