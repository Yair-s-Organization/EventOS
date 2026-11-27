---
caso_de_uso: "CU-10"
nombre: "Agregar ponente (extend de CU-08)"
actor: "Subdirección de Servicios Educativos."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-10: Agregar ponente (extend de CU-08)

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** Permitir al personal de Subdirección de Servicios Educativos agregar uno o más ponentes a un evento previamente aprobado, mediante el registro de su información personal y los datos relacionados con su participación, garantizando que los ponentes queden correctamente vinculados al evento seleccionado.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-10 Agregar ponente (extend de CU-08)** |
| **Autor** | Vargas Rodriguez Leonardo |
| **Actor** | Subdirección de Servicios Educativos. |
| **Propósito** | Permitir al personal de Subdirección de Servicios Educativos registrar y asociar ponentes a eventos previamente aprobados, facilitando la organización de las actividades académicas y garantizando que la información de los participantes quede almacenada correctamente en el sistema. |
| **Entradas** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• ID del evento aprobado seleccionado.<br>• Nombre completo del ponente (obligatorio).<br>• Correo electrónico del ponente (obligatorio).<br>• Institución u organización de procedencia (opcional).<br>• Trayectoria académica/profesional y al menos un enlace de contacto del ponente (obligatorios, RN-30). |
| **Salidas** | • Sección/modal de Ponentes integrada en **UI16** "Formulario de Modificación de Evento" (accesible desde `UI13` o `UI15`).<br>• Mensaje informativo **MSG-I-08** "Operación realizada con éxito.", cuando se complete correctamente el registro del ponente.<br>• Información del ponente registrada y asociada al evento seleccionado.<br>• Actualización de la información de los ponentes vinculados al evento. |
| **Precondiciones** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el CU-01 "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Subdirección de Servicios Educativos (o Organizador sobre evento propio desde `UI15`/`UI16`).<br>• El evento debe encontrarse registrado en el sistema con el estatus "Aprobado".<br>• El evento no debe haber concluido ni encontrarse cancelado.<br>• El actor debe haber seleccionado un evento aprobado desde la pantalla **UI13** "Panel de Eventos Aprobados" (`CU-08`) o **UI15** (`CU-24`). |
| **Postcondiciones** | • La información del ponente queda registrada correctamente en la base de datos.<br>• El ponente queda asociado al evento aprobado seleccionado.<br>• El evento conserva su estatus "Aprobado", sin modificar su fecha, horario o recinto asignado.<br>• El sistema actualiza la información de los ponentes vinculados al evento.<br>• Si el actor cancela la operación antes de guardar los datos, no se registra ninguna modificación.<br>• La sesión del actor permanece activa. |
| **Errores** | • Se mostrará el mensaje **MSG-E-11** "Por favor, completa todos los campos obligatorios resaltados para continuar.", cuando el actor omita alguno de los datos obligatorios del ponente.<br>• Se mostrará el mensaje **MSG-E-21** "Advertencia: Ingrese un correo válido.", cuando el correo electrónico proporcionado no cumpla con el formato establecido.<br>• Se mostrará el mensaje **MSG-E-08** "Error de conexión con la base de datos.", cuando el sistema no pueda consultar o registrar correctamente la información del ponente.<br>• Se mostrará el mensaje **MSG-E-06** "Evento no encontrado o cancelado.", cuando el evento seleccionado no exista o haya sido cancelado.<br>• Se mostrará el mensaje **MSG-E-01** "El evento ya ha concluido.", cuando se intente agregar un ponente a un evento que ya finalizó.<br>• Se mostrará el mensaje **MSG-E-34** "El ponente ya se encuentra registrado en el evento seleccionado.", cuando se intente vincular nuevamente al mismo ponente.<br>• Se mostrará el mensaje **MSG-E-35** "No es posible agregar ponentes a un evento que no se encuentra aprobado.", cuando el evento no cumpla con el estado requerido. |
| **Tipo** | Secundario para el actor Subdirección de Servicios Educativos. Extiende el CU-08 "Consultar eventos aprobados", conforme a la relación `<<extend>>` establecida en el diagrama de casos de uso. |


