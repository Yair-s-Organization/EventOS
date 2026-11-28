---
caso_de_uso: "CU-25"
nombre: "Modificar logística (fecha, hora, espacio) del evento (extend CU-24)"
actor: "Organizador"
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-25: Modificar logística (fecha, hora, espacio) del evento (extend CU-24)

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:**

Permite al Organizador reprogramar o reubicar un evento previamente creado, actualizando su fecha, horario, recinto, modalidad o `cupoMaximo` (`RN-07`), requiriendo obligatoriamente una justificación y notificando a los asistentes. Ante cambios de recinto o reducción del cupo efectivo (`min(cupoMaximo, aforoActualRecinto)`) aprobados por Subdirección (`CU-07`), se aplica la Matriz de Cambios de Recinto y la Política de Reducción de Aforo/Cupo (Flujo FIFO). Si la modificación involucra fechas dentro de los próximos 7 días naturales, se cataloga como modificación con prioridad urgente para dictamen de Subdirección (`RN-23`, `RN-31`).

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-25 Modificar logística (fecha, hora, espacio) del evento (extend CU-24)** |
| **Autor** | Jorge Eduardo Boisson Martínez |
| **Actor** | Organizador |
| **Propósito** | Actualizar la logística del evento, garantizando que los asistentes estén informados y que no existan empalmes de infraestructura y horario en la escuela. |
| **Entradas** | Nueva fecha, nueva hora de inicio/fin, nuevo espacio físico, modalidad o `cupoMaximo` (`1 <= cupoMaximo <= aforoActualRecinto`). Motivo de posposición o cambio logístico. |
| **Salidas** | Ventana modal para ingreso de motivo, mensajes de confirmación visual **MSG-I-08** / **MSG-I-09** y notificación por correo electrónico aplicable según la Matriz de Cambios de Recinto y Flujo FIFO (**Correo A**, **Correo B**, **Correo C** o **Correo D**). |
| **Precondiciones** | El usuario debe haber consultado sus eventos y haber seleccionado el botón Modificar en la pantalla **UI14** / **UI15**. |
| **Postcondiciones** | El evento actualiza sus datos logísticos. El sistema libera el espacio físico anterior y ocupa el nuevo. El estado del evento se mantiene en “Aprobado” o cambia a “Pendiente” (**RN-31**). Al aprobarse un cambio de recinto, modalidad o reducción de `cupoMaximo` (`CU-07`) en subeventos con reservas activas, se ejecuta primero el Flujo FIFO si la nueva capacidad efectiva `min(cupoMaximo, aforoActualRecinto)` es menor (`CANCELADO_POR_SOBRECUPO` + **Correo D** para el excedente) y después se aplica la Matriz de Cambios de Recinto únicamente cuando cambia el espacio o la modalidad (**CONSERVADO** con `idAsiento = null` o intacto + **Correo A**; **CANCELADO** + **Correo B**; o **CANCELADO (Liberado)** + **Correo C**). |
| **Errores** | • **MSG-E-11** "Por favor, completa todos los campos obligatorios resaltados para continuar".<br>• **MSG-E-24** "El lugar seleccionado ya no se encuentra disponible.".<br>• **MSG-E-14** "La descripción excede el límite máximo de caracteres permitidos". |
| **Tipo** | Extensión de **CU-24** (`<<extend>>`). |

**Trayectorias del caso de uso:**


### Trayectoria Principal

1. Selecciona “Ver detalles” en la **pantalla UI14** Panel Consultar Mis Eventos.
2. Cambia a **UI15 Administración y Detalles del Evento (Único y Multi-actividad)** y accede a **UI16 Formulario de Modificación de Evento (Único y Multi-actividad)**, desplegando los datos logísticos actuales, los recintos filtrados por disponibilidad y el campo configurable de `cupoMaximo` (`RN-07`).
3. Ingresa la nueva fecha, ajusta el recinto, modalidad, `cupoMaximo` y/o horario y da click en el botón de guardar cambios. [Trayectoria A]
4. Muestra el modal exigiendo un motivo para el cambio (**RN-25**).
5. Escribe la justificación y confirma la acción. [Trayectoria B] [Trayectoria C]
6. Verifica el tiempo de anticipación (**RN-23**, **RN-31**); si la reprogramación ocurre con menos de 7 días naturales o propone fechas dentro de ese intervalo, cataloga la solicitud con prioridad urgente [Trayectoria E]. Valida la disponibilidad para evitar colisiones (**RN-06**, **RN-10**) [Trayectoria D], verifica si el cambio de recinto o reducción de `cupoMaximo` reduce el cupo efectivo (`min(cupoMaximo, aforoActualRecinto)`) frente a las reservas activas para aplicar el Flujo FIFO [Trayectoria F] y comprueba si la duración total, recinto, modalidad o cupo difiere de lo aprobado. [Trayectoria A]
7. Guarda los cambios o actualiza la solicitud *in-flight* (conservando las reservas activas sin alterarlas hasta el dictamen definitivo de Subdirección en `CU-07`, momento en el que se ejecutará la Matriz de Cambios de Recinto, el Flujo FIFO y el envío de **Correo A / B / C / D**), y muestra el mensaje de confirmación correspondiente (**MSG-I-08** o **MSG-I-09**).

