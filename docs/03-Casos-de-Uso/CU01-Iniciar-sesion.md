---
caso_de_uso: "CU-01"
nombre: "Iniciar sesión"
actor: "Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-01: Iniciar sesión

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:**

El actor accede a la plataforma validando sus credenciales (correo y contraseña) para acceder a las funciones del sistema según sus permisos.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-01 Iniciar sesión** |
| **Autor** | Benitez Álvarez Efrain |
| **Actor** | Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador. |
| **Propósito** | Autenticar al usuario en el sistema para acceder a las funciones del sistema según sus permisos. |
| **Entradas** | • Correo electrónico.<br>• Contraseña (con estándar de complejidad alto exigido para la cuenta del Administrador: mínimo 12 caracteres, incluyendo mayúsculas, números y símbolos).<br>• Resolución de mecanismo anti-bots (por ejemplo, CAPTCHA). |
| **Salidas** | Sesión única JWT activa en el sistema (`RNF-09`, invalidando cualquier token previo de la misma cuenta en lista negra).<br>Pantalla principal según el rol del usuario al que se redirige exitosamente (o acceso a solicitud de recuperación `/recuperar-contrasena` hacia `CU-39` / `UI29`). |
| **Precondiciones** | El usuario debe contar con un registro previo en la plataforma.<br>La cuenta del usuario no debe tener un estado inactivo por borrado lógico aplicado por el administrador. |
| **Postcondiciones** | El sistema asigna el rol base de "Usuario Interno" si el correo ingresado utiliza los dominios @alumno.ipn.mx o @ipn.mx.<br>El sistema asigna el rol base de "Usuario Externo" si el correo ingresado utiliza cualquier otro dominio. |
| **Errores** | • Se mostrará el mensaje **MSG-E-11** "Por favor, completa todos los campos obligatorios resaltados para continuar.", en caso de datos vacíos.<br>• Se mostrará el mensaje **MSG-E-21** "Advertencia: Ingrese un correo válido.", en caso de un formato de correo incorrecto.<br>• MSG-E-55 cuando la cuenta acumule cinco intentos fallidos consecutivos; el bloqueo temporal dura 15 minutos. |
| **Tipo** | Primario para los actores Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador. |


### Trayectoria Principal

1. Interactúa con la pantalla **UI01** "Pantalla de Inicio de Sesión" para iniciar sesión.
2. Muestra el formulario solicitando correo electrónico, contraseña y presenta un mecanismo anti-bots CAPTCHA.
3. Ingresa su correo electrónico, su contraseña y resuelve el mecanismo de anti-bots CAPTCHA para evitar ataques automatizados.
4. Aplica validaciones en tiempo real sobre los datos ingresados en el formulario. [Trayectoria A]
5. Evalúa el dominio del correo: si es @alumno.ipn.mx o @ipn.mx, lo cataloga automáticamente como "Usuario Interno".
6. Si el dominio del correo es distinto a los institucionales, lo cataloga automáticamente como "Usuario Externo".
7. Valida las credenciales ingresadas para cualquier cuenta de usuario. [Trayectoria B]
8. Emite un nuevo token JWT manteniendo una única sesión activa por usuario (registrando cualquier token previo en lista negra e incorporando cabeceras HTTP de seguridad, `RNF-01`, `RNF-09`) y redirige al usuario a su menú principal (`UI03`, `UI25`, `UI26` o `UI18`).

*Fin de la trayectoria.*


### Trayectoria alternativa A:

> **Condición:** Ocurre en el paso 4 de la trayectoria principal cuando el actor ingresa información con formato incorrecto en los campos, credenciales erróneas, o deja campos vacíos.

- **A-1.** Detecta que los datos proporcionados en el formulario son inválidos.
- **A-2.** Muestra mensajes al usuario en la pantalla **UI01** notificando el error. Muestra el **MSG-E-11**: "Por favor, completa todos los campos obligatorios resaltados para continuar." o el **MSG-E-21**: "Advertencia: Ingrese un correo válido." según sea el caso.
- **A-3.** Mantiene al usuario en la **UI01** "Pantalla de Inicio de Sesión" en espera de que corrija los campos.

*Fin de la trayectoria.*


### Trayectoria alternativa B:

> **Condición: Ocurre en el paso 7 cuando se acumulan cinco intentos fallidos consecutivos de contraseña para una misma cuenta.**

- **B-1.** El sistema registra el quinto intento fallido consecutivo de inicio de sesión y documenta el incidente en la bitácora de seguridad.
- **B-2.** El sistema bloquea preventivamente el acceso a esa cuenta durante 15 minutos y muestra **MSG-E-55**: "Cuenta bloqueada temporalmente por seguridad tras 5 intentos fallidos. Intenta más tarde o restablece tu contraseña.".

*Fin de la trayectoria.*
