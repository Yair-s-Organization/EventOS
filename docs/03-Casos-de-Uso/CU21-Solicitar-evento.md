---
caso_de_uso: "CU-21"
nombre: "Solicitar evento (Asistente)"
actor: "Asistente."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-21: Solicitar evento

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** Permitir que un Asistente con cuenta verificada solicite un evento de una o varias fechas a través de UI07. Los subeventos son bloques de fecha y horario de una misma solicitud, no casos de uso independientes.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-21 Solicitar evento** |
| **Autor** | Jaimes Jaramillo Santiago. |
| **Actor** | Asistente. |
| **Propósito** | Permitir al Asistente solicitar un evento indicando su contenido, beneficio para ESCOM/IPN y espacio con fechas y horarios disponibles, incluyendo varias sesiones o subeventos cuando la actividad dure varios días. |
| **Entradas** | • ID del usuario autenticado.<br>• Nombre, descripción, justificación del beneficio para ESCOM/IPN, alcance Público/Interno/Privado, póster opcional (`2048×1152`, almacenado en bucket público R2) y tipo de solicitante.<br>• Documento de identidad requerido según tipo Estudiante, Empresa o Externo (acreditado previamente en `UI32`, bucket privado R2 `<= 5 MB`).<br>• Recinto solicitado, modalidad de acceso permitida según el recinto (`RN-03`/`RN-04`), `cupoMaximo` configurable opcional (`1 <= cupoMaximo <= aforoRecinto` en *Registro simple sin QR* y *QR Admisión general*, `RN-07`), motivo de urgencia obligatorio si alguna fecha es dentro de los próximos 7 días naturales (`RN-14`) y uno o varios bloques de fecha, hora de inicio y finalización (subeventos). |
| **Salidas** | • Pantalla **UI07** "Formulario de Solicitud de Evento" (con tooltips contextuales `InfoTooltip`/`ModalidadAccesoHelp`).<br>• Registro del evento y sus subeventos o bloques horarios en estado "Pendiente de aprobación".<br>• Mensaje **MSG-I-08** "Operación realizada con éxito.".<br>• Privilegios de Organizador exclusivos para la solicitud creada, conforme a RN-02. |
| **Precondiciones** | • El usuario cuenta con sesión activa y cuenta registrada (CU-01).<br>• Los espacios físicos solicitados están disponibles para recibir solicitudes.<br>• El usuario debe tener una cuenta activa con identidad verificada (esta_verificado == true) por la autoridad correspondiente antes de solicitar recintos institucionales. |
| **Postcondiciones** | • Se guarda una solicitud con sus bloques horarios y el alcance seleccionado.<br>• No se reserva dos veces el mismo espacio en horarios traslapados (RN-06).<br>• El evento permanece pendiente hasta la evaluación de Subdirección; la creación por el Asistente no lo aprueba automáticamente. |
| **Errores** | • **MSG-E-11** ante campos obligatorios incompletos.<br>• **MSG-E-13** o **MSG-E-14** por descripción vacía o demasiado extensa.<br>• **MSG-E-15** si el alcance no es válido.<br>• **MSG-E-36** ante fechas u horarios inválidos.<br>• **MSG-E-47** ante un traslape horario en el recinto solicitado.<br>• **MSG-E-08** si falla el registro en la base de datos.<br>• MSG-E-54 cuando el usuario no haya acreditado la verificación de identidad. |
| **Tipo** | Primario para el actor Asistente. |

**Trayectorias del caso de uso:**


### Trayectoria Principal

