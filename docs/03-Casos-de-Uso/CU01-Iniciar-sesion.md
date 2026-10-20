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

| Caso de uso | CU01 Iniciar Sesión |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Benitez Álvarez Efrain |
| Actor | Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador. |
| Propósito: | Autenticar al usuario en el sistema para acceder a las funciones del sistema según sus permisos. |
| Entradas: | Correo electrónico.<br>Contraseña (con estándar de complejidad alto exigido para la cuenta del Administrador: mínimo 12 caracteres, incluyendo mayúsculas, números y símbolos).<br>Resolución de mecanismo anti-bots (por ejemplo, CAPTCHA). |
| Salidas: | Sesión activa en el sistema.<br>Mensajes de error en caso de datos inválidos en el formulario. |
| Precondiciones: | El usuario debe contar con un registro previo en la plataforma.<br>La cuenta del usuario no debe tener un estado inactivo por borrado lógico aplicado por el administrador |
| Postcondiciones: | El sistema asigna el rol base de "Usuario Interno" si el correo ingresado utiliza los dominios @alumno.ipn.mx o @ipn.mx.<br>El sistema asigna el rol base de "Usuario Externo" si el correo ingresado utiliza cualquier otro dominio. |
| Errores: | Datos inválidos introducidos en el formulario de inicio de sesión.<br>Múltiples intentos fallidos (5 intentos) de ingreso su contraseña que derivan en un bloqueo preventivo de 10 minutos.<br>MSG14<br>MSG 17<br>MSG 10 |
| Tipo: | Primario para los actores Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** El actor interactúa con la pantalla P01 Pantalla de Inicio de Sesión / Registro para iniciar sesión.
2. ⚙️ **[Sistema]** El sistema muestra el formulario solicitando correo electrónico, contraseña y presenta un mecanismo anti-bots CAPTCHA.
3. 👤 **[Actor]** El actor ingresa su correo electrónico, su contraseña y resuelve el mecanismo de anti-bots CAPTCHA para evitar ataques automatizados
4. ⚙️ **[Sistema]** El sistema aplica validaciones en tiempo real sobre los datos ingresados en el formulario.
5. ⚙️ **[Sistema]** El sistema evalúa el dominio del correo: si es @alumno.ipn.mx o @ipn.mx, lo cataloga automáticamente como "Usuario Interno".
6. ⚙️ **[Sistema]** Si el dominio del correo es distinto a los institucionales, el sistema lo cataloga automáticamente como "Usuario Externo".
7. ⚙️ **[Sistema]** El sistema valida las credenciales; si la cuenta corresponde al Administrador, el sistema verifica que cumpla con las credenciales especificas correctas. [Bifurca a Trayectoria alternativa B]
8. ⚙️ **[Sistema]** El sistema valida el inicio de sesión y permite el acceso a las funciones correspondientes del usuario.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** El actor ingresa información con formato incorrecto en los campos o sus credenciales son erróneas.
- ⚙️ **[Sistema]** **A-1** El sistema detecta que los datos proporcionados en el formulario son inválidos.
- ⚙️ **[Sistema]** **A-2** El sistema muestra mensajes al usuario notificando que las credenciales ingresadas son incorrectas o inexistentes. [MSG 17]: "Por favor, completa todos los campos obligatorios resaltados para continuar." [MSG 10]*: "Advertencia: Ingrese un correo valido." (correspondiente a la segunda sección de tu catálogo)

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** El actor intenta acceder con su respectiva cuenta y falla repetidamente la introducción de su contraseña.
- ⚙️ **[Sistema]** **B-1** . El sistema registra que el actor ha realizado 5 intentos fallidos consecutivos de inicio de sesión en la cuenta del Administrador.
- ⚙️ **[Sistema]** **B-2** El sistema bloquea automáticamente el acceso a la cuenta durante 10 minutos para protegerla contra ataques de fuerza bruta. [MSG14]: "Sesión expirada o invalida".

*`----- Fin de trayectoria.`*

