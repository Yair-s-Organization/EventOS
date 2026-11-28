---
caso_de_uso: "CU-15"
nombre: "Reservar lugar a un evento"
actor: "Asistente"
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-15: Reservar lugar a un evento

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** El asistente tendrá la capacidad de reservar una butaca o un lugar de admisión general para un evento de su interés cuya modalidad requiera registro previo, generando su confirmación nominal o boleto digital con código QR según corresponda.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-15 Reservar lugar a un evento** |
| **Autor** | Vazquez Perez Axel Daniel |
| **Actor** | Asistente |
| **Propósito** | Permitir a los asistentes registrarse en un evento de su interés y obtener una entrada que le asegura un lugar en el evento. |
| **Entradas** | Selección del evento/subevento de interés.<br>Selección de butaca en `UI06` con retención temporal de 5 minutos (exclusivo de Auditorio con mapa de asientos) o confirmación de lugar general en `UI30`. |
| **Salidas** | • Pantalla `UI06` "Mapa de Asientos y Disponibilidad del Recinto" (*QR con mapa*) o `UI30` "Reservar Lugar (Resumen de la Reservación)" (*QR Admisión general* y *Registro simple sin QR*).<br>• Se muestra en pantalla el MSG-I-16 “Operación exitosa, su reserva se ha generado correctamente.”<br>• Registro confirmado en el padrón de inscritos (y emisión del boleto digital con código QR cuando la modalidad sea *QR con mapa* o *QR Admisión general*).<br>• Envío por correo electrónico al Asistente de su confirmación (incluyendo pase digital y código QR en modalidades con QR, o leyenda de admisión general sin asiento asignado cuando `idAsiento = null`). |
| **Precondiciones** | Para completar la reserva, el Asistente debe contar con una sesión activa; el visitante puede iniciar desde UI05 pero será redirigido a UI01 o UI02 para autenticarse. El evento debe estar activo, requerir registro previo (no aplica para *Acceso libre*) y contar con cupo disponible dentro del tope efectivo `min(cupoMaximo, aforoActualRecinto)` (`RN-07`). |
| **Postcondiciones** | • La reserva del asistente se añade como un inscrito más al subevento y reduce en uno la disponibilidad efectiva (`min(cupoMaximo, aforoActualRecinto)` con 0% sobrecupo).<br>• En mapa de asientos (`UI06`), se libera la retención temporal de 5 minutos una vez confirmado el boleto.<br>• El evento se añade a los próximos eventos del asistente en `UI08` (`CU-18`).<br>• Si el subevento utiliza modalidad con boleto QR, se genera el boleto digital (`CU-17`) y se envía al correo de la cuenta; si es *Registro simple sin QR*, se omite `CU-17` y queda la inscripción nominal confirmada sin QR. |
| **Errores** | • MSG-E-05 Evento sin lugares disponibles.<br>• MSG-E-06 Evento no encontrado o cancelado.<br>• MSG-E-20 Error: Ya tienes una reserva para este evento. |
| **Tipo** | Primario |

**Trayectorias del caso de uso:**


### Trayectoria Principal

1. Selecciona el botón “Reservar lugar” en la pantalla **UI05** Detalles del evento (habilitado únicamente cuando el subevento no es de *Acceso libre*).
2. Verifica que el asistente se encuentre autenticado. [Trayectoria E]
3. Consulta la disponibilidad efectiva (`min(cupoMaximo, aforoActualRecinto)`) y modalidad de registro del subevento mediante `CU-16` “Consultar disponibilidad de lugares”, verificando que esté activo y con cupo disponible. [Trayectoria A]
4. Según la modalidad retornada por `CU-16`, bifurca el flujo de confirmación:
   - **Vía 1 — QR con mapa de asientos (Auditorio):** Muestra la pantalla **UI06** Mapa de asientos y Disponibilidad del recinto con las butacas disponibles, retenidas (5 min) y ocupadas.
   - **Vía 2 — QR Admisión general / Vía 3 — Registro simple sin QR:** Continúa por **UI30** "Reservar Lugar (Resumen de la Reservación)" sin mapa (`idAsiento = null`). [Trayectoria B]
