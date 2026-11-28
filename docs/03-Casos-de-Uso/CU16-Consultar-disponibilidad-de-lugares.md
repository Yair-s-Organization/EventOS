---
caso_de_uso: "CU-16"
nombre: "Consultar disponibilidad de lugares (include del CU-15)"
actor: "Asistente"
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-16: Consultar disponibilidad de lugares (include del CU-15)

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:**

Permitir al asistente consultar la disponibilidad de lugares de un evento durante el proceso de reserva.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-16 Consultar disponibilidad de lugares (include del CU-15)** |
| **Autor** | Ramos Mendoza Miguel Ángel |
| **Actor** | Asistente |
| **Propósito** | Obtener la cantidad de lugares disponibles para determinar si el Asistente puede continuar con su reserva. |
| **Entradas** | Identificador del evento seleccionado |
| **Salidas** | Cantidad de lugares disponibles (`lugaresDisponibles`) calculada sobre el tope efectivo `min(cupoMaximo, aforoActualRecinto)` sin sobrecupo (`RN-07`), descontando reservas activas y retenciones temporales de 5 minutos (`RN-10`).<br>Estado de disponibilidad y modalidad de registro aplicable (*QR con mapa*, *QR Admisión general* o *Registro simple sin QR*). |
| **Precondiciones** | El Asistente ha iniciado sesión en su cuenta.<br>El Asistente ha seleccionado la opción Reservar lugar desde UI05-Detalles del Evento. |
| **Postcondiciones** | El sistema determina e informa la disponibilidad del evento.<br>No se modifican los cupos ni se genera una reserva. |
| **Errores** | MSG-E-05: «Evento sin lugares disponibles».<br>MSG-E-06: «Evento no encontrado o cancelado». |
| **Tipo** | Incluido para el Asistente, viene del CU-15 "Reservar lugar a un evento" con la relación `<<include>>`. |


### Trayectoria Principal

1. Selecciona botón “Reservar Lugar” desde **UI05** ”Detalles del Evento.”
2. Verifica que el evento seleccionado exista y no esté cancelado. [Trayectoria B]
3. Consulta la cantidad de lugares disponibles (`lugaresDisponibles`) tomando la capacidad efectiva `min(cupoMaximo, aforoActualRecinto)` sin sobrecupo (`RN-07`) y descontando boletos activos y asientos retenidos temporalmente (5 minutos en mapa), junto con la modalidad de registro aplicable para el subevento. [Trayectoria A]
4. Devuelve la cantidad de lugares disponibles y la modalidad de registro a **CU-15**.
5. Muestra la disponibilidad en **UI06** “Mapa de Asientos y Disponibilidad del Recinto” cuando la modalidad corresponda a *QR con mapa de asientos* en Auditorio (`242` butacas), o habilita el resumen **UI30** “Reservar Lugar (Resumen de la Reservación)” en `CU-15` para *QR Admisión general* y *Registro simple sin QR*.

*Fin de la trayectoria.*


### Trayectoria alternativa A:

> **Condición:** El evento no cuenta con lugares disponibles.

- **A-1.** Detecta que la cantidad de lugares disponibles es igual a cero.
- **A-2.** Muestra el mensaje MSG-E-05 "Evento sin lugares disponibles."
- **A-3.** Impide continuar con la reserva y muestra el estado “Agotado” en UI05-Detalles del Evento.

*Fin de la trayectoria.*


### Trayectoria alternativa B:

> **Condición:** El evento seleccionado no existe o fue cancelado.

- **B-1.** Detecta que el evento no se encuentra disponible.
- **B-2.** Muestra el mensaje **MSG-E-06** “Evento no encontrado o cancelado.”
- **B-3.** impide continuar con la reserva y permite regresar a **UI04** “Cartelera de Eventos.”

*Fin de la trayectoria.*
