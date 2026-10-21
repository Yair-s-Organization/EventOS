---
caso_de_uso: "CU24"
nombre: "Escanear QR"
actor: "Personal de Logística"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU24: Escanear QR (extend CU-23)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU23-Visualizar-detalles-del-evento]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al personal de logística escanear los códigos QR de los boletos de los asistentes para validar o denegar su acceso a un evento asignado, verificando que los boletos sean válidos, correspondan al evento seleccionado y no hayan sido utilizados anteriormente.

### 📋 Ficha de Especificación

| Caso de uso | CU-24 Escanear QR (extend CU-23) |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Lorena Zuñiga Gonzalez |
| **Actor:** | Personal de Logística. |
| **Propósito:** | Permitir al personal de logística validar el acceso de los asistentes mediante el escaneo de sus códigos QR, verificando la autenticidad y el estado de sus boletos para evitar accesos no autorizados o duplicados. |
| **Entradas:** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• ID del evento seleccionado.<br>• Código QR del boleto del asistente, capturado mediante la cámara del dispositivo. |
| **Salidas:** | • Pantalla `UI19` "Pantalla de Escáner QR".<br>• Mensaje informativo `MSG-I-19` "Acceso válido.", cuando el boleto sea reconocido y cumpla con las condiciones de acceso.<br>• Mensaje de error correspondiente cuando el código QR no sea válido o el acceso sea denegado.<br>• Actualización del estado del boleto a "Ingresado" cuando se autorice el acceso. |
| **Precondiciones:** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Personal de Logística.<br>• El evento seleccionado debe encontrarse vinculado al perfil del actor.<br>• El evento debe encontrarse habilitado para realizar la validación de acceso.<br>• El actor debe haber seleccionado previamente un evento desde la pantalla `UI05` "Detalles del Evento", mediante el `CU-23` "Visualizar detalles del evento".<br>• El dispositivo debe contar con una cámara funcional que permita capturar códigos QR. |
| **Postcondiciones:** | • Si el código QR es válido, corresponde al evento seleccionado y no ha sido utilizado anteriormente, el sistema actualiza el estado del boleto a "Ingresado".<br>• El sistema registra la validación del acceso del asistente.<br>• Si el código QR no cumple con las condiciones establecidas, se deniega el acceso y el estado del boleto permanece sin modificaciones.<br>• El personal de logística puede continuar escaneando otros códigos QR del mismo evento.<br>• La sesión del actor permanece activa. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-22` "Acceso denegado, el código QR no ha sido reconocido por el sistema.", cuando el código QR no sea reconocido como válido para el evento seleccionado.<br>• Se mostrará el mensaje `MSG-E-23` "Acceso denegado, el código QR ya ha sido validado en el sistema.", cuando el boleto haya sido utilizado anteriormente.<br>• Se mostrará el mensaje `MSG-E-27` "La reserva no ha sido confirmada.", cuando el boleto corresponda a una reserva que no se encuentra confirmada.<br>• Se mostrará el mensaje `MSG-E-42` "No se pudo acceder a la cámara del dispositivo. Verifique los permisos e inténtelo nuevamente.", cuando el sistema no pueda utilizar la cámara.<br>• Se mostrará el mensaje `MSG-E-07` "Evento finalizado o inactivo.", cuando el evento no se encuentre habilitado para validar accesos.<br>• Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando ocurra una falla al consultar o actualizar el estado del boleto. |
| **Tipo:** | Secundario para el actor Personal de Logística (extend de `CU-23`). |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción `[Escanear QR]` desde la pantalla `UI05` "Detalles del Evento", correspondiente al evento que tiene asignado.
2. ⚙️ **[Sistema]** Verifica que el actor mantenga una sesión activa, que el evento se encuentre asignado a su perfil y que esté habilitado para validar accesos. `[Trayectoria D]`
3. ⚙️ **[Sistema]** Muestra la pantalla `UI19` "Pantalla de Escáner QR" y solicita acceso a la cámara del dispositivo para realizar la lectura del código. `[Trayectoria A]`
4. 👤 **[Actor]** Coloca el código QR del boleto del asistente frente a la cámara del dispositivo para realizar su lectura.
5. ⚙️ **[Sistema]** Captura el código QR y consulta en la base de datos la información del boleto, verificando que sea reconocido y corresponda al evento seleccionado. `[Trayectoria B]` `[Trayectoria E]`
6. ⚙️ **[Sistema]** Verifica que la reserva del asistente se encuentre confirmada y que el boleto no haya sido validado anteriormente. `[Trayectoria B]` `[Trayectoria C]` `[Trayectoria E]`
7. ⚙️ **[Sistema]** Actualiza el estado del boleto a "Ingresado" y registra la fecha y hora de acceso del asistente. `[Trayectoria C]` `[Trayectoria E]`
8. ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-19` "Acceso válido." en la pantalla `UI19` "Pantalla de Escáner QR", autorizando el acceso del asistente.
9. 👤 **[Actor]** Visualiza la confirmación de acceso y puede continuar escaneando los códigos QR de otros asistentes del mismo evento.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Acceso a la cámara no disponible
> **Condición:** Ocurre en el paso 3 de la trayectoria principal cuando el sistema no puede acceder a la cámara del dispositivo debido a que los permisos fueron denegados o la cámara no está disponible.
- **A-1.** ⚙️ **[Sistema]** Detecta que no cuenta con acceso a la cámara del dispositivo para realizar la lectura del código QR.
- **A-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-42` "No se pudo acceder a la cámara del dispositivo. Verifique los permisos e inténtelo nuevamente.".
- **A-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI19` "Pantalla de Escáner QR", esperando que habilite los permisos correspondientes.
- **A-4.** 👤 **[Actor]** Habilita el acceso a la cámara e intenta nuevamente realizar el escaneo.
- **A-5.** ⚙️ **[Sistema]** Retoma la ejecución desde el paso 3 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Código QR inválido o reserva no confirmada
> **Condición:** Ocurre en los pasos 5 o 6 de la trayectoria principal cuando el sistema no reconoce el código QR como válido para el evento seleccionado o detecta que la reserva correspondiente no ha sido confirmada.
- **B-1.** ⚙️ **[Sistema]** Detecta que el código QR no corresponde a un boleto válido para el evento seleccionado o que la reserva del asistente no se encuentra confirmada.
- **B-2.** ⚙️ **[Sistema]** Deniega el acceso y muestra el mensaje `MSG-E-22` "Acceso denegado, el código QR no ha sido reconocido por el sistema.", cuando el código no es válido para el evento, o el mensaje `MSG-E-27` "La reserva no ha sido confirmada.", cuando la reserva se encuentra pendiente de confirmación.
- **B-3.** ⚙️ **[Sistema]** Mantiene el estado del boleto sin modificaciones.
- **B-4.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI19` "Pantalla de Escáner QR", permitiéndole escanear otro código.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Código QR previamente validado
> **Condición:** Ocurre en los pasos 6 o 7 de la trayectoria principal cuando el sistema detecta que el código QR del boleto ya fue validado anteriormente.
- **C-1.** ⚙️ **[Sistema]** Detecta que el boleto correspondiente al código QR ya cuenta con el estado "Ingresado".
- **C-2.** ⚙️ **[Sistema]** Deniega el acceso y muestra el mensaje `MSG-E-23` "Acceso denegado, el código QR ya ha sido validado en el sistema.".
- **C-3.** ⚙️ **[Sistema]** Mantiene el estado del boleto sin modificaciones para evitar registros de acceso duplicados.
- **C-4.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI19` "Pantalla de Escáner QR", permitiéndole continuar con el escaneo de otros asistentes.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Evento no disponible
> **Condición:** Ocurre en el paso 2 de la trayectoria principal cuando el sistema detecta que el evento seleccionado no se encuentra habilitado para realizar la validación de acceso.
- **D-1.** ⚙️ **[Sistema]** Detecta que el actor no cuenta con una sesión válida o que el evento seleccionado no cumple con las condiciones necesarias para permitir el escaneo.
- **D-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-07` "Evento finalizado o inactivo.", cuando el evento no se encuentra habilitado para validar accesos.
- **D-3.** ⚙️ **[Sistema]** Impide continuar con el proceso de escaneo para evitar validaciones no autorizadas.
- **D-4.** ⚙️ **[Sistema]** Si el evento no está habilitado, regresa a la pantalla `UI05` "Detalles del Evento".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa E: Error de conexión con la base de datos
> **Condición:** Ocurre en los pasos 5, 6 o 7 de la trayectoria principal cuando el sistema presenta una falla de conexión con la base de datos que impide consultar o actualizar correctamente el estado del boleto.
- **E-1.** ⚙️ **[Sistema]** Detecta una falla de conexión con la base de datos al intentar verificar la información del boleto o registrar la validación del acceso.
- **E-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos.", notificando al actor que no fue posible completar o verificar la operación.
- **E-3.** ⚙️ **[Sistema]** No autoriza el acceso mientras no pueda comprobar que el boleto fue validado correctamente.
- **E-4.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla `UI19` "Pantalla de Escáner QR", permitiéndole intentar nuevamente la validación cuando se restablezca la conexión.

*`----- Fin de trayectoria.`*