### Trayectoria Principal

1. Selecciona un evento previamente aprobado desde **UI13** "Panel de Eventos Aprobados" (o **UI15** en el caso del Organizador) y elige la opción [Agregar ponente].
2. Consulta en la base de datos la información del evento seleccionado y verifica que conserve el estatus "Aprobado" y que no haya concluido. [Trayectoria A] [Trayectoria B] [Trayectoria C]
3. Muestra el formulario/modal de ponentes integrado en **UI16** "Formulario de Modificación de Evento", presentando los campos correspondientes al nombre completo, correo electrónico, institución de procedencia, trayectoria académica/profesional y enlace de contacto del ponente.
4. Ingresa la información del ponente en los campos correspondientes y selecciona la opción [Guardar]. [Trayectoria G]
5. Valida que los campos obligatorios contengan información y que el correo electrónico ingresado cumpla con el formato establecido y que se proporcionen trayectoria académica/profesional y enlace de contacto. [Trayectoria D] [Trayectoria E]
6. Consulta en la base de datos si el ponente ya se encuentra asociado al evento seleccionado, utilizando su correo electrónico como criterio de identificación. [Trayectoria A] [Trayectoria F]
7. Verifica nuevamente que el evento conserve las condiciones necesarias para agregar ponentes y registra la información proporcionada, asociando el ponente al evento seleccionado. [Trayectoria A] [Trayectoria B] [Trayectoria C]
8. Muestra el mensaje **MSG-I-08** "Operación realizada con éxito." en **UI16** "Formulario de Modificación de Evento", confirmando que el ponente fue registrado correctamente.
9. Actualiza la información de los ponentes asociados al evento, conservando el estatus "Aprobado" del evento seleccionado.
10. Visualiza la confirmación del registro y finaliza la operación, pudiendo regresar a **UI13** "Panel de Eventos Aprobados" (o **UI15**).

*Fin de la trayectoria.*


### Trayectoria alternativa A: Error de conexión con la base de datos

> **Condición:** Ocurre en los pasos 2, 6 u 7 de la trayectoria principal cuando el sistema no puede consultar o registrar correctamente la información debido a una falla de conexión con la base de datos.

- **A-1.** Detecta una falla de conexión con la base de datos al intentar consultar la información del evento, verificar la existencia del ponente o guardar los datos proporcionados.
- **A-2.** Muestra el mensaje **MSG-E-08** "Error de conexión con la base de datos.", notificando al actor que no fue posible completar o verificar la operación.
- **A-3.** Si el error ocurre antes de mostrar el formulario, mantiene al actor en la pantalla **UI13** "Panel de Eventos Aprobados". Si ocurre durante el registro, mantiene el formulario de ponentes en **UI16** "Formulario de Modificación de Evento", conservando los datos ingresados.
- **A-4.** Permite al actor intentar nuevamente la operación una vez restablecida la conexión, verificando previamente si el registro se completó para evitar duplicidades.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Evento no encontrado o cancelado

> **Condición:** Ocurre en los pasos 2 o 7 de la trayectoria principal cuando el sistema identifica que el evento seleccionado no existe o ha sido cancelado.

- **B-1.** Detecta que el evento seleccionado no se encuentra disponible debido a que fue cancelado o no existe en la base de datos.
- **B-2.** Impide continuar con el registro del ponente para evitar asociaciones con eventos inexistentes o cancelados.
- **B-3.** Muestra el mensaje **MSG-E-06** "Evento no encontrado o cancelado.".
- **B-4.** Actualiza el listado de eventos aprobados y regresa al actor a la pantalla **UI13** "Panel de Eventos Aprobados".

*Fin de la trayectoria.*


### Trayectoria alternativa C: Evento no disponible para agregar ponentes

