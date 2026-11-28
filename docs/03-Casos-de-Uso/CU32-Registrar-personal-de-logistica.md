---
caso_de_uso: "CU-32"
nombre: "Registrar personal de logística (Organizador)"
actor: "Organizador."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-32: Registrar personal de logística

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** Permitir al Organizador incorporar colaboradores como Personal de Logística de los eventos aprobados bajo su responsabilidad, mediante asignación directa con correo de confirmación si ya tienen cuenta, o invitación por correo con un token temporal de 48 horas para crear su cuenta, notificando por correo electrónico al Organizador y al colaborador tras la activación.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-32 Registrar personal de logística** |
| **Autor** | Vargas Rodriguez Leonardo |
| **Actor** | Organizador. |
| **Propósito** | Permitir al Organizador registrar o invitar colaboradores de logística vinculándolos exclusivamente con sus eventos aprobados, sin otorgarles permisos permanentes de logística ni credenciales de terceros. |
| **Entradas** | ID del Organizador autenticado; ID de uno de sus eventos aprobados; correo electrónico del colaborador. Si la persona no tiene cuenta, registrará su nombre y establecerá su contraseña personalmente mediante `/activar-logistica` (subflujo de `UI02`) al aceptar la invitación por token. |
| **Salidas** | Pantalla `UI27` "Agregar Personal de Logística" a la que se accede desde `UI15` "Administración y Detalles del Evento (Único y Multi-actividad)"; confirmación `MSG-I-08`; envío de correo con datos del evento al colaborador asignado directamente, o invitación por correo con enlace a `/activar-logistica` (`UI02`) y token de un solo uso válido por 48 horas al colaborador nuevo; al responder y activar el token, envío de correo de confirmación al colaborador y notificación por correo electrónico al Organizador responsable. |
| **Precondiciones** | El Organizador debe tener una cuenta activa y haber iniciado sesión correctamente mediante CU-01. El Organizador debe ser responsable del evento seleccionado. El evento debe encontrarse aprobado, vigente y no cancelado. No debe haberse alcanzado el límite de 10 integrantes de logística asignados al evento. |
| **Postcondiciones** | Si la cuenta está activa, el colaborador queda asignado directamente al evento y recibe una confirmación por correo. Si no existe cuenta, recibe una invitación por correo y queda asignado tras activar su cuenta en `/activar-logistica` (`UI02`) dentro de las 48 horas de vigencia; al completarse la activación, el sistema envía un correo de confirmación al colaborador y notifica por correo electrónico al Organizador responsable que la invitación fue aceptada e incorporada al equipo. Los permisos de logística solo aplican a eventos asignados, expiran tras la fecha/hora de terminación del último evento vigente y la cuenta conserva después su rol base. No se exceden 10 integrantes por evento. Si se cancela el proceso, no se modifica la asignación. |
| **Errores** | Se mostrará MSG-E-11 cuando falten campos obligatorios. Se mostrará MSG-E-21 cuando el correo electrónico no sea válido. Se mostrará MSG-E-38 cuando el actor no tenga permisos sobre el evento. Se mostrará MSG-E-39 si el colaborador ya está asignado al evento. Se mostrará MSG-E-40 si el evento aún no está aprobado. Se mostrará MSG-E-50 si se alcanzó el límite de 10 integrantes. Se mostrará MSG-E-06 si el evento no existe o fue cancelado; MSG-E-08 si falla la comunicación con la base de datos. |
| **Tipo** | Primario para el Organizador. Complementa CU-31 "Asignar personal de logística" y no reemplaza el registro administrado por Subdirección en CU-12. |


### Trayectoria Principal