1. El Asistente selecciona [Solicitar evento] desde UI03 "Menú Principal del Asistente". El sistema valida que su cuenta esté verificada. [Trayectoria E]
2. El sistema muestra **UI07** "Formulario de Solicitud de Evento" con nombre, descripción, justificación, alcance, póster, modalidad de acceso, fecha, hora de inicio, hora de finalización y espacio deseado.
3. El actor proporciona los datos del evento, selecciona su tipo de solicitante y adjunta el documento de identidad que corresponda.
4. El actor define el primer bloque de fecha y horas, selecciona el espacio solicitado, configura la modalidad de acceso habilitada para dicho recinto apoyado por los tooltips contextuales (RN-03, RN-04) y ajusta si lo desea el `cupoMaximo` sin sobrecupo (RN-07): en **Laboratorio** (`36` equipos de alumno + `1` docente) queda fija *QR Admisión general* (obligatoria por RN-18) con cupo configurable `<= equipos activos`; en **Sala 14** (`100` lugares) elige *Acceso libre*, *Registro simple sin QR* o *QR Admisión general* (con cupo `<= 100` en modalidades con registro); en **Auditorio** (`242` lugares) dispone de las cuatro opciones (en *QR con mapa de asientos* el cupo permanece fijo en `242`). Si necesita más sesiones o días, utiliza [Agregar nueva fecha] y si alguna fecha está dentro de los próximos 7 días naturales captura el motivo de urgencia obligatorio (`RN-14`). [Trayectoria A]
5. El actor revisa los datos generales del evento y los bloques horarios capturados antes de enviar la solicitud.
6. El actor selecciona [Solicitar Evento].
7. El sistema revisa datos obligatorios y que cada bloque tenga fecha futura y hora de fin posterior a la de inicio. [Trayectoria B]
8. El sistema comprueba que ningún bloque horario se traslape con eventos aprobados o pendientes en el espacio seleccionado, y que no existan superposiciones entre los bloques del propio evento (RN-06). [Trayectoria C]
9. El sistema registra la solicitud y todos sus bloques como parte de un mismo evento, asigna estado "Pendiente de aprobación" y privilegios de Organizador exclusivos para ese evento. [Trayectoria D]
10. El sistema muestra **MSG-I-08** "Operación realizada con éxito." en **UI07** y finaliza la solicitud.

*Fin de la trayectoria.*


### Trayectoria alternativa A: Agregar sesiones o subeventos

> **Condición:** Ocurre en el paso 4 cuando el evento incluye más de una sesión en días distintos o varias sesiones el mismo día.

- **A-1.** El actor presiona [Agregar nueva fecha] para añadir otro bloque con fecha, horario y espacio deseado.
- **A-2.** El sistema añade una fila de captura sin crear otra solicitud independiente.
- **A-3.** El actor completa la fecha y las horas del nuevo subevento; puede repetir la operación tantas veces como sesiones requiera.
- **A-4.** Cada bloque se valida por separado y también frente a los demás bloques; regresa al paso 5 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Datos o fecha inválidos

> **Condición:** En el paso 7 hay campos obligatorios vacíos, descripción no válida, alcance inválido o algún horario incoherente.

- **B-1.** Muestra MSG-E-11, MSG-E-13, MSG-E-14, MSG-E-15 o MSG-E-36 según el campo que originó la validación.
- **B-2.** Mantiene UI07 y resalta los datos por corregir; no registra la solicitud.
- **B-3.** Retoma el paso 6 después de la corrección.

*Fin de la trayectoria.*


### Trayectoria alternativa C: Conflicto en un bloque de horario

> **Condición:** En el paso 8 uno o más subeventos coinciden con una solicitud pendiente o aprobada para el mismo espacio o entre sí.

- **C-1.** Muestra MSG-E-47 "El espacio ya se encuentra solicitado o reservado para el horario seleccionado.".
- **C-2.** Señala el bloque afectado y permite modificar su fecha, hora o recinto.
- **C-3.** Retoma la validación del paso 8, sin guardar parcialmente los subeventos.

*Fin de la trayectoria.*


### Trayectoria alternativa D: Error al guardar la solicitud

> **Condición:** Ocurre en el paso 9 cuando no puede guardarse el evento y sus bloques.

- **D-1.** Muestra MSG-E-08 "Error de conexión con la base de datos.".
- **D-2.** Conserva la información ingresada y evita guardar solo una parte de las sesiones.

*Fin de la trayectoria.*


### Trayectoria alternativa E: Cuenta no verificada

> **Condición:** En el paso 1, el usuario intenta solicitar un evento sin contar con verificación de identidad activa (esta_verificado == false).

- **E-1.** El sistema impide el registro de la solicitud y muestra MSG-E-54: "Para solicitar recintos institucionales es indispensable haber acreditado tu identidad.".
- **E-2.** Redirige a UI32 "Pantalla de Verificación de Identidad" para adjuntar la documentación probatoria y completar el proceso de validación.
- **E-3.** La solicitud no se registra hasta que la cuenta se encuentre verificada.

*Fin de la trayectoria.*
