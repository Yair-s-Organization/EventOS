---
caso_de_uso: "CU02"
nombre: "Ver perfil"
actor: "Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador."
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU02: Ver perfil

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir a los usuarios autenticados consultar la información de su perfil dentro de la plataforma, mostrando sus datos personales y los datos asociados a su cuenta, de acuerdo con su rol y tipo de usuario.

### 📋 Ficha de Especificación

| Caso de uso | CU-02 Ver perfil |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Vargas Rodriguez Leonardo |
| **Actor:** | Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador. |
| **Propósito:** | Permitir al actor consultar la información registrada en su cuenta, con la finalidad de conocer sus datos personales, su tipo de usuario y el rol que tiene asignado dentro del sistema. |
| **Entradas:** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• Solicitud de visualización del perfil realizada por el actor. |
| **Salidas:** | • Pantalla `UI28` "Visualizar Perfil de Usuario".<br>• Información del perfil correspondiente al usuario autenticado, incluyendo los datos personales registrados, correo electrónico, tipo de usuario y rol asignado. |
| **Precondiciones:** | • El actor debe contar con una cuenta registrada en la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• La cuenta del usuario debe encontrarse activa y no haber sido deshabilitada mediante borrado lógico por el Administrador. |
| **Postcondiciones:** | • El sistema muestra al actor la información correspondiente a su perfil.<br>• La sesión del usuario permanece activa.<br>• No se realiza ninguna modificación a la información almacenada en la base de datos. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando el sistema no pueda recuperar la información del perfil debido a una falla de conexión. |
| **Tipo:** | Primario para los actores Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística y Administrador. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Ver perfil" desde el menú o panel de navegación correspondiente a su rol.
2. ⚙️ **[Sistema]** Verifica que el usuario mantenga una sesión activa y válida dentro de la plataforma.
3. ⚙️ **[Sistema]** Obtiene el identificador del usuario autenticado a partir de la información almacenada en su sesión.
4. ⚙️ **[Sistema]** Consulta en la base de datos la información del perfil asociada al identificador del usuario autenticado. `[Trayectoria A]`
5. ⚙️ **[Sistema]** Muestra la pantalla `UI28` "Visualizar Perfil de Usuario", presentando los datos personales del actor, su correo electrónico, tipo de usuario y rol asignado dentro de la plataforma.
6. 👤 **[Actor]** Visualiza y consulta la información de su perfil.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Error al consultar la información del perfil
> **Condición:** Ocurre en el paso 4 de la trayectoria principal cuando el sistema no puede recuperar la información del usuario debido a un error de conexión con la base de datos.
- **A-1.** ⚙️ **[Sistema]** Detecta una falla de conexión con la base de datos al intentar recuperar la información del perfil del usuario autenticado.
- **A-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos.", notificando al actor que no fue posible completar la consulta.
- **A-3.** ⚙️ **[Sistema]** Mantiene al actor en la pantalla desde la cual solicitó visualizar su perfil, permitiéndole intentar acceder nuevamente.

*`----- Fin de trayectoria.`*

