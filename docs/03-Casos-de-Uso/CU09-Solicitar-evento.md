---
caso_de_uso: "CU09"
nombre: "Solicitar evento"
actor: "Asistente y Subdirección de Servicios Educativos"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU09: Solicitar evento

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al Asistente y al personal de Subdirección de Servicios Educativos registrar solicitudes de eventos dentro de la plataforma, proporcionando la información necesaria para su realización. Las solicitudes registradas por el Asistente quedarán pendientes de evaluación, mientras que aquellas registradas por Subdirección serán aprobadas automáticamente.

### 📋 Ficha de Especificación

| Caso de uso | CU-09 Solicitar evento |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Jaimes Jaramillo Santiago |
| **Actor:** | Asistente y Subdirección de Servicios Educativos. |
| **Propósito:** | Permitir al Asistente o al personal de Subdirección de Servicios Educativos registrar solicitudes de eventos, garantizando la validación de la información proporcionada y la asignación del estado correspondiente según el rol del actor. |
| **Entradas:** | • ID del usuario autenticado, nombre, descripción, justificación y alcance del evento (obligatorios).<br>• Póster del evento (opcional) y modalidad de acceso con boleto.<br>• Recinto solicitado y uno o más bloques de fecha, hora de inicio y hora de finalización; cada bloque representa un subevento del mismo evento.<br>• Tipo de solicitante y documento correspondiente (obligatorios cuando el actor es Asistente). |
| **Salidas:** | • Pantalla `UI07` "Formulario de Solicitud de Evento".<br>• Registro de la solicitud y sus subeventos como una sola actividad.<br>• Mensaje `MSG-I-08` "Operación realizada con éxito.".<br>• Estado "Pendiente de aprobación" si registra el Asistente, o "Aprobado" si registra Subdirección (`RN-13`). |
| **Precondiciones:** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Asistente o Subdirección de Servicios Educativos. |
| **Postcondiciones:** | • La información de la solicitud queda registrada correctamente en la base de datos.<br>• Si el actor es Asistente, la solicitud queda "Pendiente de aprobación" y recibe privilegios de Organizador exclusivos para ese evento conforme a `RN-02`.<br>• Si el actor es Subdirección de Servicios Educativos, la solicitud se registra directamente con el estado "Aprobado", conforme a la regla de negocio `RN-13`.<br>• Las solicitudes pendientes quedan disponibles para su consulta mediante el `CU-04` "Consultar solicitudes de eventos".<br>• Los eventos aprobados automáticamente por Subdirección quedan disponibles para su consulta mediante el `CU-06` "Consultar eventos aprobados".<br>• Si el actor cancela el proceso antes de enviar la solicitud, no se registra información del evento.<br>• La sesión del actor permanece activa. |
| **Errores:** | • `MSG-E-11` por campos obligatorios incompletos.<br>• `MSG-E-13` o `MSG-E-14` cuando la descripción sea inválida.<br>• `MSG-E-15` para alcance incorrecto.<br>• `MSG-E-36` para fechas u horarios inválidos.<br>• `MSG-E-47` si alguno de los bloques horarios se traslapa con reservas o solicitudes del mismo espacio.<br>• `MSG-E-08` por falla al guardar en la base de datos. |
| **Tipo:** | Primario para los actores Asistente y Subdirección de Servicios Educativos. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Solicitar un evento" desde `UI03` "Menú Principal del Asistente" o `UI25` "Menú Principal de Subdirección", según su rol.
2. ⚙️ **[Sistema]** Muestra `UI07` "Formulario de Solicitud de Evento" con nombre, descripción, justificación, alcance, póster, acceso con boleto, recinto y bloques de fecha, hora inicial y final.
3. ⚙️ **[Sistema]** Identifica el rol del actor autenticado y configura los campos adicionales del formulario según corresponda. `[Trayectoria A]` `[Trayectoria B]`
4. 👤 **[Actor]** Captura los datos del evento y define su primer bloque horario; si la actividad incluye más fechas o sesiones, utiliza `[Agregar nueva fecha]`. `[Trayectoria I]`
5. 👤 **[Actor]** Verifica la información proporcionada y selecciona la opción `[Enviar solicitud]`. `[Trayectoria H]`
6. ⚙️ **[Sistema]** Valida los campos obligatorios y las horas de todos los bloques, con fecha futura y finalización posterior al inicio. `[Trayectoria C]` `[Trayectoria D]` `[Trayectoria E]` `[Trayectoria F]`
7. ⚙️ **[Sistema]** Comprueba que cada subevento respete la disponibilidad del mismo espacio para los horarios de su bloque y no exista traslape con eventos pendientes o aprobados ni entre sus propios bloques (`RN-06`). `[Trayectoria I]`
8. ⚙️ **[Sistema]** Registra la solicitud y todos sus subeventos como un solo evento, asignando estado "Pendiente de aprobación" al Asistente o "Aprobado" a Subdirección (`RN-13`), y privilegios de Organizador del evento al solicitante (`RN-02`). `[Trayectoria G]`
9. ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-08` "Operación realizada con éxito." en la pantalla `UI07` "Formulario de Solicitud de Evento", indicando además el estado asignado a la solicitud registrada.
10. 👤 **[Actor]** Visualiza la confirmación del registro y finaliza la operación.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Solicitud realizada por el Asistente
> **Condición:** Ocurre en el paso 3 de la trayectoria principal cuando el sistema identifica que el actor autenticado tiene asignado el rol de Asistente.
- **A-1.** ⚙️ **[Sistema]** Habilita en la pantalla `UI07` "Formulario de Solicitud de Evento" el campo obligatorio "Tipo de solicitante", presentando las opciones Estudiante, Empresa y Externo.
- **A-2.** 👤 **[Actor]** Selecciona el tipo de solicitante que le corresponde.
- **A-3.** ⚙️ **[Sistema]** Identifica el tipo de solicitante seleccionado y solicita el documento correspondiente:
  - Si selecciona "Estudiante", solicita la credencial institucional de ESCOM/IPN.
  - Si selecciona "Empresa", solicita el acta constitutiva de la empresa.
  - Si selecciona "Externo", solicita una identificación oficial INE.
- **A-4.** 👤 **[Actor]** Adjunta el documento de identidad solicitado mediante el campo de carga de archivos.
- **A-5.** ⚙️ **[Sistema]** Conserva el tipo de solicitante y el documento adjunto como parte de la información que será validada y registrada con la solicitud.
- **A-6.** ⚙️ **[Sistema]** Retoma la ejecución desde el paso 4 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Solicitud realizada por Subdirección de Servicios Educativos
> **Condición:** Ocurre en el paso 3 de la trayectoria principal cuando el sistema identifica que el actor autenticado tiene asignado el rol de Subdirección de Servicios Educativos.
- **B-1.** ⚙️ **[Sistema]** Identifica que el actor cuenta con los permisos necesarios para registrar solicitudes de eventos que serán aprobadas automáticamente.
- **B-2.** ⚙️ **[Sistema]** Configura la pantalla `UI07` "Formulario de Solicitud de Evento", omitiendo los campos correspondientes al tipo de solicitante y documento de identidad, debido a que no son requeridos para este rol.
- **B-3.** ⚙️ **[Sistema]** Establece que, una vez completadas las validaciones del formulario, la solicitud será registrada directamente con el estado "Aprobado", conforme a la regla de negocio `RN-13`.
- **B-4.** ⚙️ **[Sistema]** Retoma la ejecución desde el paso 4 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Campos obligatorios incompletos
> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el actor intenta registrar una solicitud sin completar alguno de los campos obligatorios o, en el caso del Asistente, sin seleccionar el tipo de solicitante o adjuntar el documento requerido.
- **C-1.** ⚙️ **[Sistema]** Detecta que uno o más campos obligatorios del formulario se encuentran vacíos o que no se ha adjuntado el documento correspondiente cuando este es requerido.
- **C-2.** ⚙️ **[Sistema]** Detiene el proceso de registro y muestra el mensaje `MSG-E-11` "Por favor, completa todos los campos obligatorios resaltados para continuar.".
- **C-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI07` "Formulario de Solicitud de Evento", resaltando los campos que requieren información.
- **C-4.** 👤 **[Actor]** Completa los campos obligatorios y selecciona nuevamente la opción `[Enviar solicitud]`.
- **C-5.** ⚙️ **[Sistema]** Retoma la ejecución desde el paso 6 de la trayectoria principal para validar nuevamente la información ingresada.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Descripción del evento inválida
> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el actor deja vacío el campo correspondiente a la descripción del evento o ingresa un texto que excede el límite máximo de caracteres permitido.
- **D-1.** ⚙️ **[Sistema]** Detecta que la descripción del evento no cumple con las restricciones establecidas para el formulario.
- **D-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-13` "Dato requerido faltante. La descripción no puede estar vacía.", cuando no se haya proporcionado una descripción, o el mensaje `MSG-E-14` "La descripción excede el límite máximo de caracteres permitidos.", cuando se supere la longitud autorizada.
- **D-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI07` "Formulario de Solicitud de Evento", resaltando el campo correspondiente a la descripción.
- **D-4.** 👤 **[Actor]** Corrige la descripción del evento y selecciona nuevamente la opción `[Enviar solicitud]`.
- **D-5.** ⚙️ **[Sistema]** Retoma la ejecución desde el paso 6 de la trayectoria principal para validar la información corregida.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa E: Alcance del evento inválido
> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el sistema detecta que el alcance del evento no corresponde a alguna de las opciones permitidas.
- **E-1.** ⚙️ **[Sistema]** Detecta que el alcance seleccionado no cumple con las opciones establecidas: Público, Interno o Privado.
- **E-2.** ⚙️ **[Sistema]** Detiene el proceso de registro y muestra el mensaje `MSG-E-15` "Debe seleccionar un tipo de alcance válido para continuar.".
- **E-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI07` "Formulario de Solicitud de Evento", resaltando el campo correspondiente al alcance.
- **E-4.** 👤 **[Actor]** Selecciona un alcance válido y presiona nuevamente la opción `[Enviar solicitud]`.
- **E-5.** ⚙️ **[Sistema]** Retoma la ejecución desde el paso 6 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa F: Fecha u horario del evento inválido
> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el actor proporciona una fecha de realización anterior a la fecha actual o un horario de finalización que no es posterior a la hora de inicio.
- **F-1.** ⚙️ **[Sistema]** Detecta que la fecha u horario proporcionado no cumple con las condiciones establecidas para registrar un evento.
- **F-2.** ⚙️ **[Sistema]** Detiene el proceso de registro y muestra el mensaje `MSG-E-36` "La fecha u horario del evento no es válido. Verifique que la fecha sea futura y que la hora de finalización sea posterior a la hora de inicio.".
- **F-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI07` "Formulario de Solicitud de Evento", resaltando los campos de fecha y horario que requieren corrección.
- **F-4.** 👤 **[Actor]** Corrige la fecha u horario del evento y selecciona nuevamente la opción `[Enviar solicitud]`.
- **F-5.** ⚙️ **[Sistema]** Retoma la ejecución desde el paso 6 de la trayectoria principal para verificar nuevamente los datos de programación.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa G: Error de conexión con la base de datos
> **Condición:** Ocurre en el paso 8 de la trayectoria principal cuando el sistema no puede registrar correctamente la solicitud debido a una falla de conexión con la base de datos.
- **G-1.** ⚙️ **[Sistema]** Detecta una falla de conexión con la base de datos al intentar almacenar la información correspondiente a la solicitud del evento.
- **G-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos.", notificando al actor que no fue posible completar o verificar el registro de la solicitud.
- **G-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI07` "Formulario de Solicitud de Evento", conservando la información ingresada.
- **G-4.** ⚙️ **[Sistema]** Permite intentar nuevamente el registro una vez restablecida la conexión, verificando previamente si la solicitud fue almacenada para evitar registros duplicados.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa H: Cancelar el registro de la solicitud
> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor decide abandonar el formulario sin registrar la solicitud del evento.
- **H-1.** 👤 **[Actor]** Selecciona la opción `[Cancelar]` desde la pantalla `UI07` "Formulario de Solicitud de Evento", en lugar de enviar la solicitud.
- **H-2.** ⚙️ **[Sistema]** Interrumpe el proceso de registro sin guardar la información ingresada ni generar una nueva solicitud de evento.
- **H-3.** ⚙️ **[Sistema]** Redirige al actor a la pantalla `UI03` "Menú Principal del Asistente" o `UI25` "Menú Principal de Subdirección", según el rol correspondiente.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa I: Evento de varios días o sesiones
> **Condición:** Ocurre durante la definición de fechas y horarios cuando el actor necesita más de un bloque o el sistema detecta traslapes.
- **I-1.** 👤 **[Actor]** Utiliza `[Agregar nueva fecha]` para incorporar cada sesión o subevento con su fecha y horas de inicio y finalización.
- **I-2.** ⚙️ **[Sistema]** Considera cada fecha y horario como un bloque individual del mismo evento; permite varios bloques incluso el mismo día, sin superponer sus horarios.
- **I-3.** ⚙️ **[Sistema]** Si existe una coincidencia con otros eventos pendientes o aprobados en el mismo recinto, muestra `MSG-E-47` "El espacio ya se encuentra solicitado o reservado para el horario seleccionado.".
- **I-4.** 👤 **[Actor]** Corrige los bloques afectados; se valida nuevamente y continúa con el registro conjunto de la solicitud.

*`----- Fin de trayectoria.`*

