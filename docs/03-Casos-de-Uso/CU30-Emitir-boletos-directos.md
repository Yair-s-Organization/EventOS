---
caso_de_uso: "CU-30"
nombre: "Invitar asistentes a eventos privados (extend CU-24)"
actor: "Organizador."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-30: Invitar asistentes a eventos privados (extend CU-24)

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** Permitir al Organizador gestionar invitados a eventos privados **por subevento** bajo su administración (mediante correo electrónico individual, carga masiva por lotes/CSV o enlace compartible con token `/eventos/privado/:tokenSubEvento`), enviándoles notificación para visualizar el evento en cartelera (`UI04`/`UI05`/`UI05.1`) y reservar su lugar conforme al cupo efectivo del subevento (`min(cupoMaximo, aforoActualRecinto)`).

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-30 Invitar asistentes a eventos privados (extend CU-24)** |
| **Autor** | Por definir. |
| **Actor** | Organizador. |
| **Propósito** | Permitir al Organizador registrar destinatarios **por subevento** en eventos privados que administra (de manera individual, por carga masiva CSV/lotes o mediante enlace compartible `/eventos/privado/:tokenSubEvento`), respetando el cupo efectivo sin sobrecupo (`RN-07`) y unicidad de invitados, para habilitarles la visibilidad y su reserva de acceso. |
| **Entradas** | • ID del evento y **ID del subevento (`idSubEvento`)** aprobado con alcance Privado administrado por el Organizador.<br>• Correo electrónico individual, lista/archivo CSV en carga masiva por lotes o activación de enlace compartible por subevento (`/eventos/privado/:tokenSubEvento`).<br>• Confirmación de guardado o ejecución de lote. |
| **Salidas** | • Registro del invitado en `"invitacionEvento"."idSubEvento"` para el subevento seleccionado.<br>• En carga masiva por lotes, resumen detallado de registros **agregados, omitidos, pendientes de activación y fallidos**.<br>• En enlace compartible, generación/copia de URL única por subevento (`/eventos/privado/:tokenSubEvento`).<br>• Mensaje **MSG-I-08** "Operación realizada con éxito.".<br>• Correo electrónico de confirmación enviado al invitado con detalles del evento/subevento y enlace directo.<br>• Evento privado visible en cartelera (`UI04`/`UI05`) para reservar lugar mediante `CU-15`. |
| **Precondiciones** | • El Organizador ha iniciado sesión y tiene permisos sobre el evento, desde CU-24 "Consultar mis eventos".<br>• El evento está aprobado, no ha concluido y tiene alcance Privado.<br>• En captura individual directa con validación estricta, el destinatario dispone de una cuenta activa (`RN-05`), o bien queda registrado mediante enlace compartible / pendiente de activación según el canal elegido. |
| **Postcondiciones** | • Se registra la invitación activa asociada al `subEvento` correspondiente (`"invitacionEvento"."idSubEvento"`).<br>• El total de invitados vigentes en el subevento no supera su cupo efectivo `min(cupoMaximo, aforoActualRecinto)` (`RN-07` y `RN-29`).<br>• No se genera una invitación duplicada para el mismo destinatario y subevento (`RN-08`).<br>• El evento privado pasa a ser visible para el usuario autorizado en `UI04` y `UI05`/`UI05.1`. |
| **Errores** | • **MSG-E-11** por falta de correo.<br>• **MSG-E-21** cuando el correo no sea válido.<br>• **MSG-E-49** cuando no exista una cuenta activa para el destinatario en alta individual.<br>• **MSG-E-48** si el destinatario ya está invitado en el subevento o cuenta con un boleto activo.<br>• **MSG-E-03** o **MSG-E-05** cuando se alcance el cupo efectivo `min(cupoMaximo, aforoActualRecinto)` del subevento.<br>• **MSG-E-07** si el evento no está habilitado o se encuentra inactivo.<br>• **MSG-E-08** por fallo al registrar la invitación en la base de datos. |
| **Tipo** | Secundario; extiende el CU-24 "Consultar mis eventos" (`<<extend>>`). |


**Trayectorias del caso de uso:**


### Trayectoria Principal

