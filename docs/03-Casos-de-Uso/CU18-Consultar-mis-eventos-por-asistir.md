---
caso_de_uso: "CU-18"
nombre: "Consultar mis eventos por asistir"
actor: "Asistente"
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-18: Consultar mis eventos por asistir

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:**

Permitir al Asistente consultar los eventos en los que tiene o ha tenido una reserva, visualizar su información y estado, aplicar filtros de búsqueda y acceder a las opciones de visualizar su boleto digital o cancelar su asistencia, cuando corresponda.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-18 Consultar mis eventos por asistir** |
| **Autor** | Jorge Eduardo Boisson Martínez |
| **Actor** | Asistente |
| **Propósito** | Permitir al Asistente consultar sus reservas de eventos, visualizar la información correspondiente y conocer su estado, así como acceder a las acciones disponibles para cada reserva. |
| **Entradas** | • Identificador del Asistente autenticado.<br>• Selección de la opción «Mis Boletos» desde **UI03** Menú Principal del Asistente.<br>• Criterios opcionales de búsqueda: nombre del evento, ponente, fecha, categoría o espacio. |
| **Salidas** | • Pantalla **UI08** "Consultar sus Eventos (Reservas del Asistente o Mis Boletos)", incluyendo reservas vigentes e historial de participación (`CU-14`).<br>• Información del evento: nombre, categoría, alcance, fecha, horario, espacio y modalidad de acceso.<br>• Estado de cada reserva (incluyendo estados resultantes de cambios de recinto, modalidad o reducción de `cupoMaximo` como `Cancelado` o `CANCELADO_POR_SOBRECUPO`).<br>• Opciones «Ver QR» (habilitada únicamente en modalidades con boleto QR y reserva vigente; omitida en *Registro simple sin QR*) y «Cancelar Asistencia», según corresponda.<br>• Mensajes informativos o de error, cuando corresponda. |
| **Precondiciones** | El Asistente debe haber iniciado sesión en el sistema. |
| **Postcondiciones** | El sistema presenta las reservas asociadas al Asistente y la información de sus respectivos eventos.<br>La consulta y aplicación de filtros no modifican los registros de las reservas. |
| **Errores** | • **MSG-I-20** «No cuentas con eventos registrados».<br>• **MSG-I-23** «No se encontraron registros que coincidan con los filtros seleccionados».<br>• **MSG-E-28** «No fue posible consultar tus eventos. Intenta nuevamente». |
| **Tipo** | Principal para el actor Asistente |

**Trayectorias del caso de uso:**


### Trayectoria Principal

1. Selecciona la opción «Mis Boletos» desde UI03 Menú Principal del Asistente.
2. Consulta las reservas asociadas a la cuenta del Asistente autenticado. [Trayectoria A] [Trayectoria B]
3. Recupera la información de los eventos correspondientes a las reservas encontradas.
4. Muestra UI08 «Consultar Mis Eventos», identificada en el diseño como «Mis Boletos», con el listado de reservas, incluyendo nombre del evento, categoría, alcance, fecha, horario, espacio y estado de cada reserva.
5. Visualiza la información de sus reservas y las opciones disponibles de acuerdo con el estado de cada una.
6. Puede utilizar el buscador o los filtros de fecha, categoría, espacio y ponente para localizar un evento específico. [Trayectoria C]
7. Muestra las opciones «Cancelar Asistencia» y «Ver QR» únicamente en las reservas que cumplen las condiciones correspondientes (las inscripciones por *Registro simple sin QR* aparecen confirmadas en el listado con opción de cancelar asistencia, sin habilitar «Ver QR»). [Punto de extensión: CU-19] [Punto de extensión: CU-20]
8. Continúa consultando sus reservas o selecciona «Volver» para regresar a UI03 Menú Principal del Asistente.

*Fin de la trayectoria.*


### Trayectoria alternativa A: Sin reservas registradas

> **Condición:** El Asistente no cuenta con reservas de eventos asociadas a su cuenta.

- **A-1.** Determina que no existen reservas asociadas al Asistente.
- **A-2.** Muestra MSG-I-20 «No cuentas con eventos registrados» en UI08 «Consultar Mis Eventos».
- **A-3.** Permite al Asistente regresar a UI03 Menú Principal del Asistente.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Error al consultar las reservas

> **Condición:** Ocurre un error durante la recuperación de las reservas o de la información de los eventos asociados.

- **B-1.** Detecta que no fue posible completar la consulta.
- **B-2.** Muestra **MSG-E-28** «No fue posible consultar tus eventos. Intenta nuevamente».
- **B-3.** Mantiene al Asistente en **UI08** y permite reintentar la consulta o regresar a **UI03** Menú Principal del Asistente.

*Fin de la trayectoria.*


### Trayectoria alternativa C: Aplicación de filtros de búsqueda

> **Condición:** El Asistente ingresa criterios de búsqueda o selecciona uno o varios filtros disponibles.

- **C-1.** Ingresa el nombre de un evento o ponente en el buscador, o selecciona los filtros de fecha, categoría, espacio o ponente.
- **C-2.** Filtra las reservas asociadas al Asistente de acuerdo con los criterios proporcionados. [Trayectoria D]
- **C-3.** Actualiza el listado en **UI08**, mostrando únicamente los eventos que coinciden con los criterios seleccionados.
- **C-4.** Puede modificar o eliminar los filtros para realizar una nueva búsqueda.
- **C-5.** Continúa en el paso 5 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa D: Sin coincidencias en los filtros de búsqueda

> **Condición:** Ninguna de las reservas del Asistente coincide con los criterios de búsqueda proporcionados.

- **D-1.** Determina que no existen reservas que coincidan con los filtros seleccionados.
- **D-2.** Muestra **MSG-I-23** «No se encontraron registros que coincidan con los filtros seleccionados» en **UI08** «Consultar Mis Eventos».
- **D-3.** Permite al Asistente modificar o eliminar los criterios de búsqueda para consultar nuevamente sus reservas.

*Fin de la trayectoria.*
