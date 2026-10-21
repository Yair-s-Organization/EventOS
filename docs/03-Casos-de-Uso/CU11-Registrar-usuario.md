---
caso_de_uso: "CU11"
nombre: "Registrar usuario"
actor: "Asistente y Administrador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU11: Registrar usuario

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir que una persona registre una cuenta desde la pantalla de Registro, capturando sus datos personales y credenciales. El Administrador también puede crear cuentas manualmente y asignarles un rol permitido.

### 📋 Ficha de Especificación

| Caso de uso | CU-11 Registrar usuario |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Por definir. |
| **Actor:** | Asistente (usuario que se registra) y Administrador (registro manual de cuentas). |
| **Propósito:** | Permitir el alta de usuarios con datos y credenciales válidas, evitando cuentas duplicadas y distinguiendo el registro público de la creación manual autorizada al Administrador. |
| **Entradas:** | • Nombre, apellido paterno, apellido materno, correo electrónico, contraseña y confirmación de contraseña (obligatorios).<br>• Rol de la cuenta (únicamente en el alta manual realizada por Administrador: Asistente o Subdirección de Servicios Educativos). |
| **Salidas:** | • Pantalla `UI02` "Pantalla de Registro de Usuario".<br>• Mensaje `MSG-I-08` "Operación realizada con éxito." después de guardar la cuenta.<br>• Cuenta registrada, clasificada como Usuario Interno o Usuario Externo según su dominio (`RN-01`). |
| **Precondiciones:** | • Para el registro público, la persona no necesita una sesión iniciada.<br>• Para el alta manual, el Administrador debe tener una cuenta activa y haber iniciado sesión desde `CU-01`. |
| **Postcondiciones:** | • Se crea una cuenta sin duplicar el correo electrónico.<br>• El sistema clasifica el dominio institucional o externo (`RN-01`).<br>• El alta manual asigna únicamente el rol permitido elegido por el Administrador (`RF-24`).<br>• Ningún usuario obtiene automáticamente permisos generales de Administrador mediante el registro público. |
| **Errores:** | • `MSG-E-11` cuando algún campo obligatorio esté vacío.<br>• `MSG-E-21` cuando el correo no tenga un formato válido.<br>• `MSG-E-37` cuando el correo ya exista.<br>• `MSG-E-46` cuando las contraseñas no coincidan.<br>• `MSG-E-08` cuando no sea posible guardar la cuenta. |
| **Tipo:** | Primario para el Asistente y el Administrador. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Abre la pantalla `UI02` "Pantalla de Registro de Usuario" desde la opción `[Registrarse]` de la pantalla `UI01` "Pantalla de Inicio de Sesión". `[Trayectoria D]`
2. ⚙️ **[Sistema]** Muestra los campos Nombre, Apellido Paterno, Apellido Materno, Correo Electrónico, Contraseña y Confirmar contraseña.
3. 👤 **[Actor]** Captura los datos solicitados y selecciona `[Registrar]`.
4. ⚙️ **[Sistema]** Verifica que no existan campos vacíos, que el correo tenga formato válido y que ambas contraseñas coincidan. `[Trayectoria A]` `[Trayectoria B]`
5. ⚙️ **[Sistema]** Consulta si el correo electrónico ya está registrado. `[Trayectoria C]` `[Trayectoria E]`
6. ⚙️ **[Sistema]** Clasifica la cuenta como Usuario Interno si el dominio es `@alumno.ipn.mx` o `@ipn.mx`, o como Usuario Externo en otro caso (`RN-01`).
7. ⚙️ **[Sistema]** Guarda la nueva cuenta y sus credenciales de forma segura. `[Trayectoria E]`
8. ⚙️ **[Sistema]** Muestra `MSG-I-08` "Operación realizada con éxito." y permite al actor iniciar sesión desde `UI01`.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Datos faltantes o correo incorrecto
> **Condición:** En el paso 4 falta información obligatoria o el correo no es válido.
- **A-1.** ⚙️ **[Sistema]** Muestra `MSG-E-11` para campos vacíos o `MSG-E-21` para el formato incorrecto del correo.
- **A-2.** ⚙️ **[Sistema]** Resalta el campo y mantiene la pantalla `UI02` para que el actor corrija los datos.
- **A-3.** ⚙️ **[Sistema]** Retoma la validación desde el paso 4.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Las contraseñas no coinciden
> **Condición:** En el paso 4 el valor de Confirmar contraseña es diferente al de Contraseña.
- **B-1.** ⚙️ **[Sistema]** Muestra `MSG-E-46` "Las contraseñas ingresadas no coinciden.".
- **B-2.** ⚙️ **[Sistema]** Solicita corregir los campos de contraseña sin registrar la cuenta.
- **B-3.** ⚙️ **[Sistema]** Retoma el paso 4 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Correo electrónico previamente registrado
> **Condición:** En el paso 5 se encuentra otra cuenta con el mismo correo.
- **C-1.** ⚙️ **[Sistema]** Muestra `MSG-E-37` "El correo electrónico ingresado ya se encuentra registrado en el sistema.".
- **C-2.** ⚙️ **[Sistema]** Impide duplicar la cuenta y mantiene el formulario para corregir el correo.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Registro manual realizado por Administrador
> **Condición:** El Administrador selecciona `[Registrar usuario]` desde `UI21` "Gestión de Cuentas de Usuario".
- **D-1.** ⚙️ **[Sistema]** Abre el formulario `UI02` para captura manual y permite asignar únicamente el rol Asistente o Subdirección de Servicios Educativos (`RF-24`).
- **D-2.** 👤 **[Actor]** El Administrador completa los datos del usuario y selecciona `[Registrar]`.
- **D-3.** ⚙️ **[Sistema]** Continúa las validaciones desde el paso 4 de la trayectoria principal y guarda la cuenta con el rol seleccionado.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa E: Error de base de datos
> **Condición:** Ocurre en los pasos 5 o 7 cuando no es posible consultar o guardar la información.
- **E-1.** ⚙️ **[Sistema]** Muestra `MSG-E-08` "Error de conexión con la base de datos.".
- **E-2.** ⚙️ **[Sistema]** No declara registrado al usuario y conserva los datos del formulario para reintentar.

*`----- Fin de trayectoria.`*