1. El Organizador selecciona un evento privado aprobado desde CU-24 "Consultar mis eventos" en **UI14** "Panel Consultar Mis Eventos" y abre la administración del evento (**UI15** / **UI16**).
2. Selecciona el **subevento específico** al que desea invitar y abre el gestor de invitados (`ModalInvitados`, con *tooltip* informativo de modalidad/alcance). Desde allí puede: capturar correos individuales (con bajas pendientes hasta **[Guardar cambios]**), ejecutar **carga masiva por lotes o CSV** [Trayectoria F] o activar y copiar el **enlace compartible privado del subevento** (`/eventos/privado/:tokenSubEvento`) [Trayectoria G].
3. El sistema verifica que el evento tenga alcance Privado, el subevento siga vigente y esté bajo responsabilidad del Organizador. [Trayectoria D]
4. El sistema valida el formato del correo y comprueba la cuenta del destinatario conforme al canal de invitación (`RN-05`). [Trayectoria A]
5. El sistema comprueba que el usuario no se encuentre ya invitado ni cuente con un boleto activo para ese subevento, y que el total de invitados del subevento no supere su capacidad efectiva `min(cupoMaximo, aforoActualRecinto)` (`RN-07`, `RN-29`). [Trayectoria B] [Trayectoria C]
6. El sistema registra la asociación en `"invitacionEvento"."idSubEvento"` y envía el correo electrónico de invitación con enlace directo (al abrirlo sin sesión o con cuenta sin permiso, `UI05` solicita autenticación y retorna automáticamente al evento). Cuando se revoque un invitado existente al guardar cambios en `UI16`, el sistema cancela sus boletos activos y retenciones en ese subevento liberando el lugar y enviándole un correo de aviso únicamente si tenía un boleto previo cancelado. [Trayectoria E]
7. Muestra **MSG-I-08** "Operación realizada con éxito." y habilita la visualización del evento en cartelera (**UI04**) del destinatario para que consulte detalles (**UI05** / **UI05.1**) y reserve su lugar (**CU-15**).
8. El Organizador puede repetir la operación por cada subevento mientras exista cupo efectivo disponible.

*Fin de la trayectoria.*


### Trayectoria alternativa A: Datos o destinatario inválidos

> **Condición:** En el paso 4 faltan datos, el correo es inválido o no corresponde a una cuenta activa.

- **A-1.** Muestra **MSG-E-11** si falta el correo, **MSG-E-21** si el correo es incorrecto o **MSG-E-49** si la cuenta no existe o está inactiva.
- **A-2.** Mantiene los datos capturados para su corrección, sin registrar la invitación.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Invitado duplicado o con boleto activo

> **Condición:** En el paso 5 el destinatario ya se encuentra registrado en el padrón de invitados o cuenta con un boleto activo para el evento.

- **B-1.** Muestra **MSG-E-48** "El destinatario ya cuenta con un boleto activo para este evento." (o ya está invitado).
- **B-2.** No genera un registro duplicado y permite ingresar otro correo.

*Fin de la trayectoria.*


### Trayectoria alternativa C: Evento sin cupo disponible

> **Condición:** En el paso 5 la invitación superaría el aforo autorizado del recinto.

- **C-1.** Muestra **MSG-E-03** "La cantidad solicitada excede el límite disponible." o **MSG-E-05** "Evento sin lugares disponibles.".
- **C-2.** Impide registrar al invitado excedente, sin modificar los registros anteriores.

*Fin de la trayectoria.*


### Trayectoria alternativa D: Evento no habilitado

> **Condición:** En el paso 3 el evento no está aprobado, concluyó, fue cancelado o no es de alcance privado.

- **D-1.** El sistema impide la invitación y muestra **MSG-E-07** "Evento finalizado o inactivo." cuando el evento no está disponible.
- **D-2.** Regresa a la vista del evento sin registrar invitados.

*Fin de la trayectoria.*


### Trayectoria alternativa E: Error al registrar la invitación o enviar correo

> **Condición:** En el paso 6 no puede guardarse la invitación en la base de datos.

- **E-1.** Muestra **MSG-E-08** "Error de conexión con la base de datos.".
- **E-2.** No confirma la invitación hasta que el registro quede correctamente persistido.

*Fin de la trayectoria.*


### Trayectoria alternativa F: Carga masiva de invitados por lotes o archivo CSV

> **Condición:** En el paso 2, el Organizador carga un archivo `.csv` o lista de correos dentro del modal del subevento para procesarlos por lotes.

- **F-1.** El sistema divide la lista en lotes controlados (`TAMANO_LOTE = 10`) y valida formato, duplicados, cupo efectivo del subevento (`min(cupoMaximo, aforoActualRecinto)`) y estado de cuenta de cada correo.
- **F-2.** Procesa los correos válidos sin abortar el lote completo ante errores puntuales, marcando como pendientes de activación o emitiendo invitación según corresponda.
- **F-3.** Presenta un reporte final desglosado en interfaz con los conteos y detalles de registros **enviados/agregados**, **omitidos**, **pendientes** y **fallidos**.

*Fin de la trayectoria.*


### Trayectoria alternativa G: Invitación mediante enlace compartible privado por subevento

> **Condición:** En el paso 2, el Organizador habilita o copia la URL privada generada para el subevento (`/eventos/privado/:tokenSubEvento`).

- **G-1.** El sistema genera o reutiliza el token único del subevento (`tokenInvitacion`) mientras la compartición por enlace esté activa (`enlaceInvitacionActivo = true`).
- **G-2.** Cuando un destinatario abre el enlace, si ya tiene sesión activa el sistema valida el cupo efectivo del subevento (`RN-07`) y registra o confirma su invitación redirigiéndolo a **UI05** / **UI05.1**; si no tiene sesión, muestra la invitación para iniciar sesión o registrarse conservando el retorno automático al enlace privado.

*Fin de la trayectoria.*
