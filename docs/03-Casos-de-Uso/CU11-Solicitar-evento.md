---
caso_de_uso: "CU-11"
nombre: "Solicitar evento (Subdirección / Asistente)"
actor: "Asistente y Subdirección de Servicios Educativos."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-11: Solicitar evento

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** Permitir al Asistente y al personal de Subdirección de Servicios Educativos registrar solicitudes de eventos dentro de la plataforma, proporcionando la información necesaria para su realización. Las solicitudes registradas por el Asistente quedarán pendientes de evaluación, mientras que aquellas registradas por Subdirección serán aprobadas automáticamente.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-11 Solicitar evento** |
| **Autor** | Jaimes Jaramillo Santiago |
| **Actor** | Asistente y Subdirección de Servicios Educativos. |
| **Propósito** | Permitir al Asistente o al personal de Subdirección de Servicios Educativos registrar solicitudes de eventos, garantizando la validación de la información proporcionada y la asignación del estado correspondiente según el rol del actor. |
| **Entradas** | • ID del usuario autenticado, nombre, descripción, justificación y alcance del evento (obligatorios).<br>• Motivo de urgencia (obligatorio para Asistente si alguna fecha está dentro de los próximos 7 días naturales; omitido en Subdirección conforme a RN-13 y RN-14).<br>• Póster del evento opcional (`2048×1152`, bucket público de Cloudflare R2).<br>• Recinto solicitado, modalidad de acceso permitida por recinto (*Acceso libre*, *Registro simple sin QR*, *QR Admisión general* o *QR con mapa de asientos* según RN-03/RN-04), `cupoMaximo` configurable opcional (`1 <= cupoMaximo <= aforoRecinto` en *Registro simple sin QR* y *QR Admisión general*, RN-07) y uno o más bloques de fecha, hora de inicio y hora de finalización; cada bloque representa un subevento del mismo evento.<br>• Tipo de solicitante y constancia de identidad verificada previamente (`UI32`, PDF `<= 5 MB` en R2 privado cuando el actor es Asistente). |
| **Salidas** | • Pantalla **UI07** "Formulario de Solicitud de Evento" (con tooltips contextuales `InfoTooltip`/`ModalidadAccesoHelp`).<br>• Registro de la solicitud y sus subeventos como una sola actividad.<br>• Mensaje **MSG-I-08** "Operación realizada con éxito.".<br>• Estado "Pendiente de aprobación" si registra el Asistente, o "Aprobado" si registra Subdirección (RN-13). |
| **Precondiciones** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el CU-01 "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Asistente o Subdirección de Servicios Educativos.<br>• El usuario debe tener una cuenta activa con identidad verificada (esta_verificado == true) por la autoridad correspondiente antes de solicitar recintos institucionales. |
| **Postcondiciones** | • La información de la solicitud queda registrada correctamente en la base de datos.<br>• Si el actor es Asistente, la solicitud queda "Pendiente de aprobación" y recibe privilegios de Organizador exclusivos para ese evento conforme a RN-02.<br>• Si el actor es Subdirección de Servicios Educativos, la solicitud se registra directamente con el estado "Aprobado", conforme a la regla de negocio RN-13.<br>• Las solicitudes pendientes quedan disponibles para su consulta mediante el CU-06 "Consultar solicitudes de eventos".<br>• Los eventos aprobados automáticamente por Subdirección quedan disponibles para su consulta mediante el CU-08 "Consultar eventos aprobados".<br>• Si el actor cancela el proceso antes de enviar la solicitud, no se registra información del evento.<br>• La sesión del actor permanece activa. |
| **Errores** | • **MSG-E-11** por campos obligatorios incompletos.<br>• **MSG-E-13** o **MSG-E-14** cuando la descripción sea inválida.<br>• **MSG-E-15** para alcance incorrecto.<br>• **MSG-E-36** para fechas u horarios inválidos.<br>• **MSG-E-47** si alguno de los bloques horarios se traslapa con reservas o solicitudes del mismo espacio.<br>• **MSG-E-08** por falla al guardar en la base de datos. |
| **Tipo** | Primario para los actores Asistente y Subdirección de Servicios Educativos. |


