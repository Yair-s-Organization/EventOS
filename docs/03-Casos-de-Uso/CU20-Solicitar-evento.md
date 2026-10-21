---
caso_de_uso: "CU20"
nombre: "Solicitar evento (Asistente)"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU20: Solicitar evento (Asistente)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extendido por:** [[CU21-Agregar-etiquetas]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir que un Asistente solicite un evento de una o varias fechas a través de `UI07`. Los subeventos son bloques de fecha y horario de una misma solicitud, no casos de uso independientes.

### 📋 Ficha de Especificación

| Caso de uso | CU-20 Solicitar evento |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Jaimes Jaramillo Santiago. |
| **Actor:** | Asistente. |
| **Propósito:** | Permitir al Asistente solicitar un evento indicando su contenido, beneficio para ESCOM/IPN y espacio con fechas y horarios disponibles, incluyendo varias sesiones o subeventos cuando la actividad dure varios días. |
| **Entradas:** | • ID del usuario autenticado.<br>• Nombre, descripción, justificación del beneficio para ESCOM/IPN, alcance Público/Interno/Privado, póster opcional y tipo de solicitante.<br>• Documento de identidad requerido según tipo Estudiante, Empresa o Externo.<br>• Modalidad de acceso con boleto, recinto solicitado y uno o varios bloques de fecha, hora de inicio y finalización (subeventos).<br>• Etiquetas temáticas mediante `CU-21`, cuando el actor decida agregarlas. |
| **Salidas:** | • Pantalla `UI07` "Formulario de Solicitud de Evento".<br>• Registro del evento y sus subeventos o bloques horarios en estado "Pendiente de aprobación".<br>• Mensaje `MSG-I-08` "Operación realizada con éxito.".<br>• Privilegios de Organizador exclusivos para la solicitud creada, conforme a `RN-02`. |
| **Precondiciones:** | • El usuario cuenta con sesión activa y cuenta registrada (`CU-01`).<br>• Los espacios físicos solicitados están disponibles para recibir solicitudes. |
| **Postcondiciones:** | • Se guarda una solicitud con sus bloques horarios y el alcance seleccionado.<br>• No se reserva dos veces el mismo espacio en horarios traslapados (`RN-06`).<br>• El evento permanece pendiente hasta la evaluación de Subdirección; la creación por el Asistente no lo aprueba automáticamente. |
| **Errores:** | • `MSG-E-11` ante campos obligatorios incompletos.<br>• `MSG-E-13` o `MSG-E-14` por descripción vacía o demasiado extensa.<br>• `MSG-E-15` si el alcance no es válido.<br>• `MSG-E-36` ante fechas u horarios inválidos.<br>• `MSG-E-47` ante un traslape horario en el recinto solicitado.<br>• `MSG-E-08` si falla el registro en la base de datos. |
| **Tipo:** | Primario para el actor Asistente. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** El Asistente selecciona `[Solicitar evento]` desde `UI03` "Menú Principal del Asistente".
2. ⚙️ **[Sistema]** Muestra `UI07` "Formulario de Solicitud de Evento" con nombre, descripción, justificación, alcance, póster, acceso con boleto, fecha, hora de inicio, hora de finalización y espacio deseado.
3. 👤 **[Actor]** Proporciona los datos del evento, selecciona su tipo de solicitante y adjunta el documento de identidad que corresponda.
4. 👤 **[Actor]** Define el primer bloque de fecha y horas, selecciona el espacio solicitado y la modalidad de acceso. Si necesita más sesiones o días, utiliza `[Agregar nueva fecha]`. `[Trayectoria A]`
5. 👤 **[Actor]** Puede incorporar etiquetas temáticas por medio de `CU-21` "Agregar etiquetas". `[Trayectoria B]`
6. 👤 **[Actor]** Selecciona `[Solicitar Evento]`.
7. ⚙️ **[Sistema]** Revisa datos obligatorios y que cada bloque tenga fecha futura y hora de fin posterior a la de inicio. `[Trayectoria C]`
8. ⚙️ **[Sistema]** Comprueba que ningún bloque horario se traslape con eventos aprobados o pendientes en el espacio seleccionado, y que no existan superposiciones entre los bloques del propio evento (`RN-06`). `[Trayectoria D]`
9. ⚙️ **[Sistema]** Registra la solicitud y todos sus bloques como parte de un mismo evento, asigna estado "Pendiente de aprobación" y privilegios de Organizador exclusivos para ese evento. `[Trayectoria E]`
10. ⚙️ **[Sistema]** Muestra `MSG-I-08` "Operación realizada con éxito." en `UI07` y finaliza la solicitud.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Agregar sesiones o subeventos
> **Condición:** Ocurre en el paso 4 cuando el evento incluye más de una sesión en días distintos o varias sesiones el mismo día.
- **A-1.** 👤 **[Actor]** Presiona `[Agregar nueva fecha]` para añadir otro bloque con fecha, horario y espacio deseado.
- **A-2.** ⚙️ **[Sistema]** Añade una fila de captura sin crear otra solicitud independiente.
- **A-3.** 👤 **[Actor]** Completa la fecha y las horas del nuevo subevento; puede repetir la operación tantas veces como sesiones requiera.
- **A-4.** ⚙️ **[Sistema]** Cada bloque se valida por separado y también frente a los demás bloques; regresa al paso 5 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Asignar etiquetas al evento
> **Condición:** Ocurre en el paso 5 cuando el Asistente decide clasificar el evento con etiquetas.
- **B-1.** ⚙️ **[Sistema]** Permite ejecutar `CU-21` "Agregar etiquetas" mediante `UI30` "Agregar Etiquetas al Evento".
- **B-2.** ⚙️ **[Sistema]** Conserva las etiquetas elegidas en la solicitud y retorna al paso 6 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Datos o fecha inválidos
> **Condición:** En el paso 7 hay campos obligatorios vacíos, descripción no válida, alcance inválido o algún horario incoherente.
- **C-1.** ⚙️ **[Sistema]** Muestra `MSG-E-11`, `MSG-E-13`, `MSG-E-14`, `MSG-E-15` o `MSG-E-36` según el campo que originó la validación.
- **C-2.** ⚙️ **[Sistema]** Mantiene `UI07` y resalta los datos por corregir; no registra la solicitud.
- **C-3.** ⚙️ **[Sistema]** Retoma el paso 6 después de la corrección.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Conflicto en un bloque de horario
> **Condición:** En el paso 8 uno o más subeventos coinciden con una solicitud pendiente o aprobada para el mismo espacio o entre sí.
- **D-1.** ⚙️ **[Sistema]** Muestra `MSG-E-47` "El espacio ya se encuentra solicitado o reservado para el horario seleccionado.".
- **D-2.** ⚙️ **[Sistema]** Señala el bloque afectado y permite modificar su fecha, hora o recinto.
- **D-3.** ⚙️ **[Sistema]** Retoma la validación del paso 8, sin guardar parcialmente los subeventos.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa E: Error al guardar la solicitud
> **Condición:** Ocurre en el paso 9 cuando no puede guardarse el evento y sus bloques.
- **E-1.** ⚙️ **[Sistema]** Muestra `MSG-E-08` "Error de conexión con la base de datos.".
- **E-2.** ⚙️ **[Sistema]** Conserva la información ingresada y evita guardar solo una parte de las sesiones.

*`----- Fin de trayectoria.`*

