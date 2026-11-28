---
caso_de_uso: "CU-12"
nombre: "Registrar personal de logística (Subdirección)"
actor: "Subdirección de Servicios Educativos."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-12: Registrar personal de logística

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** Permitir a la Subdirección de Servicios Educativos registrar o invitar personal de logística y asignarlo a eventos previamente aprobados. La asignación otorga permisos de logística temporales y exclusivos de los eventos autorizados.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-12 Registrar personal de logística** |
| **Autor** | Vargas Rodriguez Leonardo |
| **Actor** | Subdirección de Servicios Educativos. |
| **Propósito** | Permitir a Subdirección registrar o invitar colaboradores de logística por correo electrónico y asociarlos directamente a eventos aprobados, respetando las restricciones de autorización y cupo. |
| **Entradas** | ID del actor autenticado; ID del evento aprobado; correo electrónico del colaborador. Para una invitación a una cuenta no registrada, el colaborador capturará su nombre completo y establecerá su contraseña mediante el subflujo `/activar-logistica` (consolidado en `UI02`). |
| **Salidas** | Pantalla `UI27` "Agregar Personal de Logística"; mensaje `MSG-I-08` "Operación realizada con éxito."; asignación directa a una cuenta activa o invitación por correo con token de un solo uso válido durante 48 horas hacia `/activar-logistica` (`UI02`) para personas no registradas. |
| **Precondiciones** | El actor debe contar con una cuenta activa y una sesión válida. El actor debe tener el rol de Subdirección de Servicios Educativos. El evento seleccionado debe encontrarse aprobado, vigente y sin alcanzar el límite de 10 integrantes de Personal de Logística. |
| **Postcondiciones** | El colaborador queda vinculado al evento aprobado, de manera inmediata si ya estaba registrado (recibiendo correo de confirmación) o tras activar su cuenta mediante `/activar-logistica` (`UI02`) con token válido por 48 horas (enviando confirmación de activación al colaborador y notificación al responsable del evento). Los permisos de logística son exclusivos de los eventos asignados y permanecen vigentes hasta la finalización del evento con fecha/hora de término más tardía cuando tenga varias asignaciones. Al vencer todas, se conserva la cuenta con su rol base sin privilegios de logística. La asignación respeta el máximo de 10 integrantes por evento. |
| **Errores** | • Se mostrará el mensaje **MSG-E-11** "Por favor, completa todos los campos obligatorios resaltados para continuar.", cuando existan campos vacíos.<br>• Se mostrará el mensaje **MSG-E-21** "Advertencia: Ingrese un correo válido.", cuando el correo electrónico tenga un formato incorrecto.<br>• Se mostrará el mensaje **MSG-E-39** "El personal de logística ya se encuentra asignado al evento seleccionado.", cuando exista una asignación previa.<br>• Se mostrará el mensaje **MSG-E-06** "Evento no encontrado o cancelado.", cuando el evento no exista o esté cancelado.<br>• Se mostrará el mensaje **MSG-E-40** "No es posible asignar personal de logística a un evento que no se encuentra aprobado.", cuando el evento no tenga el estado requerido.<br>• Se mostrará el mensaje **MSG-E-08** "Error de conexión con la base de datos.", cuando ocurra un problema al registrar la información.<br>• MSG-E-50 si el evento ya alcanzó el máximo de diez integrantes de logística. |
| **Tipo** | Primario para Subdirección de Servicios Educativos. |


### Trayectoria Principal

1. Selecciona un evento aprobado en **UI13** "Panel de Eventos Aprobados" desde su sesión de Subdirección.
2. Selecciona la opción [Agregar personal de logística].
3. Verifica que el actor tenga una sesión activa, los permisos necesarios y que el evento seleccionado se encuentre aprobado. [Trayectoria D]
4. Muestra UI27 "Agregar Personal de Logística", donde solicita el correo electrónico del colaborador. Informa que el evento admite como máximo 10 integrantes de logística.
5. Ingresa el correo electrónico en la tarjeta correspondiente y selecciona [Agregar] para pre-validar en modo lectura (sin guardar ni enviar correos aún), o captura los correos deseados y presiona [Guardar].
6. Verifica que todos los campos obligatorios estén completos, que los correos no estén repetidos en el panel y tengan un formato válido. [Trayectoria A] [Trayectoria B]
7. Consulta en la base de datos si cada correo electrónico corresponde a una cuenta activa o no registrada (validando su dominio MX). En caso de cuentas no registradas, solicita confirmación de invitación temporal antes de guardar. [Trayectoria C] [Trayectoria F] [Trayectoria E]
8. Al pulsar **[Guardar]**, valida nuevamente que no exista asignación previa ni se supere el límite de 10 personas para las tarjetas vigentes (descartando cualquier tarjeta eliminada antes de guardar) y otorga permisos de logística exclusivos para ese evento o emite las invitaciones por token de 48 horas. [Trayectoria C] [Trayectoria E]
9. Actualiza la relación de personal de logística del evento y envía al colaborador registrado el correo de confirmación o de invitación con la información del evento únicamente en este momento. [Trayectoria E]
10. Muestra MSG-I-08 "Operación realizada con éxito." cuando se confirma la asignación o se envía la invitación por token.
11. Visualiza la confirmación del registro y finaliza la operación.