### Trayectoria Principal

1. Selecciona la opción "Solicitar un evento" desde UI03 "Menú Principal del Asistente" o UI25 "Menú Principal de Subdirección", según su rol.
2. Muestra UI07 "Formulario de Solicitud de Evento" con nombre, descripción, justificación, alcance, póster, recinto, modalidad de acceso y bloques de fecha, hora inicial y final.
3. Identifica el rol del actor autenticado y configura los campos adicionales del formulario según corresponda. [Trayectoria A] [Trayectoria B]
4. El actor captura los datos del evento, define su primer bloque horario, selecciona el recinto junto con su modalidad de acceso habilitada apoyado por tooltips contextuales (RN-03, RN-04) y ajusta si lo desea `cupoMaximo` sin sobrecupo (RN-07): en **Laboratorio** (`36` equipos para alumno + `1` estación docente) se fija *QR Admisión general* como única opción obligatoria (RN-18) con cupo configurable `<= equipos activos`; en **Sala 14** (`100` lugares) elige entre *Acceso libre*, *Registro simple sin QR* o *QR Admisión general* (cupo `<= 100` en modalidades con registro); y en **Auditorio** (`242` lugares) habilita las cuatro opciones (en *QR con mapa de asientos* el cupo es fijo en `242`). Si la actividad incluye más fechas o sesiones, utiliza [Agregar nueva fecha]. [Trayectoria I]
5. Verifica la información proporcionada y selecciona la opción [Enviar solicitud]. [Trayectoria H]
6. Valida los campos obligatorios y las horas de todos los bloques, con fecha futura y finalización posterior al inicio. Si el solicitante es Asistente y alguna fecha tiene 7 días naturales o menos de antelación respecto a la fecha actual, evalúa la solicitud como urgente y valida el motivo de urgencia [Trayectoria J] (Subdirección omite este modal por aprobación automática, RN-13). [Trayectoria C] [Trayectoria D] [Trayectoria E] [Trayectoria F]
7. Comprueba que cada subevento respete la disponibilidad del mismo espacio para los horarios de su bloque y no exista traslape con eventos pendientes o aprobados ni entre sus propios bloques (RN-06). [Trayectoria I]
8. Registra la solicitud y todos sus subeventos como un solo evento (almacenando el motivo de urgencia y marcando esUrgente = true si aplicó), asignando estado "Pendiente de aprobación" al Asistente o "Aprobado" a Subdirección (RN-13), y privilegios de Organizador del evento al solicitante (RN-02). [Trayectoria G]
9. Muestra el mensaje **MSG-I-08** "Operación realizada con éxito." en la pantalla **UI07** "Formulario de Solicitud de Evento", indicando además el estado asignado a la solicitud registrada.
10. Visualiza la confirmación del registro y finaliza la operación.

*Fin de la trayectoria.*


### Trayectoria alternativa A: Solicitud realizada por el Asistente

> **Condición:** Ocurre en el paso 3 de la trayectoria principal cuando el sistema identifica que el actor autenticado tiene asignado el rol de Asistente.

- **A-1.** Habilita en la pantalla **UI07** "Formulario de Solicitud de Evento" el campo obligatorio "Tipo de solicitante", presentando las opciones Estudiante, Empresa y Externo.
- **A-2.** Selecciona el tipo de solicitante que le corresponde.
- **A-3.** Identifica el tipo de solicitante seleccionado y solicita el documento correspondiente:
  - Si selecciona "Estudiante", solicita la credencial institucional de ESCOM/IPN.
  - Si selecciona "Empresa", solicita el acta constitutiva de la empresa.
  - Si selecciona "Externo", solicita una identificación oficial INE.
- **A-4.** Adjunta el documento de identidad solicitado mediante el campo de carga de archivos.
- **A-5.** Conserva el tipo de solicitante y el documento adjunto como parte de la información que será validada y registrada con la solicitud.
- **A-6.** Retoma la ejecución desde el paso 5 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Solicitud realizada por Subdirección de Servicios Educativos

