---
caso_de_uso: "CU-13"
nombre: "Registrar usuario"
actor: "Asistente (usuario que se registra) y Administrador (registro manual de cuentas)."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-13: Registrar usuario

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** Permitir que una persona registre una cuenta desde la pantalla de Registro (`UI02`), capturando sus datos personales y credenciales, y complete la confirmación de correo en `/confirmar-registro` (así como la activación por token `/activar-logistica` para invitados de logística).

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-13 Registrar usuario** |
| **Autor** | Por definir. |
| **Actor** | Asistente (usuario que se registra) / Invitado de Personal de Logística. |
| **Propósito** | Permitir el alta de usuarios con datos y credenciales válidas mediante autogestión y verificación por correo electrónico, evitando cuentas duplicadas y clasificando cuentas internas o externas (`RN-01`). |
| **Entradas** | • Nombre, apellido paterno, apellido materno, correo electrónico, contraseña y confirmación de contraseña (obligatorios).<br>• Token de confirmación (`/confirmar-registro`) o token de activación de logística (`/activar-logistica`, cuando proviene de `CU-12`/`CU-32`). |
| **Salidas** | • Pantalla **UI02** "Pantalla de Registro de Usuario" (y vistas `/confirmar-registro` y `/activar-logistica` asociadas a `UI02`).<br>• Mensaje **MSG-I-08** "Operación realizada con éxito." después de guardar/confirmar la cuenta.<br>• Cuenta registrada, clasificada como Usuario Interno o Usuario Externo según su dominio (RN-01).<br>• Correo de confirmación enviado a la dirección del nuevo usuario. |
| **Precondiciones** | • Para el registro público o activación por token, la persona no necesita una sesión iniciada.<br>• Para asignación de jefaturas de departamento sobre cuentas registradas, el Administrador opera desde `CU-33` (`UI24`). |
| **Postcondiciones** | • Se crea una cuenta sin duplicar el correo electrónico.<br>• El sistema clasifica el dominio institucional o externo (RN-01).<br>• Ningún usuario obtiene automáticamente permisos generales de Administrador o Jefatura mediante el registro público.<br>• El sistema envía un correo de confirmación de registro para habilitar la cuenta en `/confirmar-registro` (o la activa tras validar el token en `/activar-logistica`). |
| **Errores** | • **MSG-E-11** cuando algún campo obligatorio esté vacío.<br>• **MSG-E-21** cuando el correo no tenga un formato válido.<br>• **MSG-E-37** cuando el correo ya exista.<br>• **MSG-E-46** cuando las contraseñas no coincidan.<br>• **MSG-E-08** cuando no sea posible guardar la cuenta. |
| **Tipo** | Primario para el Asistente y el Administrador. |

**Trayectorias del caso de uso:**


### Trayectoria Principal

1. El actor abre la pantalla **UI02** "Pantalla de Registro de Usuario" desde la opción [Registrarse] de la pantalla **UI01** "Pantalla de Inicio de Sesión". [Trayectoria D]
2. El sistema muestra los campos Nombre, Apellido Paterno, Apellido Materno, Correo Electrónico, Contraseña y Confirmar contraseña.
3. El actor captura los datos solicitados y selecciona [Registrar].
4. El sistema verifica que no existan campos vacíos, que el correo tenga formato válido y que ambas contraseñas coincidan. [Trayectoria A] [Trayectoria B]
5. El sistema consulta si el correo electrónico ya está registrado. [Trayectoria C] [Trayectoria E]
6. El sistema clasifica la cuenta como Usuario Interno si el dominio es @alumno.ipn.mx o @ipn.mx, o como Usuario Externo en otro caso (RN-01).
7. El sistema guarda la nueva cuenta y sus credenciales de forma segura. [Trayectoria E]
8. El sistema muestra MSG-I-08 "Operación realizada con éxito.", envía un correo de bienvenida con confirmación de cuenta y permite iniciar sesión desde UI01.

*Fin de la trayectoria.*


### Trayectoria alternativa A: Datos faltantes o correo incorrecto

> **Condición:** En el paso 4 falta información obligatoria o el correo no es válido.

- **A-1.** Muestra **MSG-E-11** para campos vacíos o **MSG-E-21** para el formato incorrecto del correo.
- **A-2.** Resalta el campo y mantiene la pantalla **UI02** para que el actor corrija los datos.
- **A-3.** Retoma la validación desde el paso 4.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Las contraseñas no coinciden

> **Condición:** En el paso 4 el valor de Confirmar contraseña es diferente al de Contraseña.

- **B-1.** Muestra **MSG-E-46** "Las contraseñas ingresadas no coinciden.".
- **B-2.** Solicita corregir los campos de contraseña sin registrar la cuenta.
- **B-3.** Retoma el paso 4 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa C: Correo electrónico previamente registrado

> **Condición:** En el paso 5 se encuentra otra cuenta con el mismo correo.

- **C-1.** Muestra **MSG-E-37** "El correo electrónico ingresado ya se encuentra registrado en el sistema.".
- **C-2.** Impide duplicar la cuenta y mantiene el formulario para corregir el correo.

*Fin de la trayectoria.*


### Trayectoria alternativa D: Confirmación de correo o activación de logística por token

> **Condición:** El usuario abre el enlace de confirmación (`/confirmar-registro`) tras registrarse, o el enlace de invitación de logística (`/activar-logistica`, `CU-12` / `CU-32`) en **UI02**.

- **D-1.** El sistema valida la vigencia e integridad del token recibido.
- **D-2.** En `/confirmar-registro`, activa definitivamente la cuenta recién registrada; en `/activar-logistica`, permite capturar nombre completo y contraseña con vigencia de 48 horas, activando la cuenta con el permiso del evento asignado (`RN-41`).
- **D-3.** Muestra **MSG-I-08** y habilita el inicio de sesión en **UI01**.

*Fin de la trayectoria.*


### Trayectoria alternativa E: Error de base de datos

> **Condición:** Ocurre en los pasos 5 o 7 cuando no es posible consultar o guardar la información.

- **E-1.** Muestra **MSG-E-08** "Error de conexión con la base de datos.".
- **E-2.** No declara registrado al usuario y conserva los datos del formulario para reintentar.

*Fin de la trayectoria.*
