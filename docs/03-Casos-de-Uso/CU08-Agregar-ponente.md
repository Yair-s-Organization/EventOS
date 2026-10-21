---
caso_de_uso: "CU08"
nombre: "Agregar ponente"
actor: "Subdirección de Servicios Educativos y Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU08: Agregar ponente (extend de CU-06 y CU-27)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU06-Consultar-eventos-aprobados]] / [[CU27-Modificar-detalles-de-un-evento]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al personal de Subdirección de Servicios Educativos y al Organizador agregar uno o más ponentes a un evento previamente aprobado, mediante el registro de su información personal y los datos relacionados con su participación, garantizando que los ponentes queden correctamente vinculados al evento seleccionado.

### 📋 Ficha de Especificación

| Caso de uso | CU-08 Agregar ponente (extend de CU-06 y CU-27) |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Vargas Rodriguez Leonardo |
| **Actor:** | Subdirección de Servicios Educativos y Organizador. |
| **Propósito:** | Permitir al personal de Subdirección de Servicios Educativos y al Organizador registrar y asociar ponentes a eventos previamente aprobados, facilitando la organización de las actividades académicas y garantizando que la información de los participantes quede almacenada correctamente en el sistema. |
| **Entradas:** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• ID del evento aprobado seleccionado.<br>• Nombre completo del ponente (obligatorio).<br>• Correo electrónico del ponente (obligatorio).<br>• Institución u organización de procedencia (opcional).<br>• Trayectoria académica/profesional y al menos un enlace de contacto del ponente (obligatorios, `RN-30`). |
| **Salidas:** | • Pantalla `UI29` "Agregar Ponente al Evento".<br>• Mensaje informativo `MSG-I-08` "Operación realizada con éxito.", cuando se complete correctamente el registro del ponente.<br>• Información del ponente registrada y asociada al evento seleccionado.<br>• Actualización de la información de los ponentes vinculados al evento. |
| **Precondiciones:** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Subdirección de Servicios Educativos u Organizador del evento.<br>• El evento debe encontrarse registrado en el sistema con el estatus "Aprobado".<br>• El evento no debe haber concluido ni encontrarse cancelado.<br>• El actor debe haber seleccionado un evento aprobado desde la pantalla `UI13` "Panel de Eventos Aprobados" (`CU-06`) o desde `UI15` "Panel de Administración y Detalles del Evento" (`CU-27`). |
| **Postcondiciones:** | • La información del ponente queda registrada correctamente en la base de datos.<br>• El ponente queda asociado al evento aprobado seleccionado.<br>• El evento conserva su estatus "Aprobado", sin modificar su fecha, horario o recinto asignado.<br>• El sistema actualiza la información de los ponentes vinculados al evento.<br>• Si el actor cancela la operación antes de guardar los datos, no se registra ninguna modificación.<br>• La sesión del actor permanece activa. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-11` "Por favor, completa todos los campos obligatorios resaltados para continuar.", cuando el actor omita alguno de los datos obligatorios del ponente.<br>• Se mostrará el mensaje `MSG-E-21` "Advertencia: Ingrese un correo válido.", cuando el correo electrónico proporcionado no cumpla con el formato establecido.<br>• Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando el sistema no pueda consultar o registrar correctamente la información del ponente.<br>• Se mostrará el mensaje `MSG-E-06` "Evento no encontrado o cancelado.", cuando el evento seleccionado no exista o haya sido cancelado.<br>• Se mostrará el mensaje `MSG-E-01` "El evento ya ha concluido.", cuando se intente agregar un ponente a un evento que ya finalizó.<br>• Se mostrará el mensaje `MSG-E-34` "El ponente ya se encuentra registrado en el evento seleccionado.", cuando se intente vincular nuevamente al mismo ponente.<br>• Se mostrará el mensaje `MSG-E-35` "No es posible agregar ponentes a un evento que no se encuentra aprobado.", cuando el evento no cumpla con el estado requerido. |
| **Tipo:** | Secundario para los actores Subdirección de Servicios Educativos y Organizador. Extiende el `CU-06` "Consultar eventos aprobados" y el `CU-27` "Modificar detalles de un evento", conforme a la relación `<<extend>>`. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona un evento previamente aprobado desde la pantalla `UI13` "Panel de Eventos Aprobados" (o `UI15` si es Organizador) y elige la opción `[Agregar ponente]`.
2. ⚙️ **[Sistema]** Consulta en la base de datos la información del evento seleccionado y verifica que conserve el estatus "Aprobado" y que no haya concluido. `[Trayectoria A]` `[Trayectoria B]` `[Trayectoria C]`
3. ⚙️ **[Sistema]** Muestra la pantalla `UI29` "Agregar Ponente al Evento", presentando un formulario con los campos correspondientes al nombre completo, correo electrónico, institución de procedencia, trayectoria académica/profesional y enlace de contacto del ponente.
4. 👤 **[Actor]** Ingresa la información del ponente en los campos correspondientes y selecciona la opción `[Guardar]`. `[Trayectoria G]`
5. ⚙️ **[Sistema]** Valida que los campos obligatorios contengan información, que el correo electrónico ingresado cumpla con el formato establecido y que se proporcionen trayectoria académica/profesional y enlace de contacto. `[Trayectoria D]` `[Trayectoria E]`
6. ⚙️ **[Sistema]** Consulta en la base de datos si el ponente ya se encuentra asociado al evento seleccionado, utilizando su correo electrónico como criterio de identificación. `[Trayectoria A]` `[Trayectoria F]`
7. ⚙️ **[Sistema]** Verifica nuevamente que el evento conserve las condiciones necesarias para agregar ponentes y registra la información proporcionada, asociando el ponente al evento seleccionado. `[Trayectoria A]` `[Trayectoria B]` `[Trayectoria C]`
8. ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-08` "Operación realizada con éxito." en la pantalla `UI29` "Agregar Ponente al Evento", confirmando que el ponente fue registrado correctamente.
9. ⚙️ **[Sistema]** Actualiza la información de los ponentes asociados al evento, conservando el estatus "Aprobado" del evento seleccionado.
10. 👤 **[Actor]** Visualiza la confirmación del registro y finaliza la operación, pudiendo regresar a la pantalla anterior (`UI13` o `UI15`).

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Error de conexión con la base de datos
> **Condición:** Ocurre en los pasos 2, 6 o 7 de la trayectoria principal cuando el sistema no puede consultar o registrar correctamente la información debido a una falla de conexión con la base de datos.
- **A-1.** ⚙️ **[Sistema]** Detecta una falla de conexión con la base de datos al intentar consultar la información del evento, verificar la existencia del ponente o guardar los datos proporcionados.
- **A-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos.", notificando al actor que no fue posible completar o verificar la operación.
- **A-3.** ⚙️ **[Sistema]** Si el error ocurre antes de mostrar el formulario, mantiene al actor en la pantalla anterior (`UI13` o `UI15`). Si ocurre durante el registro, mantiene la pantalla `UI29` "Agregar Ponente al Evento", conservando los datos ingresados.
- **A-4.** ⚙️ **[Sistema]** Permite al actor intentar nuevamente la operación una vez restablecida la conexión, verificando previamente si el registro se completó para evitar duplicidades.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Evento no encontrado o cancelado
> **Condición:** Ocurre en los pasos 2 o 7 de la trayectoria principal cuando el sistema identifica que el evento seleccionado no existe o ha sido cancelado.
- **B-1.** ⚙️ **[Sistema]** Detecta que el evento seleccionado no se encuentra disponible debido a que fue cancelado o no existe en la base de datos.
- **B-2.** ⚙️ **[Sistema]** Impide continuar con el registro del ponente para evitar asociaciones con eventos inexistentes o cancelados.
- **B-3.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-06` "Evento no encontrado o cancelado.".
- **B-4.** ⚙️ **[Sistema]** Actualiza el listado de eventos aprobados y regresa al actor a la pantalla correspondiente (`UI13` o `UI15`).

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Evento no disponible para agregar ponentes
> **Condición:** Ocurre en los pasos 2 o 7 de la trayectoria principal cuando el sistema identifica que el evento seleccionado no se encuentra aprobado o ya ha concluido.
- **C-1.** ⚙️ **[Sistema]** Detecta que el evento seleccionado no cumple con las condiciones necesarias para registrar nuevos ponentes.
- **C-2.** ⚙️ **[Sistema]** Impide continuar con la operación para evitar modificaciones sobre eventos que no se encuentran habilitados para incorporar ponentes.
- **C-3.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-35` "No es posible agregar ponentes a un evento que no se encuentra aprobado.", cuando el evento no tenga el estatus requerido, o el mensaje `MSG-E-01` "El evento ya ha concluido.", cuando el evento haya finalizado.
- **C-4.** ⚙️ **[Sistema]** Regresa al actor a la pantalla anterior (`UI13` o `UI15`), sin realizar modificaciones a la información del evento.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Campos obligatorios incompletos
> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor intenta registrar un ponente sin completar alguno de los campos obligatorios.
- **D-1.** ⚙️ **[Sistema]** Detecta que uno o más campos obligatorios del formulario se encuentran vacíos o contienen únicamente espacios en blanco.
- **D-2.** ⚙️ **[Sistema]** Detiene el proceso de registro y muestra el mensaje `MSG-E-11` "Por favor, completa todos los campos obligatorios resaltados para continuar.".
- **D-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI29` "Agregar Ponente al Evento", resaltando los campos que requieren información.
- **D-4.** 👤 **[Actor]** Completa los campos obligatorios y selecciona nuevamente la opción `[Guardar]`.
- **D-5.** ⚙️ **[Sistema]** Retoma la ejecución desde el paso 5 de la trayectoria principal para validar la información proporcionada.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa E: Formato de correo electrónico inválido
> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor proporciona un correo electrónico que no cumple con el formato establecido.
- **E-1.** ⚙️ **[Sistema]** Detecta que el correo electrónico ingresado no cumple con el formato requerido.
- **E-2.** ⚙️ **[Sistema]** Detiene el proceso de registro y muestra el mensaje `MSG-E-21` "Advertencia: Ingrese un correo válido.".
- **E-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI29` "Agregar Ponente al Evento", resaltando el campo correspondiente al correo electrónico.
- **E-4.** 👤 **[Actor]** Corrige el correo electrónico proporcionado y selecciona nuevamente la opción `[Guardar]`.
- **E-5.** ⚙️ **[Sistema]** Retoma la ejecución desde el paso 5 de la trayectoria principal para validar nuevamente la información ingresada.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa F: Ponente previamente registrado en el evento
> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el sistema identifica que el ponente proporcionado ya se encuentra asociado al evento seleccionado.
- **F-1.** ⚙️ **[Sistema]** Detecta que existe un registro previo del ponente vinculado al mismo evento, mediante la coincidencia de su correo electrónico.
- **F-2.** ⚙️ **[Sistema]** Impide realizar nuevamente el registro para evitar asociaciones duplicadas del ponente con el evento.
- **F-3.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-34` "El ponente ya se encuentra registrado en el evento seleccionado.".
- **F-4.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI29` "Agregar Ponente al Evento", conservando los datos proporcionados.
- **F-5.** 👤 **[Actor]** Puede modificar la información ingresada para registrar un ponente diferente o abandonar la operación.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa G: Cancelar el registro del ponente
> **Condición:** Ocurre en el paso 4 de la trayectoria principal cuando el actor decide abandonar el registro del ponente antes de guardar la información.
- **G-1.** 👤 **[Actor]** Selecciona la opción `[Cancelar]` desde la pantalla `UI29` "Agregar Ponente al Evento".
- **G-2.** ⚙️ **[Sistema]** Interrumpe el proceso de registro sin guardar la información ingresada ni realizar modificaciones a los ponentes asociados al evento.
- **G-3.** ⚙️ **[Sistema]** Regresa al actor a la pantalla anterior (`UI13` o `UI15`), conservando el estado original del evento seleccionado.

*`----- Fin de trayectoria.`*

