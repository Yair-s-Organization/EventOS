---
caso_de_uso: "CU01"
nombre: "Iniciar sesión"
actor: "Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador."
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU01: Iniciar sesión

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
El actor accede a la plataforma validando sus credenciales (correo y contraseña) para acceder a las funciones del sistema según sus permisos.

### 📋 Ficha de Especificación

| Caso de uso | CU-01 Iniciar Sesión |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Benitez Álvarez Efrain |
| **Actor:** | Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador. |
| **Propósito:** | Autenticar al usuario en el sistema para acceder a las funciones del sistema según sus permisos. |
| **Entradas:** | • Correo electrónico.<br>• Contraseña (con estándar de complejidad alto exigido para la cuenta del Administrador: mínimo 12 caracteres, incluyendo mayúsculas, números y símbolos).<br>• Resolución de mecanismo anti-bots (por ejemplo, CAPTCHA). |
| **Salidas:** | • Sesión activa en el sistema.<br>• Pantalla principal según el rol del usuario al que se redirige exitosamente. |
| **Precondiciones:** | • El usuario debe contar con un registro previo en la plataforma.<br>• La cuenta del usuario no debe tener un estado inactivo por borrado lógico aplicado por el administrador. |
| **Postcondiciones:** | • El sistema asigna el rol base de "Usuario Interno" si el correo ingresado utiliza los dominios `@alumno.ipn.mx` o `@ipn.mx`.<br>• El sistema asigna el rol base de "Usuario Externo" si el correo ingresado utiliza cualquier otro dominio. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-11` "Por favor, completa todos los campos obligatorios resaltados para continuar.", en caso de datos vacíos.<br>• Se mostrará el mensaje `MSG-E-21` "Advertencia: Ingrese un correo válido.", en caso de un formato de correo incorrecto. |
| **Tipo:** | Primario para los actores Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Interactúa con la pantalla `UI01` "Pantalla de Inicio de Sesión" para iniciar sesión.
2. ⚙️ **[Sistema]** Muestra el formulario solicitando correo electrónico, contraseña y presenta un mecanismo anti-bots CAPTCHA.
3. 👤 **[Actor]** Ingresa su correo electrónico, su contraseña y resuelve el mecanismo de anti-bots CAPTCHA para evitar ataques automatizados.
4. ⚙️ **[Sistema]** Aplica validaciones en tiempo real sobre los datos ingresados en el formulario. `[Trayectoria A]`
5. ⚙️ **[Sistema]** Evalúa el dominio del correo: si es `@alumno.ipn.mx` o `@ipn.mx`, lo cataloga automáticamente como "Usuario Interno".
6. ⚙️ **[Sistema]** Si el dominio del correo es distinto a los institucionales, lo cataloga automáticamente como "Usuario Externo".
7. ⚙️ **[Sistema]** Valida las credenciales ingresadas para cualquier cuenta de usuario. `[Trayectoria B]`
8. ⚙️ **[Sistema]** Valida el inicio de sesión y permite el acceso a las funciones correspondientes redirigiendo al usuario a su menú principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Datos inválidos o campos vacíos
> **Condición:** Ocurre en el paso 4 de la trayectoria principal cuando el actor ingresa información con formato incorrecto en los campos, credenciales erróneas, o deja campos vacíos.
- **A-1.** ⚙️ **[Sistema]** Detecta que los datos proporcionados en el formulario son inválidos.
- **A-2.** ⚙️ **[Sistema]** Muestra mensajes al usuario en la pantalla `UI01` notificando el error. Muestra el `MSG-E-11`: "Por favor, completa todos los campos obligatorios resaltados para continuar." o el `MSG-E-21`: "Advertencia: Ingrese un correo válido." según sea el caso.
- **A-3.** ⚙️ **[Sistema]** Mantiene al usuario en la `UI01` "Pantalla de Inicio de Sesión" en espera de que corrija los campos.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Bloqueo por intentos fallidos
> **Condición:** Ocurre en el paso 7 de la trayectoria principal cuando cualquier usuario falla repetidamente al ingresar su contraseña.
- **B-1.** ⚙️ **[Sistema]** Registra que el actor ha realizado 5 intentos fallidos consecutivos de inicio de sesión en su cuenta.
- **B-2.** ⚙️ **[Sistema]** Bloquea automáticamente el acceso a la cuenta durante 30 minutos para protegerla contra ataques de fuerza bruta y despliega el `MSG-E-10`: "Sesión expirada o inválida.".

*`----- Fin de trayectoria.`*