*Fin de la trayectoria.*


### Trayectoria alternativa A:

> **Condición:** Extensión de la duración del evento (**RN-31**).

- **A-1.** Detecta que el bloque de horario difiere de la duración original aprobada.
- **A-2.** Actualiza los datos logísticos en la base de datos y revoca la aprobación, cambiando el estado del evento a "Pendiente" para revisión por la Subdirección.
- **A-3.** Envía la notificación correspondiente a los asistentes y muestra el mensaje **MSG-I-09**: "Operación realizada con éxito. Evento en espera de revisión debido a cambio de duración."

*Fin de la trayectoria.*


### Trayectoria alternativa B:

> **Condición:** Ocurre al presionar el botón guardar con campos vacíos.

- **B-1.** Detecta que el campo de motivo está vacío.
- **B-2.** Resalta el área de texto en el modal y muestra el mensaje **MSG-E-11**: "Por favor, completa todos los campos obligatorios resaltados para continuar."
- **B-3.** Mantiene la ventana modal activa hasta que se ingrese el texto o se cancele la acción.

*Fin de la trayectoria.*


### Trayectoria alternativa C:

> **Condición**: Ocurre si el nombre del evento o la descripción del evento supera la longitud permitida.

- **C-1.** Detecta que la longitud del texto sobrepasa el límite máximo establecido.
- **C-2.** Muestra en el modal el mensaje **MSG-E-14**: "La descripción excede el límite máximo de caracteres permitidos"
- **C-3.** Bloquea la confirmación y resalta el campo en rojo.

*Fin de la trayectoria.*


### Trayectoria alternativa D:

> **Condición:** Ocurre cuando el recinto seleccionado ya fue apartado por otro evento en el mismo intervalo de tiempo o no cuenta con disponibilidad operativa.

- **D-1.** Detecta una colisión de horarios o falta de disponibilidad en el recinto seleccionado (**RN-06**, **RN-10**).
- **D-2.** Muestra en la pantalla **UI16** el mensaje **MSG-E-24**: "El lugar seleccionado ya no se encuentra disponible."
- **D-3.** Permite al usuario seleccionar un recinto alternativo o ajustar el horario.

*Fin de la trayectoria.*


### Trayectoria alternativa E: Reprogramación con menos de 7 días naturales (Modificación Urgente)

> **Condición:** Ocurre en el paso 6 cuando la fecha actual del evento o la nueva fecha propuesta cuenta con una antelación menor o igual a 7 días naturales (**RN-23**, **RN-31**).

- **E-1.** El sistema detecta la proximidad de la fecha y clasifica la solicitud de modificación con prioridad urgente (`esUrgente = true`).
- **E-2.** Registra o actualiza la solicitud *in-flight* en estado "Pendiente de Evaluación", conservando el motivo obligatorio capturado en el modal.
- **E-3.** Conserva intactos los boletos y lugares ya reservados por los asistentes hasta el dictamen definitivo de Subdirección.
- **E-4.** Envía aviso prioritario de reprogramación en revisión a los asistentes y muestra en pantalla el mensaje **MSG-I-09**: "Operación realizada con éxito. Evento en espera de revisión debido a cambio de duración." (o reprogramación logística urgente).

*Fin de la trayectoria.*


### Trayectoria alternativa F: Cambio de recinto o reducción de cupo configurable (Flujo FIFO)

> **Condición:** Ocurre en el paso 6 cuando el Organizador solicita reubicar un subevento a un espacio más pequeño o reducir su `cupoMaximo` de modo que la capacidad efectiva resultante (`min(cupoMaximo, aforoActualRecinto)`) es menor que los boletos activos ya reservados (**RN-07**, **RN-31**, **RN-40**).

- **F-1.** El sistema detecta que la capacidad efectiva resultante (`min(cupoMaximo, aforoActualRecinto)`) es menor que el número de reservas activas emitidas para el subevento y advierte en la solicitud el impacto de reducción de cupo.
- **F-2.** Al aprobarse la modificación logística por Subdirección (`CU-07`), el sistema ordena cronológicamente los registros activos de inscripción (*First-In, First-Out* / FIFO).
- **F-3.** Conserva como válidos los primeros registros hasta completar el nuevo cupo efectivo permitido (aplicando posteriormente la Matriz de Cambios de Recinto únicamente cuando cambie el recinto o modalidad: **Correo A**, **Correo B** o **Correo C**; si se mantuvo en el mismo recinto y modalidad y solo bajó `cupoMaximo`, los boletos retenidos siguen vigentes sin reenvío de Correo A/B/C).
- **F-4.** Los registros excedentes pasan automáticamente al estado `CANCELADO_POR_SOBRECUPO` y reciben notificación inmediata mediante el **Correo D (Cancelación por Sobrecupo)**.
- **F-5.** Cuando el evento tenga alcance **Privado**, el sistema sincroniza automáticamente el padrón de invitados por subevento (`"invitacionEvento"."idSubEvento"`), retirando a los excedentes cancelados y ajustando el total de invitados al nuevo cupo efectivo vigente priorizando a quienes conservan boleto activo.

*Fin de la trayectoria.*