*Fin de la trayectoria.*


### Trayectoria alternativa A: Campos obligatorios incompletos

> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el actor intenta registrar personal de logística sin completar los campos obligatorios.

- **A-1.** Detecta que uno o más campos obligatorios se encuentran vacíos.
- **A-2.** Muestra el mensaje **MSG-E-11** "Por favor, completa todos los campos obligatorios resaltados para continuar.".
- **A-3.** Mantiene al actor en la pantalla **UI27** "Agregar Personal de Logística", resaltando los campos incompletos.
- **A-4.** Completa la información faltante y retoma el proceso desde el paso 5 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Correo electrónico inválido

> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el actor ingresa un correo electrónico con un formato incorrecto.

- **B-1.** Detecta que el correo electrónico proporcionado no cumple con el formato establecido.
- **B-2.** Muestra el mensaje **MSG-E-21** "Advertencia: Ingrese un correo válido.".
- **B-3.** Mantiene al actor en la pantalla **UI27** "Agregar Personal de Logística", permitiéndole corregir el correo.
- **B-4.** Corrige la información y retoma el proceso desde el paso 5 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa C: Usuario previamente registrado

> **Condición: En el paso 7, el correo electrónico corresponde a un usuario ya registrado y activo.**

- **C-1.** Identifica que el correo electrónico ya se encuentra registrado en la base de datos.
- **C-2.** Verifica que la cuenta esté activa y no se encuentre asignada al evento seleccionado.
- **C-3.** Si el usuario ya está asignado al evento, muestra el mensaje **MSG-E-39** "El personal de logística ya se encuentra asignado al evento seleccionado.". Si tiene otro rol, conserva su rol base y recibe permisos de logística solo para el evento.
- **C-4.** Si el usuario tiene una cuenta activa y no está asignado al evento, registra la asignación sin crear otra cuenta, respetando el máximo de diez integrantes. [Trayectoria E]
- **C-5.** Envía un correo de confirmación con los datos del evento y muestra MSG-I-08 "Operación realizada con éxito.".

*Fin de la trayectoria.*


### Trayectoria alternativa D: Evento no disponible o sesión inválida

> **Condición:** Ocurre en el paso 3 de la trayectoria principal cuando el sistema detecta que el actor no tiene una sesión válida o que el evento seleccionado no se encuentra disponible para asignar personal de logística.

- **D-1.** Verifica las condiciones del actor y del evento seleccionado.
- **D-2.** Muestra el mensaje **MSG-E-10** "Sesión expirada o inválida.", cuando el problema corresponde a la sesión; el mensaje **MSG-E-06** "Evento no encontrado o cancelado.", cuando el evento no exista o se encuentre cancelado; o el mensaje **MSG-E-40** "No es posible asignar personal de logística a un evento que no se encuentra aprobado.", cuando no tenga el estado requerido.
- **D-3.** Impide continuar con el registro y mantiene la información del evento sin modificaciones. Si la sesión no es válida, redirige al actor a la pantalla **UI01** "Pantalla de Inicio de Sesión".

*Fin de la trayectoria.*


### Trayectoria alternativa E: Error al registrar la asignación

> **Condición:** Ocurre en los pasos 7, 8 o 9 de la trayectoria principal, o en el paso C-4 de la trayectoria alternativa C, cuando existe un error de conexión con la base de datos.

- **E-1.** Detecta un error durante la asignación de personal de logística al evento.
- **E-2.** Si ocurre un error de conexión con la base de datos, muestra el mensaje **MSG-E-08** "Error de conexión con la base de datos." e impide completar el registro.
- **E-3.** Si no se confirma la operación, mantiene la asignación sin modificaciones.
- **E-4.** Permite reintentar la operación después de verificar si la asignación se registró correctamente.
- **E-5.** Mantiene al actor en la pantalla **UI27** "Agregar Personal de Logística", mostrando el resultado de la operación realizada.

*Fin de la trayectoria.*


### Trayectoria alternativa F: Usuario no registrado e invitación por token

> **Condición:** En el paso 7, el correo indicado no corresponde a ninguna cuenta registrada y el evento admite más integrantes de logística.

- **F-1.** El sistema genera una invitación criptográfica de un solo uso, con vigencia de 48 horas, vinculada al correo y evento seleccionados.
- **F-2.** Envía un correo electrónico de invitación con un enlace hacia `/activar-logistica` (subflujo de activación por token en `UI02`).
- **F-3.** El destinatario accede al enlace `/activar-logistica` (`UI02`), proporciona su nombre completo y define una contraseña. El sistema valida el token y crea la cuenta.
- **F-4.** El sistema asigna permisos temporales de Personal de Logística para el evento autorizado, sin conceder privilegios generales a la cuenta.
- **F-5.** Cuando el usuario esté asignado a varios eventos, los permisos de logística se mantienen hasta que concluya el último por fecha y hora; posteriormente conserva su cuenta con el rol base.
- **F-6.** El sistema confirma la activación y la asignación, envía un correo de confirmación de activación al colaborador, envía una notificación por correo al responsable del evento y muestra MSG-I-08 "Operación realizada con éxito.".

*Fin de la trayectoria.*
