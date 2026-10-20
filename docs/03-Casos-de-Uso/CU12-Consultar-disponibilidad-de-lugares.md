---
caso_de_uso: "CU12"
nombre: "Consultar disponibilidad de lugares"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU12: Consultar disponibilidad de lugares

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al asistente consultar la disponibilidad de lugares de un evento antes de continuar con el proceso de reserva.
Detalles:

| Caso de uso | CU-12 Consultar disponibilidad de lugares |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Ramos Mendoza Miguel Ángel |
| Actor | Asistente |
| Propósito: | Permitir al Asistente conocer la cantidad de lugares disponibles de un evento antes de iniciar o continuar con el proceso de reserva. |
| Entradas: | Selección del evento del cual se desea consultar la disponibilidad. |
| Salidas: | Cantidad de lugares disponibles para el evento.<br>Estado de disponibilidad del evento. |
| Precondiciones: | El Asistente ha iniciado sesión en su cuenta.<br>El evento seleccionado se encuentra registrado en el sistema. |
| Postcondiciones: | El sistema muestra al Asistente la cantidad de lugares disponibles para el evento.<br>La consulta no modifica la cantidad de lugares disponibles ni genera una reserva. |
| Errores: | Cuando no existen lugares disponibles para el evento, se mostrará el mensaje MSG-6 No hay lugares disponibles para este evento.<br>MSG-07 Evento no encontrado o cancelado. |
| Tipo: | Incluido para el Asistente, viene del caso de uso "Reservar lugar a un evento" con la relación `<<include>>`. |

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción “Consultar disponibilidad de lugares” desde la pantalla IUXX (detalles del evento).
2. ⚙️ **[Sistema]** Consulta la cantidad de lugares disponibles para el evento seleccionado.
3. ⚙️ **[Sistema]** Verifica la disponibilidad del evento. [Trayectoria A] [Trayectoria B]
4. ⚙️ **[Sistema]** Muestra la cantidad de lugares disponibles para el evento.
5. ⚙️ **[Sistema]** Permite al Asistente continuar con el proceso de reserva.

#### Trayectoria alternativa A:
> **Condición:** No existen lugares disponibles para el evento.
- ⚙️ **[Sistema]** **A-1** Detecta que la cantidad de lugares disponibles es igual a cero.
- ⚙️ **[Sistema]** **A-2** Muestra el mensaje MSG-6 "No hay lugares disponibles para este evento."
- ⚙️ **[Sistema]** **A-3** Muestra el estado “Agotado” en la información del evento.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** El evento permite seleccionar un lugar específico.
- ⚙️ **[Sistema]** **B-1** Detecta que el evento no existe o fue cancelado.
- ⚙️ **[Sistema]** **B-2** Muestra el mensaje MSG-07 “Evento no encontrado o cancelado.”
- ⚙️ **[Sistema]** **B-3** Regresa a la pantalla IUXX (detalles del evento).

*`----- Fin de trayectoria.`*