> **Condición:** Ocurre en los pasos 2 o 7 de la trayectoria principal cuando el sistema identifica que el evento seleccionado no se encuentra aprobado o ya ha concluido.

- **C-1.** Detecta que el evento seleccionado no cumple con las condiciones necesarias para registrar nuevos ponentes.
- **C-2.** Impide continuar con la operación para evitar modificaciones sobre eventos que no se encuentran habilitados para incorporar ponentes.
- **C-3.** Muestra el mensaje **MSG-E-35** "No es posible agregar ponentes a un evento que no se encuentra aprobado.", cuando el evento no tenga el estatus requerido, o el mensaje **MSG-E-01** "El evento ya ha concluido.", cuando el evento haya finalizado.
- **C-4.** Regresa al actor a la pantalla **UI13** "Panel de Eventos Aprobados", sin realizar modificaciones a la información del evento.

*Fin de la trayectoria.*


### Trayectoria alternativa D: Campos obligatorios incompletos

> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor intenta registrar un ponente sin completar alguno de los campos obligatorios.

- **D-1.** Detecta que uno o más campos obligatorios del formulario se encuentran vacíos o contienen únicamente espacios en blanco.
- **D-2.** Detiene el proceso de registro y muestra el mensaje **MSG-E-11** "Por favor, completa todos los campos obligatorios resaltados para continuar.".
- **D-3.** Mantiene al actor en el formulario de ponentes de **UI16**, resaltando los campos que requieren información.
- **D-4.** Completa los campos obligatorios y selecciona nuevamente la opción [Guardar].
- **D-5.** Retoma la ejecución desde el paso 6 de la trayectoria principal para validar la información proporcionada.

*Fin de la trayectoria.*


### Trayectoria alternativa E: Formato de correo electrónico inválido

> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor proporciona un correo electrónico que no cumple con el formato establecido.

- **E-1.** Detecta que el correo electrónico ingresado no cumple con el formato requerido.
- **E-2.** Detiene el proceso de registro y muestra el mensaje **MSG-E-21** "Advertencia: Ingrese un correo válido.".
- **E-3.** Mantiene al actor en el formulario de ponentes de **UI16**, resaltando el campo correspondiente al correo electrónico.
- **E-4.** Corrige el correo electrónico proporcionado y selecciona nuevamente la opción [Guardar].
- **E-5.** Retoma la ejecución desde el paso 6 de la trayectoria principal para validar nuevamente la información ingresada.

*Fin de la trayectoria.*


### Trayectoria alternativa F: Ponente previamente registrado en el evento

> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el sistema identifica que el ponente proporcionado ya se encuentra asociado al evento seleccionado.

- **F-1.** Detecta que existe un registro previo del ponente vinculado al mismo evento, mediante la coincidencia de su correo electrónico.
- **F-2.** Impide realizar nuevamente el registro para evitar asociaciones duplicadas del ponente con el evento.
- **F-3.** Muestra el mensaje **MSG-E-34** "El ponente ya se encuentra registrado en el evento seleccionado.".
- **F-4.** Mantiene al actor en el formulario de ponentes de **UI16**, conservando los datos proporcionados.
- **F-5.** Puede modificar la información ingresada para registrar un ponente diferente o abandonar la operación.

*Fin de la trayectoria.*


### Trayectoria alternativa G: Cancelar el registro del ponente

> **Condición:** Ocurre en el paso 4 de la trayectoria principal cuando el actor decide abandonar el registro del ponente antes de guardar la información.

- **G-1.** Selecciona la opción [Cancelar] desde el formulario/modal de ponentes en **UI16**.
- **G-2.** Interrumpe el proceso de registro sin guardar la información ingresada ni realizar modificaciones a los ponentes asociados al evento.
- **G-3.** Regresa al actor a la pantalla **UI13** "Panel de Eventos Aprobados" (o **UI15**), conservando el estado original del evento seleccionado.

*Fin de la trayectoria.*
