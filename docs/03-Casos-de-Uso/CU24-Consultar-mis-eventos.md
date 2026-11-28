---
caso_de_uso: "CU-24"
nombre: "Consultar mis eventos"
actor: "Organizador"
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-24: Consultar mis eventos

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:**

Permite al Organizador visualizar el listado y los detalles específicos de los eventos que están bajo su administración. Esta pantalla actúa como el panel central para gestionar en su totalidad sus eventos.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-24 Consultar mis eventos** |
| **Autor** | Jorge Eduardo Boisson Martínez |
| **Actor** | Organizador |
| **Propósito** | Listar los eventos creados por el usuario y servir como punto de partida para consultar su estado, modificar sus especificaciones, cancelarlos y/o gestionar invitados en eventos privados (`UI14`, `UI15`). |
| **Entradas** | Criterios de filtrado. Seleccionar un evento específico de la lista. |
| **Salidas** | Listado en pantalla de los eventos (`UI14`). Vista `UI15` "Administración y Detalles del Evento (Único y Multi-actividad)" (estado, recinto, horario, `cupoMaximo` y aforo efectivo `min(cupoMaximo, aforoRecinto)`, alcance, póster, ponentes, invitados por subevento cuando aplica y métricas de **Inscritos** —todo registro activo incluyendo *Registro simple sin QR*— e **Ingresados** —asistencia validada mediante `CU-23` en modalidades con boleto QR—). |
| **Precondiciones** | El usuario debe haber registrado exitosamente al menos una solicitud de evento para poseer los privilegios de Organizador **RN-02**. |
| **Postcondiciones** | No se alteran registros de la base de datos (solo lectura). |
| **Errores** | Se mostrará en pantalla el mensaje **MSG-E-08** "Error de conexión con la base de datos”. |
| **Tipo** | Primario |


### Trayectoria Principal

1. Selecciona la opción “Consultar mis eventos” desde la pantalla **UI03** Menú Principal del Asistente.
2. Verifica en la base de datos qué eventos están vinculados exclusivamente a la cuenta de usuario actual. [Trayectoria B]
3. Despliega el listado de eventos, mostrando un resumen de cada uno (nombre, estado de aprobación, fecha y recinto) en la pantalla **UI14** Panel Consultar Mis Eventos. [Trayectoria A]
4. Selecciona un evento específico del listado para consultar su información a detalle.
5. Muestra en **UI15** "Administración y Detalles del Evento (Único y Multi-actividad)" la información del evento seleccionado: descripción, logística por subevento, alcance, póster, ponentes, lugar, hora de inicio, hora de finalización, modalidad de acceso, fecha, `cupoMaximo` frente al aforo físico (`242`/`100`/`36`) y conteo de **Inscritos** e **Ingresados** conforme a `RN-07` y `RN-16`. Muestra la hora utilizando el formato de 24 horas y la zona horaria de la CDMX (**RNF-10**).
6. Habilita los accesos hacia los flujos extendidos del evento en **UI15** / **UI16** / **UI27**: editar evento/logística (`CU-25`, `CU-26`, `CU-27`), gestionar requerimientos de laboratorio (`CU-28`), cancelar evento propio (`CU-29`), invitar asistentes por subevento en eventos privados (`CU-30`) y gestionar personal de logística (`CU-31`, `CU-32`).

*Fin de la trayectoria.*


### Trayectoria alternativa A:

> **Condición:** Uso de filtros de búsqueda para localizar un evento.

- **A-1.** Ingresa criterios de búsqueda.
- **A-2.** Filtra los resultados en tiempo real y actualiza la vista mostrando únicamente los eventos administrados por el Organizador que coinciden con los criterios ingresados.
- **A-3.** Continúa en el paso 4 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa B:

> **Condición:** El sistema pierde conexión o agota el tiempo de respuesta al intentar consultar la base de datos.

- **B-1.** Detecta una interrupción o error de conexión al intentar recuperar los datos de los eventos.
- **B-2.** Muestra en pantalla el mensaje **MSG-E-08**: "Error de conexión con la base de datos.".
- **B-3.** Mantiene al usuario en la pantalla actual (o lo regresa al menú anterior) habilitando la opción de reintentar.

*Fin de la trayectoria.*
