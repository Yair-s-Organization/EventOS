---
caso_de_uso: "CU15"
nombre: "Consultar disponibilidad de lugares"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU15: Consultar disponibilidad de lugares (include del CU-14)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Incluido en:** [[CU14-Reservar-lugar-a-un-evento]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al asistente consultar la disponibilidad de lugares de un evento durante el proceso de reserva.

### 📋 Ficha de Especificación

| Caso de uso | CU-15 Consultar disponibilidad de lugares |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Ramos Mendoza Miguel Ángel |
| **Actor:** | Asistente |
| **Propósito:** | Obtener la cantidad de lugares disponibles para determinar si el Asistente puede continuar con su reserva. |
| **Entradas:** | • Identificador del evento seleccionado. |
| **Salidas:** | • Cantidad de lugares disponibles para el evento.<br>• Estado de disponibilidad del evento. |
| **Precondiciones:** | • El Asistente ha iniciado sesión en su cuenta.<br>• El Asistente ha seleccionado la opción Reservar lugar desde `UI05` "Detalles del Evento". |
| **Postcondiciones:** | • El sistema determina e informa la disponibilidad del evento.<br>• No se modifican los cupos ni se genera una reserva. |
| **Errores:** | • `MSG-E-05`: "Evento sin lugares disponibles."<br>• `MSG-E-06`: "Evento no encontrado o cancelado." |
| **Tipo:** | Incluido para el Asistente, viene del `CU-14` "Reservar lugar a un evento" con la relación `<<include>>`. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona el botón "Reservar Lugar" desde `UI05` "Detalles del Evento".
2. ⚙️ **[Sistema]** Verifica que el evento seleccionado exista y no esté cancelado. `[Trayectoria B]`
3. ⚙️ **[Sistema]** Consulta la cantidad de lugares disponibles para el evento. `[Trayectoria A]`
4. ⚙️ **[Sistema]** Devuelve la cantidad de lugares disponibles a `CU-14`.
5. ⚙️ **[Sistema]** Muestra la disponibilidad en `UI06` "Mapa de Asientos y Disponibilidad del Recinto", cuando corresponde esa modalidad, y permite continuar con el proceso de reserva.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Sin lugares disponibles
> **Condición:** El evento no cuenta con lugares disponibles.
- **A-1.** ⚙️ **[Sistema]** Detecta que la cantidad de lugares disponibles es igual a cero.
- **A-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-05` "Evento sin lugares disponibles.".
- **A-3.** ⚙️ **[Sistema]** Impide continuar con la reserva y muestra el estado "Agotado" en `UI05` "Detalles del Evento".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Evento no encontrado o cancelado
> **Condición:** El evento seleccionado no existe o fue cancelado.
- **B-1.** ⚙️ **[Sistema]** Detecta que el evento no se encuentra disponible.
- **B-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-06` "Evento no encontrado o cancelado.".
- **B-3.** ⚙️ **[Sistema]** Impide continuar con la reserva y permite regresar a `UI04` "Cartelera de Eventos".

*`----- Fin de trayectoria.`*