1. El Organizador selecciona uno de sus eventos aprobados mediante CU-24 "Consultar mis eventos" y accede a UI15 "Panel de Administración y Detalles del Evento".
2. Selecciona la opción [Agregar personal de logística].
3. Verifica la sesión del Organizador, que sea responsable del evento, que el evento esté aprobado y que no se haya superado el límite de 10 colaboradores. [Trayectoria D]
4. Muestra UI27 "Agregar Personal de Logística" desde el panel del evento, con el campo para ingresar el correo electrónico del colaborador y el contador de 10 lugares permitidos.
5. El Organizador ingresa el correo electrónico del colaborador en la tarjeta y selecciona [Agregar] para pre-validar en modo lectura (sin guardar en base de datos ni enviar correos todavía), repitiendo para otros colaboradores hasta completar su lista y presionando **[Guardar]** cuando desee confirmar.
6. Verifica que todos los campos obligatorios estén completos, que no existan correos duplicados en las tarjetas del panel y que cada correo electrónico tenga un formato válido. [Trayectoria A] [Trayectoria B]
7. Consulta en la base de datos si cada correo electrónico corresponde a una cuenta activa o requiere invitación temporal por token (validando su dominio MX y solicitando confirmación modal antes de preparar la invitación). [Trayectoria C] [Trayectoria F] [Trayectoria E]
8. Al pulsar **[Guardar]**, si las tarjetas vigentes siguen en la lista, valida que no exista una asignación previa ni se supere el límite de 10 personas y otorga permisos de logística exclusivos para ese evento (cualquier tarjeta eliminada o reemplazada antes de guardar no genera cambios ni correos). [Trayectoria C] [Trayectoria E]
9. Actualiza la relación de personal de logística del evento y envía únicamente en ese instante los correos de confirmación o las invitaciones por token correspondientes. [Trayectoria E]
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

- **D-1.** Verifica que la sesión del Organizador sea válida y que tenga autorización para gestionar logística del evento seleccionado.
- **D-2.** Muestra MSG-E-10 si la sesión expiró, MSG-E-38 si el Organizador no es responsable del evento, MSG-E-06 si está cancelado o no existe, o MSG-E-40 si no está aprobado.
- **D-3.** Impide continuar con el registro y mantiene la información del evento sin modificaciones. Si la sesión no es válida, redirige al actor a la pantalla **UI01** "Pantalla de Inicio de Sesión".

*Fin de la trayectoria.*


### Trayectoria alternativa E: Error al registrar la asignación

> **Condición:** Ocurre en los pasos 7, 8 o 9 de la trayectoria principal, o en el paso C-4 de la trayectoria alternativa C, cuando existe un error de conexión con la base de datos.

- **E-1.** Detecta un error durante la asignación de personal de logística al evento.
- **E-2.** Si ocurre un error de conexión con la base de datos, muestra el mensaje **MSG-E-08** "Error de conexión con la base de datos." e impide completar el registro.
- **E-3.** Si no se confirma la operación, mantiene la asignación sin modificaciones.
- **E-4.** Permite reintentar la operación después de verificar si la asignación se registró correctamente.
- **E-5.** Mantiene al Organizador en UI27 "Agregar Personal de Logística" para revisar el resultado e intentar nuevamente si corresponde.

*Fin de la trayectoria.*


### Trayectoria alternativa F: Usuario no registrado e invitación por token

> **Condición:** En el paso 7, el correo indicado no corresponde a ninguna cuenta registrada y el evento admite más integrantes de logística.

- **F-1.** El sistema genera un token criptográfico de un solo uso con vigencia de 48 horas, vinculado al correo electrónico y al evento aprobado del Organizador.
- **F-2.** Envía un correo electrónico de invitación con un enlace hacia `/activar-logistica` (subflujo de activación por token en `UI02`).
- **F-3.** El destinatario accede al enlace `/activar-logistica` (`UI02`), captura nombre completo y define su propia contraseña; el sistema valida el token y crea una cuenta activa.
- **F-4.** El sistema asigna permisos temporales de Personal de Logística para el evento autorizado, sin conceder privilegios generales a la cuenta.
- **F-5.** Cuando el usuario esté asignado a varios eventos, los permisos de logística se mantienen hasta que concluya el último por fecha y hora; posteriormente conserva su cuenta con el rol base.
- **F-6.** El sistema confirma la activación y la asignación, envía un correo de confirmación de activación al nuevo colaborador, envía un correo de notificación al Organizador responsable informándole que el usuario respondió al token y quedó integrado al equipo de logística del evento, y muestra MSG-I-08 "Operación realizada con éxito.".

*Fin de la trayectoria.*
