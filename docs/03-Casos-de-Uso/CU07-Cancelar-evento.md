---
caso_de_uso: "CU07"
nombre: "Cancelar evento"
actor: "Subdirección de Servicios Educativos"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU07: Cancelar evento (extend de CU-06)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU06-Consultar-eventos-aprobados]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al personal de Subdirección de Servicios Educativos cancelar un evento previamente aprobado, mediante el registro obligatorio de un motivo de cancelación y la confirmación de la operación, garantizando la liberación del espacio físico, la invalidación de los boletos emitidos y la notificación a los asistentes registrados.

### 📋 Ficha de Especificación

| Caso de uso | CU-07 Cancelar evento (extend de CU-06) |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Benitez Alvarez Efrain. |
| **Actor:** | Subdirección de Servicios Educativos. |
| **Propósito:** | Permitir al personal de Subdirección de Servicios Educativos cancelar un evento aprobado de forma controlada, garantizando la actualización de su estado, la liberación del espacio físico asignado y la notificación a los asistentes registrados. |
| **Entradas:** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• ID del evento seleccionado para su cancelación.<br>• Motivo de cancelación (obligatorio).<br>• Confirmación explícita de la cancelación del evento. |
| **Salidas:** | • Mensaje de confirmación `MSG-P-01` "¿Desea confirmar la cancelación del evento seleccionado?".<br>• Mensaje informativo `MSG-I-02` "El evento se ha cancelado exitosamente.".<br>• Actualización del estado del evento a "Cancelado".<br>• Liberación de la disponibilidad del espacio físico previamente reservado.<br>• Invalidación de los boletos digitales y códigos QR asociados al evento.<br>• Notificación en el apartado de la aplicación a los asistentes registrados, incluyendo el motivo de cancelación.<br>• Registro de la cancelación en la bitácora histórica del sistema. |
| **Precondiciones:** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Subdirección de Servicios Educativos.<br>• El evento debe encontrarse registrado en el sistema con el estatus "Aprobado".<br>• El evento debe contar con una reserva de espacio físico previamente autorizada.<br>• El actor debe haber seleccionado un evento aprobado desde la pantalla `UI13` "Panel de Eventos Aprobados", mediante el `CU-06` "Consultar eventos aprobados". |
| **Postcondiciones:** | • El estado del evento cambia de "Aprobado" a "Cancelado" cuando la operación se completa correctamente.<br>• El espacio físico asignado al evento queda disponible para nuevas solicitudes durante la fecha y horario anteriormente reservados.<br>• Los boletos digitales y códigos QR emitidos para el evento quedan invalidados.<br>• El sistema genera notificaciones en el apartado de la aplicación para los asistentes registrados, informando el motivo de la cancelación.<br>• La cancelación queda registrada en la bitácora histórica del sistema.<br>• El evento cancelado deja de aparecer en el listado de eventos aprobados.<br>• Si el actor cancela la operación antes de confirmarla, el evento conserva su estado original y no se modifica su información.<br>• La sesión del actor permanece activa. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-11` "Por favor, completa todos los campos obligatorios resaltados para continuar.", cuando el actor no ingrese el motivo de cancelación.<br>• Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando el sistema no pueda recuperar o actualizar la información necesaria para cancelar el evento.<br>• Se mostrará el mensaje `MSG-E-06` "Evento no encontrado o cancelado.", cuando el evento seleccionado ya no exista o haya sido cancelado previamente.<br>• Se mostrará el mensaje `MSG-E-01` "El evento ya ha concluido.", cuando se intente cancelar un evento que ya terminó. |
| **Tipo:** | Secundario para el actor Subdirección de Servicios Educativos. Extiende el `CU-06` "Consultar eventos aprobados", conforme a la relación `<<extend>>` establecida en el diagrama de casos de uso. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona un evento previamente aprobado desde la pantalla `UI13` "Panel de Eventos Aprobados" y elige la opción `[Cancelar evento]`.
2. ⚙️ **[Sistema]** Consulta en la base de datos la información del evento seleccionado y verifica que conserve el estatus "Aprobado" y que no haya concluido. `[Trayectoria C]` `[Trayectoria D]`
3. ⚙️ **[Sistema]** Muestra un formulario de cancelación dentro de la pantalla `UI13` "Panel de Eventos Aprobados", solicitando al actor ingresar obligatoriamente el motivo de cancelación.
4. 👤 **[Actor]** Ingresa el motivo de cancelación del evento y selecciona la opción `[Continuar]`.
5. ⚙️ **[Sistema]** Valida que el campo del motivo de cancelación contenga información y no se encuentre vacío. `[Trayectoria A]`
6. ⚙️ **[Sistema]** Muestra el mensaje de confirmación `MSG-P-01` "¿Desea confirmar la cancelación del evento seleccionado?", advirtiendo que la operación es irreversible y presentando las opciones `[Aceptar]` y `[Cancelar]`. `[Trayectoria B]`
7. 👤 **[Actor]** Confirma la cancelación del evento seleccionando el botón `[Aceptar]`. `[Trayectoria B]`
8. ⚙️ **[Sistema]** Verifica nuevamente que el evento continúe disponible para su cancelación y conserve el estatus "Aprobado". `[Trayectoria C]` `[Trayectoria D]`
9. ⚙️ **[Sistema]** Actualiza de manera conjunta el estado del evento de "Aprobado" a "Cancelado", libera la reserva del espacio físico asignado, invalida los boletos digitales y códigos QR asociados, registra la operación en la bitácora histórica del sistema y genera las notificaciones de cancelación en la aplicación para los asistentes. `[Trayectoria C]`
10. ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-02` "El evento se ha cancelado exitosamente." y actualiza el listado de la pantalla `UI13` "Panel de Eventos Aprobados", retirando el evento cancelado.
11. 👤 **[Actor]** Visualiza la confirmación de la cancelación realizada.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Motivo de cancelación no proporcionado
> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor intenta continuar con la cancelación sin ingresar el motivo obligatorio.
- **A-1.** ⚙️ **[Sistema]** Detecta que el campo correspondiente al motivo de cancelación se encuentra vacío o contiene únicamente espacios en blanco.
- **A-2.** ⚙️ **[Sistema]** Detiene el proceso de cancelación y muestra el mensaje `MSG-E-11` "Por favor, completa todos los campos obligatorios resaltados para continuar.".
- **A-3.** ⚙️ **[Sistema]** Mantiene el formulario de cancelación en la pantalla `UI13` "Panel de Eventos Aprobados", resaltando el campo obligatorio que debe completarse.
- **A-4.** 👤 **[Actor]** Ingresa el motivo correspondiente y selecciona nuevamente la opción `[Continuar]`.
- **A-5.** ⚙️ **[Sistema]** Retoma la ejecución desde el paso 5 de la trayectoria principal para validar la información ingresada.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Cancelar la operación de cancelación del evento
> **Condición:** Ocurre en los pasos 6 o 7 de la trayectoria principal cuando el actor decide no confirmar la cancelación del evento.
- **B-1.** 👤 **[Actor]** Selecciona el botón `[Cancelar]` o cierra la ventana de confirmación mostrada mediante el mensaje `MSG-P-01`.
- **B-2.** ⚙️ **[Sistema]** Interrumpe la operación de cancelación sin realizar modificaciones a la información del evento.
- **B-3.** ⚙️ **[Sistema]** Mantiene el evento con el estatus "Aprobado", conservando la reserva del espacio físico y la validez de los boletos emitidos.
- **B-4.** ⚙️ **[Sistema]** Regresa al formulario de cancelación dentro de la pantalla `UI13` "Panel de Eventos Aprobados", permitiendo al actor modificar el motivo ingresado o abandonar la operación.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Error de conexión con la base de datos
> **Condición:** Ocurre en los pasos 2, 8 o 9 de la trayectoria principal cuando el sistema presenta una falla de conexión con la base de datos que impide consultar o actualizar correctamente la información del evento.
- **C-1.** ⚙️ **[Sistema]** Detecta una falla de conexión con la base de datos al intentar consultar o actualizar la información necesaria para cancelar el evento.
- **C-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos.", notificando al actor que no fue posible completar o verificar la operación.
- **C-3.** ⚙️ **[Sistema]** Si la operación de cancelación aún no ha sido confirmada y registrada, mantiene el evento sin modificaciones. Si la falla ocurre durante la actualización, verifica el resultado de la transacción antes de permitir un nuevo intento, evitando cancelaciones duplicadas o inconsistencias.
- **C-4.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI13` "Panel de Eventos Aprobados", permitiéndole volver a consultar el estado del evento cuando se restablezca la conexión.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Evento no disponible para cancelación
> **Condición:** Ocurre en los pasos 2 u 8 de la trayectoria principal cuando el sistema detecta que el evento seleccionado ya fue cancelado, no existe o ha concluido.
- **D-1.** ⚙️ **[Sistema]** Identifica que el evento seleccionado no cumple con las condiciones necesarias para realizar su cancelación.
- **D-2.** ⚙️ **[Sistema]** Impide continuar con la operación para evitar modificaciones sobre un evento que ya no puede ser cancelado.
- **D-3.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-06` "Evento no encontrado o cancelado.", cuando el evento no exista o haya sido cancelado previamente, o el mensaje `MSG-E-01` "El evento ya ha concluido.", cuando el evento haya finalizado.
- **D-4.** ⚙️ **[Sistema]** Actualiza el listado de eventos aprobados y mantiene al actor en la pantalla `UI13` "Panel de Eventos Aprobados".

*`----- Fin de trayectoria.`*