> **Condición:** Ocurre en el paso 3 de la trayectoria principal cuando el sistema identifica que el actor autenticado tiene asignado el rol de Subdirección de Servicios Educativos.

- **B-1.** Identifica que el actor cuenta con los permisos necesarios para registrar solicitudes de eventos que serán aprobadas automáticamente.
- **B-2.** Configura la pantalla **UI07** "Formulario de Solicitud de Evento", omitiendo los campos de documento de identidad y el modal de motivo de urgencia (`RN-13`, `RN-14`).
- **B-3.** Establece que, una vez completadas las validaciones del formulario, la solicitud será registrada directamente con el estado "Aprobado", conforme a la regla de negocio RN-13.
- **B-4.** Retoma la ejecución desde el paso 5 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa C: Campos obligatorios incompletos

> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el actor intenta registrar una solicitud sin completar alguno de los campos obligatorios o, en el caso del Asistente, sin seleccionar el tipo de solicitante o adjuntar el documento requerido.

- **C-1.** Detecta que uno o más campos obligatorios del formulario se encuentran vacíos o que no se ha adjuntado el documento correspondiente cuando este es requerido.
- **C-2.** Detiene el proceso de registro y muestra el mensaje **MSG-E-11** "Por favor, completa todos los campos obligatorios resaltados para continuar.".
- **C-3.** Mantiene al actor en la pantalla **UI07** "Formulario de Solicitud de Evento", resaltando los campos que requieren información.
- **C-4.** Completa los campos obligatorios y selecciona nuevamente la opción [Enviar solicitud].
- **C-5.** Retoma la ejecución desde el paso 7 de la trayectoria principal para validar nuevamente la información ingresada.

*Fin de la trayectoria.*


### Trayectoria alternativa D: Descripción del evento inválida

> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el actor deja vacío el campo correspondiente a la descripción del evento o ingresa un texto que excede el límite máximo de caracteres permitido.

- **D-1.** Detecta que la descripción del evento no cumple con las restricciones establecidas para el formulario.
- **D-2.** Muestra el mensaje **MSG-E-13** "Dato requerido faltante. La descripción no puede estar vacía.", cuando no se haya proporcionado una descripción, o el mensaje **MSG-E-14** "La descripción excede el límite máximo de caracteres permitidos.", cuando se supere la longitud autorizada.
- **D-3.** Mantiene al actor en la pantalla **UI07** "Formulario de Solicitud de Evento", resaltando el campo correspondiente a la descripción.
- **D-4.** Corrige la descripción del evento y selecciona nuevamente la opción [Enviar solicitud].
- **D-5.** Retoma la ejecución desde el paso 7 de la trayectoria principal para validar la información corregida.

*Fin de la trayectoria.*


### Trayectoria alternativa E: Alcance del evento inválido

> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el sistema detecta que el alcance del evento no corresponde a alguna de las opciones permitidas.

- **E-1.** Detecta que el alcance seleccionado no cumple con las opciones establecidas: Público o Privado.
- **E-2.** Detiene el proceso de registro y muestra el mensaje **MSG-E-15** "Debe seleccionar un tipo de alcance válido para continuar.".
- **E-3.** Mantiene al actor en la pantalla **UI07** "Formulario de Solicitud de Evento", resaltando el campo correspondiente al alcance.
- **E-4.** Selecciona un alcance válido y presiona nuevamente la opción [Enviar solicitud].
- **E-5.** Retoma la ejecución desde el paso 7 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa F: Fecha u horario del evento inválido

> **Condición:** Ocurre en el paso 7 de la trayectoria principal cuando el actor proporciona una fecha de realización anterior a la fecha actual o un horario de finalización que no es posterior a la hora de inicio.

