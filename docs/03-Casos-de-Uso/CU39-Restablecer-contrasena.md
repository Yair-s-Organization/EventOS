---
caso_de_uso: "CU-39"
nombre: "Restablecer contraseña"
actor: "Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador (Todos los Actores / Público)."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-39: Restablecer contraseña

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:**

Permitir a los usuarios que hayan olvidado sus credenciales o cuya cuenta se encuentre bloqueada preventivamente restablecer su contraseña de acceso mediante un token seguro temporal enviado por correo electrónico, garantizando la recuperación confiable y segura de su cuenta.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-39 Restablecer contraseña** |
| **Autor** | Redactor Técnico de Arquitectura / Sinergia Ágil |
| **Actor** | Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador (Todos los Actores / Público). |
| **Propósito** | Permitir a los usuarios autenticados o no autenticados redefinir su contraseña de acceso a la plataforma mediante validación de token temporal de recuperación enviado a su correo registrado. |
| **Entradas** | • Correo electrónico registrado del usuario (solicitado desde `/recuperar-contrasena` dentro de **UI01**).<br>• Token de restablecimiento recibido por correo en enlace seguro.<br>• Nueva contraseña (con estándar de complejidad según el rol).<br>• Confirmación de la nueva contraseña. |
| **Salidas** | • Pantalla **UI29** "Restablecer Contraseña" *(antes `UI35` en borradores previos)*.<br>• Mensaje informativo **MSG-I-08** "Operación realizada con éxito." al redefinir la contraseña.<br>• Redirección a la pantalla **UI01** "Pantalla de Inicio de Sesión". |
| **Precondiciones** | • El usuario debe contar con una cuenta registrada y no eliminada en la base de datos.<br>• El usuario debe acceder a través del enlace de restablecimiento con un token válido y vigente generado por el sistema. |
| **Postcondiciones** | • La contraseña de la cuenta del usuario es actualizada en la base de datos aplicando cifrado criptográfico seguro.<br>• El token de restablecimiento utilizado queda invalidado permanentemente para un solo uso.<br>• En caso de existir bloqueo temporal previo por intentos fallidos (`MSG-E-55`), este queda suspendido permitiendo el acceso inmediato.<br>• El sistema redirige al usuario a la pantalla **UI01** "Pantalla de Inicio de Sesión". |
| **Errores** | • Se mostrará un mensaje de enlace/token inválido o expirado (`MSG-E-20` en flujo previo de recuperación) cuando el token no exista o haya caducado.<br>• Se mostrará el mensaje **MSG-E-46** "Las contraseñas ingresadas no coinciden." cuando la confirmación sea distinta.<br>• Se mostrará el mensaje **MSG-E-11** "Por favor, completa todos los campos obligatorios resaltados para continuar.", en caso de campos vacíos.<br>• Se mostrará el mensaje **MSG-E-08** "Error de conexión con la base de datos.", cuando ocurra una falla al registrar la nueva contraseña. |
| **Tipo** | Primario para todos los actores del sistema. |


### Trayectoria Principal

1. El usuario accede al enlace seguro de restablecimiento de contraseña recibido en su correo electrónico personal o institucional.
2. El sistema valida la autenticidad, integridad y vigencia temporal del token de seguridad recibido. [Trayectoria A]
3. Muestra la pantalla **UI29** "Restablecer Contraseña", presentando los campos para ingresar la nueva contraseña y confirmar la nueva contraseña, junto con las directrices de complejidad de contraseña.
4. El usuario ingresa la nueva contraseña y la confirmación de la contraseña en los campos correspondientes de la pantalla **UI29**, y presiona el botón [Restablecer Contraseña].
5. Valida que los campos no se encuentren vacíos y que la contraseña cumpla con las políticas de complejidad establecidas. [Trayectoria B]
6. Valida que la nueva contraseña y su confirmación coincidan exactamente. [Trayectoria C]
7. Actualiza de forma segura la contraseña en la base de datos, invalida el token de restablecimiento de un solo uso y desbloquea la cuenta si presentaba bloqueo preventivo.
8. Muestra el mensaje informativo **MSG-I-08** "Operación realizada con éxito." y redirige automáticamente al usuario a la pantalla **UI01** "Pantalla de Inicio de Sesión".

*Fin de la trayectoria.*


### Trayectoria alternativa A: Token expirado o inválido

> **Condición:** Ocurre en el paso 2 de la trayectoria principal cuando el token de restablecimiento no existe, ya ha sido utilizado previamente, o su periodo de vigencia ha expirado.

- **A-1.** El sistema detecta que el token de seguridad es inválido o se encuentra vencido.
- **A-2.** Muestra el mensaje de error **MSG-E-20** notificando que el token ha expirado o no es válido.
- **A-3.** Redirige al usuario a la pantalla **UI01** "Pantalla de Inicio de Sesión" para que pueda solicitar un nuevo enlace de recuperación si así lo requiere.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Campos obligatorios incompletos o contraseña no cumple políticas

> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el usuario deja campos vacíos o la contraseña no satisface los requisitos mínimos de longitud y caracteres.

- **B-1.** El sistema detecta que uno o más campos obligatorios están vacíos o que la contraseña no cumple las reglas de seguridad.
- **B-2.** Muestra el mensaje de error **MSG-E-11** "Por favor, completa todos los campos obligatorios resaltados para continuar." y resalta los campos que requieren corrección.
- **B-3.** Mantiene al usuario en la pantalla **UI29** "Restablecer Contraseña" en espera de que capture una contraseña válida.

*Fin de la trayectoria.*


### Trayectoria alternativa C: Contraseñas no coinciden

> **Condición:** Ocurre en el paso 6 de la trayectoria principal cuando el valor capturado en el campo de confirmación no es idéntico a la nueva contraseña ingresada.

- **C-1.** El sistema identifica discrepancia entre el campo de la nueva contraseña y su confirmación.
- **C-2.** Muestra el mensaje de error **MSG-E-46** notificando que las contraseñas ingresadas no coinciden.
- **C-3.** Mantiene al usuario en la pantalla **UI29** "Restablecer Contraseña", conservando el foco para su corrección.

*Fin de la trayectoria.*
