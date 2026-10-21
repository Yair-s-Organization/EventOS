---
caso_de_uso: "CU10"
nombre: "Registrar personal de logística"
actor: "Subdirección de Servicios Educativos y Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU10: Registrar personal de logística

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al personal de Subdirección de Servicios Educativos y al Organizador registrar personal de logística y asignarlo a un evento previamente aprobado. La asignación otorga permisos de logística únicamente para el evento seleccionado.

### 📋 Ficha de Especificación

| Caso de uso | CU-10 Registrar personal de logística |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Vargas Rodriguez Leonardo |
| **Actor:** | Subdirección de Servicios Educativos y Organizador. |
| **Propósito:** | Permitir a los actores autorizados registrar personal de logística y asignarlo a un evento aprobado, facilitando la organización y administración del personal encargado de las actividades logísticas. |
| **Entradas:** | • ID del usuario autenticado.<br>• ID del evento seleccionado.<br>• Nombre completo del personal de logística (obligatorio).<br>• Correo electrónico del personal de logística (obligatorio). |
| **Salidas:** | • Pantalla `UI27` "Agregar Personal de Logística".<br>• Mensaje informativo `MSG-I-08` "Operación realizada con éxito.".<br>• Asignación del usuario registrado al evento seleccionado. |
| **Precondiciones:** | • El actor debe contar con una cuenta activa en el sistema.<br>• El actor debe haber iniciado sesión correctamente.<br>• El actor debe tener asignado el rol de Subdirección de Servicios Educativos u Organizador.<br>• El evento seleccionado debe encontrarse aprobado y no haber concluido.<br>• Si el actor es Organizador, debe ser responsable del evento seleccionado. |
| **Postcondiciones:** | • El personal de logística queda registrado en el sistema y asociado al evento seleccionado.<br>• La asignación utiliza una cuenta registrada y activa, sin crear una cuenta nueva.<br>• Los permisos de Personal de Logística se limitan al evento asignado.<br>• El personal registrado podrá consultar el evento asignado desde la pantalla `UI18` "Panel de Eventos Asignados" durante su participación autorizada.<br>• Si el actor cancela el registro, no se realizan modificaciones en la base de datos. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-11` "Por favor, completa todos los campos obligatorios resaltados para continuar.", cuando existan campos vacíos.<br>• Se mostrará el mensaje `MSG-E-21` "Advertencia: Ingrese un correo válido.", cuando el correo electrónico tenga un formato incorrecto.<br>• Se mostrará el mensaje `MSG-E-39` "El personal de logística ya se encuentra asignado al evento seleccionado.", cuando exista una asignación previa.<br>• Se mostrará el mensaje `MSG-E-06` "Evento no encontrado o cancelado.", cuando el evento no exista o esté cancelado.<br>• Se mostrará el mensaje `MSG-E-40` "No es posible asignar personal de logística a un evento que no se encuentra aprobado.", cuando el evento no tenga el estado requerido.<br>• Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando ocurra un problema al registrar la información. |
| **Tipo:** | Primario para los actores Subdirección de Servicios Educativos y Organizador. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona un evento previamente aprobado desde la pantalla `UI13` "Panel de Eventos Aprobados", si pertenece a Subdirección, o desde la pantalla `UI15` "Panel de Administración y Detalles del Evento", si pertenece al rol de Organizador.
2. 👤 **[Actor]** Selecciona la opción `[Agregar personal de logística]`.
3. ⚙️ **[Sistema]** Verifica que el actor tenga una sesión activa, los permisos necesarios y que el evento seleccionado se encuentre aprobado. `[Trayectoria D]`
4. ⚙️ **[Sistema]** Muestra la pantalla `UI27` "Agregar Personal de Logística", solicitando el nombre completo y correo electrónico del personal que se desea registrar.
5. 👤 **[Actor]** Ingresa los datos solicitados y selecciona la opción `[Registrar]`.
6. ⚙️ **[Sistema]** Verifica que todos los campos obligatorios estén completos y que el correo electrónico tenga un formato válido. `[Trayectoria A]` `[Trayectoria B]`
7. ⚙️ **[Sistema]** Consulta en la base de datos si el correo electrónico proporcionado ya se encuentra registrado. `[Trayectoria C]` `[Trayectoria E]`
8. ⚙️ **[Sistema]** Verifica que la cuenta del usuario esté activa, que no tenga una reserva como asistente para ese evento (`RN-21`) y que no se rebase el límite de 10 integrantes (`RN-41`); después lo asigna al evento con permisos de logística exclusivos para este. `[Trayectoria E]`
9. ⚙️ **[Sistema]** Actualiza la relación de personal de logística asignado al evento seleccionado. `[Trayectoria E]`
10. ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-08` "Operación realizada con éxito." en la pantalla `UI27` "Agregar Personal de Logística".
11. 👤 **[Actor]** Visualiza la confirmación del registro y finaliza la operación.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Campos obligatorios incompletos
> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el actor intenta registrar personal de logística sin completar los campos obligatorios.
- **A-1.** ⚙️ **[Sistema]** Detecta que uno o más campos obligatorios se encuentran vacíos.
- **A-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-11` "Por favor, completa todos los campos obligatorios resaltados para continuar.".
- **A-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI27` "Agregar Personal de Logística", resaltando los campos incompletos.
- **A-4.** 👤 **[Actor]** Completa la información faltante y retoma el proceso desde el paso 5 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Correo electrónico inválido
> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el actor ingresa un correo electrónico con un formato incorrecto.
- **B-1.** ⚙️ **[Sistema]** Detecta que el correo electrónico proporcionado no cumple con el formato establecido.
- **B-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-21` "Advertencia: Ingrese un correo válido.".
- **B-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI27` "Agregar Personal de Logística", permitiéndole corregir el correo.
- **B-4.** 👤 **[Actor]** Corrige la información y retoma el proceso desde el paso 5 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Usuario previamente registrado
> **Condición:** Ocurre en el paso 7 de la trayectoria principal cuando el correo electrónico ingresado corresponde a una cuenta existente.
- **C-1.** ⚙️ **[Sistema]** Identifica que el correo electrónico ya se encuentra registrado en la base de datos.
- **C-2.** ⚙️ **[Sistema]** Verifica que la cuenta esté activa y no se encuentre asignada al evento seleccionado.
- **C-3.** ⚙️ **[Sistema]** Si el usuario ya está asignado al evento, muestra el mensaje `MSG-E-39` "El personal de logística ya se encuentra asignado al evento seleccionado.". Si tiene otro rol, conserva su rol base y recibe permisos de logística solo para el evento.
- **C-4.** ⚙️ **[Sistema]** Si el usuario tiene una cuenta activa y no está asignado al evento, registra la asignación sin crear otra cuenta, respetando el máximo de diez integrantes. `[Trayectoria E]`
- **C-5.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-08` "Operación realizada con éxito.", cuando la asignación se completa correctamente.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Evento no disponible o sesión inválida
> **Condición:** Ocurre en el paso 3 de la trayectoria principal cuando el sistema detecta que el actor no tiene una sesión válida o que el evento seleccionado no se encuentra disponible para asignar personal de logística.
- **D-1.** ⚙️ **[Sistema]** Verifica las condiciones del actor y del evento seleccionado.
- **D-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-10` "Sesión expirada o inválida.", cuando el problema corresponde a la sesión; el mensaje `MSG-E-06` "Evento no encontrado o cancelado.", cuando el evento no exista o se encuentre cancelado; o el mensaje `MSG-E-40` "No es posible asignar personal de logística a un evento que no se encuentra aprobado.", cuando no tenga el estado requerido.
- **D-3.** ⚙️ **[Sistema]** Impide continuar con el registro y mantiene la información del evento sin modificaciones. Si la sesión no es válida, redirige al actor a la pantalla `UI01` "Pantalla de Inicio de Sesión".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa E: Error al registrar la asignación
> **Condición:** Ocurre en los pasos 7, 8 o 9 de la trayectoria principal, o en el paso C-4 de la trayectoria alternativa C, cuando existe un error de conexión con la base de datos.
- **E-1.** ⚙️ **[Sistema]** Detecta un error durante la asignación de personal de logística al evento.
- **E-2.** ⚙️ **[Sistema]** Si ocurre un error de conexión con la base de datos, muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos." e impide completar el registro.
- **E-3.** ⚙️ **[Sistema]** Si no se confirma la operación, mantiene la asignación sin modificaciones.
- **E-4.** ⚙️ **[Sistema]** Permite reintentar la operación después de verificar si la asignación se registró correctamente.
- **E-5.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI27` "Agregar Personal de Logística", mostrando el resultado de la operación realizada.

*`----- Fin de trayectoria.`*