- **F-1.** Detecta que la fecha u horario proporcionado no cumple con las condiciones establecidas para registrar un evento.
- **F-2.** Detiene el proceso de registro y muestra el mensaje **MSG-E-36** "La fecha u horario del evento no es válido. Verifique que la fecha sea futura y que la hora de finalización sea posterior a la hora de inicio.".
- **F-3.** Mantiene al actor en la pantalla **UI07** "Formulario de Solicitud de Evento", resaltando los campos de fecha y horario que requieren corrección.
- **F-4.** Corrige la fecha u horario del evento y selecciona nuevamente la opción [Enviar solicitud].
- **F-5.** Retoma la ejecución desde el paso 8 de la trayectoria principal para verificar nuevamente los datos de programación.

*Fin de la trayectoria.*


### Trayectoria alternativa G: Error de conexión con la base de datos

> **Condición:** Ocurre en el paso 8 de la trayectoria principal cuando el sistema no puede registrar correctamente la solicitud debido a una falla de conexión con la base de datos.

- **G-1.** Detecta una falla de conexión con la base de datos al intentar almacenar la información correspondiente a la solicitud del evento.
- **G-2.** Muestra el mensaje **MSG-E-08** "Error de conexión con la base de datos.", notificando al actor que no fue posible completar o verificar el registro de la solicitud.
- **G-3.** Mantiene al actor en la pantalla **UI07** "Formulario de Solicitud de Evento", conservando la información ingresada.
- **G-4.** Permite intentar nuevamente el registro una vez restablecida la conexión, verificando previamente si la solicitud fue almacenada para evitar registros duplicados.

*Fin de la trayectoria.*


### Trayectoria alternativa H: Cancelar el registro de la solicitud

> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor decide abandonar el formulario sin registrar la solicitud del evento.

- **H-1.** Selecciona la opción [Cancelar] desde la pantalla **UI07** "Formulario de Solicitud de Evento", en lugar de enviar la solicitud.
- **H-2.** Interrumpe el proceso de registro sin guardar la información ingresada ni generar una nueva solicitud de evento.
- **H-3.** Redirige al actor a la pantalla UI03 "Menú Principal del Asistente" o UI25 "Menú Principal de Subdirección", según el rol correspondiente.

*Fin de la trayectoria.*


### Trayectoria alternativa I: Evento de varios días o sesiones

> **Condición:** Ocurre durante la definición de fechas y horarios cuando el actor necesita más de un bloque o el sistema detecta traslapes.

- **I-1.** El actor utiliza [Agregar nueva fecha] para incorporar cada sesión o subevento con su fecha y horas de inicio y finalización.
- **I-2.** El sistema considera cada fecha y horario como un bloque individual del mismo evento; permite varios bloques incluso el mismo día, sin superponer sus horarios.
- **I-3.** Si existe una coincidencia con otros eventos pendientes o aprobados en el mismo recinto, muestra **MSG-E-47** "El espacio ya se encuentra solicitado o reservado para el horario seleccionado.".
- **I-4.** El actor corrige los bloques afectados; se valida nuevamente y continúa con el registro conjunto de la solicitud.

*Fin de la trayectoria.*


### Trayectoria alternativa J: Solicitud con menos de 7 días de antelación (Evento Urgente)

> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el actor es Asistente y al menos uno de los bloques de fecha seleccionados tiene una antelación menor o igual a 7 días naturales respecto a la fecha actual (RN-14; Subdirección omite este paso por aprobación automática, RN-13).

- **J-1.** El sistema calcula la diferencia de días y clasifica la solicitud como urgente (`esUrgente = true`).
- **J-2.** Habilita en la pantalla **UI07** "Formulario de Solicitud de Evento" el campo obligatorio "Motivo de urgencia".
- **J-3.** Si el campo se encuentra vacío al intentar enviar, resalta el campo y muestra el mensaje **MSG-E-11** "Por favor, completa todos los campos obligatorios resaltados para continuar.".
- **J-4.** El actor captura la justificación de urgencia.
- **J-5.** El sistema persiste el motivo de urgencia asociado al evento para su posterior consulta prioritaria por parte de Subdirección en **UI11** y **UI12**.
- **J-6.** Continúa con el paso 7 de la trayectoria principal.

*Fin de la trayectoria.*