5. En **Vía 1**, al seleccionar la butaca deseada en **UI06**, el sistema registra una retención temporal de **5 minutos** (`RN-10`) mientras el asistente presiona el botón “Confirmar Reserva”.
6. Valida que el asistente no tenga una reserva previa activa para el mismo evento. [Trayectoria C]
7. Genera la reserva y descuenta un lugar en el cupo disponible del evento: si la modalidad usa boleto QR (**Vía 1** con butaca o **Vía 2** *QR Admisión general* con `idAsiento = null`), ejecuta `CU-17` “Generar código QR”; si la modalidad es **Vía 3** (*Registro simple sin QR*), omite `CU-17` y registra la inscripción nominal confirmada en el padrón (`CU-18`). [Trayectoria A]
8. Muestra MSG-I-16 "Operación exitosa, su reserva se ha generado correctamente." y envía al correo registrado la confirmación (adjuntando el boleto digital con código QR cuando aplique).
9. Muestra la pantalla **UI08** Consultar sus eventos (reservas del asistente).

*Fin de la trayectoria.*


### Trayectoria alternativa A:

> **Condición: Se activa si el evento se queda sin cupo disponible durante el proceso de reserva.**

- **A-1.** Intenta registrar la reserva, pero el cupo llegó a cero.
- **A-2.** Muestra el mensaje **MSG-E-05** Evento sin lugares disponibles.
- **A-3.** Muestra la pantalla **UI05** Detalles del evento mostrando el estado “Agotado.”

*Fin de la trayectoria.*


### Trayectoria alternativa B:

> **Condición: El subevento corresponde a *QR Admisión general* (Vía 2) o *Registro simple sin QR* (Vía 3), por lo que no requiere selección de asiento.**

- **B-1.** Detecta que la modalidad del subevento no utiliza mapa de asientos (`idAsiento = null`).
- **B-2.** Muestra la pantalla **UI30** "Reservar Lugar (Resumen de la Reservación)" con el resumen del cupo disponible y el aviso confirmando si se emitirá boleto QR de admisión general o inscripción simple sin QR. [Trayectoria D]
- **B-3.** Presiona “Confirmar”.
- **B-4.** Continúa en el paso 6 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa C:

> **Condición: El asistente ya cuenta con una reserva para el evento.**

- **C-1.** Valida el ID del asistente con la lista de inscritos al evento y detecta un registro previo.
- **C-2.** Muestra el mensaje **MSG-E-20** Error: Ya tienes una reserva para este evento.
- **C-3.** Muestra la pantalla **UI08** Consultar sus eventos (reservas del asistente).

*Fin de la trayectoria.*


### Trayectoria alternativa D:

> **Condición: El asistente presiona “Cancelar” en la ventana de confirmación general.**

- **D-1.** Cancela el proceso de reserva.
- **D-2.** Muestra el mensaje MSG-I-17 Proceso interrumpido con éxito, reserva cancelada.
- **D-3.** Muestra la pantalla **UI05** Detalles del evento.

*Fin de la trayectoria.*


### Trayectoria alternativa E: Usuario no autenticado

> **Condición:** En el paso 2 de la trayectoria principal, el visitante selecciona [Reservar lugar] sin mantener una sesión activa.

- **E-1.** El sistema identifica al actor como visitante anónimo.
- **E-2.** Muestra **MSG-I-24:** "Para reservar tu lugar en este evento es necesario iniciar sesión o crear una cuenta.".
- **E-3.** Redirige a **UI01** "Pantalla de Inicio de Sesión" o a **UI02** "Pantalla de Registro de Usuario" y conserva el ID del evento mediante el parámetro returnUrl.
- **E-4.** Tras autenticarse, recupera el evento seleccionado y lleva al actor a UI06 "Mapa de Asientos y Disponibilidad del Recinto" o UI30 "Reservar Lugar (Resumen de la Reservación)" según la modalidad del subevento, verificando vigencia y disponibilidad.

*Fin de la trayectoria.*
