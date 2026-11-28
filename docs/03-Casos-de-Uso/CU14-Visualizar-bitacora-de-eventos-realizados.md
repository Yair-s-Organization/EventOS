---
caso_de_uso: "CU-14"
nombre: "Visualizar bitácora de eventos realizados"
actor: "Asistente."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-14: Visualizar bitácora de eventos realizados

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:**

Permitir al usuario (Asistente/ subdirección) consultar el historial de los eventos que ha solicitado e impartido dentro de la plataforma.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-14 Visualizar bitácora de eventos realizados** |
| **Autor** | Vargas Rodriguez Leonardo. |
| **Actor** | Asistente. |
| **Propósito** | Permitir al usuario consultar el historial completo y llevar un control de los eventos que ha organizado o realizados dentro del sistema. |
| **Entradas** | ID del usuario autentificado, Filtro opcional por periodo de tiempo. |
| **Salidas** | Consulta del historial consolidado dentro de **UI08** "Consultar Mis Eventos" *(sin pantalla `UI10` dedicada en el catálogo vigente v2.1; `UI10` corresponde a Solicitudes de Verificación en Subdirección)*, mostrando nombre del evento, fecha de realización, recinto y total de asistentes.<br>Mensaje informativo **MSG-I-03** "Sin eventos registrados en la bitácora", cuando el actor no cuente con eventos concluidos. |
| **Precondiciones** | El usuario debe de haber iniciado sesión en el sistema. |
| **Postcondiciones** | Sin cambios en el estado del sistema: Al ser una acción puramente de consulta e inspección de datos históricos, la base de datos no sufre ninguna modificación, alta o baja. |
| **Errores** | Se mostrará en pantalla el mensaje **MSG-E-08** ”Error de conexión con la base de datos”. |
| **Tipo** | Primario |


### Trayectoria Principal

1. Selecciona la opción "Consultar Mis Eventos / Historial" desde la pantalla **UI03** “Menú Principal del Asistente”.
2. Accede a **UI08** “Consultar Mis Eventos” *(sección de eventos realizados, consolidada sin vista `UI10` independiente)* y consulta en la base de datos el historial de eventos concluidos asociados al usuario. [Trayectoria A] [Trayectoria B]
3. Ordena cronológicamente los eventos realizados (del más reciente al más antiguo) en **UI08**.
4. Muestra en **UI08** la bitácora con el listado de eventos, incluyendo datos clave como nombre del evento, fecha de realización y recinto.
5. Visualiza la información del historial en **UI08** y finaliza la consulta.

*Fin de la trayectoria.*


### Trayectoria alternativa A: Sin eventos registrados en la bitácora.

> **Condición:** Ocurre en el Paso 2 si el usuario aún no ha concluido ningún evento como organizador.

- **A-1.** Detecta que la consulta no devuelve ningún evento con estatus “Concluido”.
- **A-2.** Muestra en **UI08** el mensaje **MSG-I-03** "Sin eventos registrados en la bitácora.".
- **A-3.** Habilita la opción "Regresar" en **UI08**.
- **A-4.** Selecciona la opción "Regresar".
- **A-5.** Redirige al actor a la pantalla UI03 “Menú Principal del Asistente”.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Error de conexión a la base de datos.

> **Condición:** Que el tiempo para hacer la consulta en la base de datos se agote.

- **B-1.** Detecta una interrupción en la conexión al intentar recuperar los datos.
- **B-2.** Muestra en **UI08** el mensaje MSG-E-08 "Error de conexión con la base de datos".
- **B-3.** Habilita las opciones "Reintentar" y "Regresar" en **UI08**.
- **B-4.** Selecciona una de las opciones disponibles.
- **B-5.** Si selecciona "Reintentar", regresa al paso 2 de la trayectoria principal y realiza nuevamente la consulta desde **UI08**.
- **B-6.** Si selecciona "Regresar", redirige al actor a la pantalla **UI03** “Menú Principal del Asistente”.

*Fin de la trayectoria.*
