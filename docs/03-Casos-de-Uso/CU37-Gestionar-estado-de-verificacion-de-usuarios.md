---
caso_de_uso: "CU37"
nombre: "Gestionar estado de verificación de usuarios"
actor: "Administrador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU37: Gestionar estado de verificación de usuarios

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al Administrador consultar y modificar el estado de verificación de los usuarios registrados en la plataforma, específicamente Alumnos, Profesores y Empresas, con la finalidad de validar su información y determinar si cumplen con los requisitos establecidos para ser reconocidos como usuarios verificados dentro del sistema.

### 📋 Ficha de Especificación

| Caso de uso | CU-37 Gestionar estado de verificación de usuarios |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Moreno Ramirez Jose Jorge |
| **Actor:** | Administrador |
| **Propósito:** | Permitir al Administrador gestionar el estado de verificación de los usuarios registrados, modificándolo entre "Verificado" y "No verificado", mediante la revisión de su información y documentación correspondiente, garantizando que los cambios queden registrados en la bitácora histórica del sistema. |
| **Entradas:** | • ID del Administrador autenticado, obtenido de la sesión activa.<br>• ID del usuario cuyo estado de verificación será modificado.<br>• Tipo de usuario: Alumno, Profesor o Empresa.<br>• Estado de verificación seleccionado: Verificado o No verificado.<br>• Justificación del cambio de estado (obligatoria cuando se retire la verificación).<br>• Confirmación del cambio de estado de verificación. |
| **Salidas:** | • Pantalla `UI31` "Gestionar Estado de Verificación de Usuarios".<br>• Listado de usuarios registrados, mostrando su nombre, correo electrónico, tipo de usuario y estado actual de verificación.<br>• Información y documentación de verificación disponible del usuario seleccionado.<br>• Mensaje de confirmación `MSG-P-07` "¿Desea confirmar el cambio de estado de verificación del usuario seleccionado?".<br>• Mensaje informativo `MSG-I-08` "Operación realizada con éxito.", cuando se complete correctamente la actualización.<br>• Actualización del estado de verificación del usuario seleccionado.<br>• Registro de la modificación en la bitácora histórica del sistema. |
| **Precondiciones:** | • El Administrador debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El Administrador debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Administrador.<br>• El usuario cuyo estado de verificación será modificado debe encontrarse registrado en la base de datos.<br>• El usuario seleccionado debe pertenecer a alguna de las categorías sujetas al proceso de verificación: Alumno, Profesor o Empresa. |
| **Postcondiciones:** | • El estado de verificación del usuario seleccionado se actualiza correctamente en la base de datos.<br>• Si el Administrador confirma la verificación, la cuenta cambia al estado "Verificado".<br>• Si el Administrador retira la verificación, la cuenta cambia al estado "No verificado".<br>• El sistema registra en la bitácora histórica el usuario modificado, el Administrador responsable, el estado anterior, el nuevo estado, la fecha y hora de la operación y la justificación, cuando corresponda.<br>• La modificación del estado de verificación no cambia el estado "Activo" o "Inactivo" de la cuenta.<br>• Los roles y permisos previamente asignados al usuario permanecen sin modificaciones.<br>• Las solicitudes de eventos registradas previamente conservan su estado de aprobación correspondiente.<br>• Si el Administrador cancela la operación, el estado de verificación permanece sin modificaciones.<br>• La sesión del Administrador permanece activa. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-10` "Sesión expirada o inválida.", cuando la sesión del Administrador haya expirado o no sea válida.<br>• Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando el sistema no pueda consultar o actualizar la información del usuario.<br>• Se mostrará el mensaje `MSG-E-43` "La cuenta seleccionada no existe o ya no se encuentra disponible.", cuando no se encuentre la cuenta del usuario seleccionado.<br>• Se mostrará el mensaje `MSG-E-29` "Dato requerido faltante. La justificación no puede estar vacía.", cuando el Administrador intente retirar la verificación sin proporcionar una justificación.<br>• Se mostrará el mensaje `MSG-E-45` "No es posible verificar al usuario porque su información de verificación está incompleta.", cuando el usuario no cuente con la información necesaria para completar su verificación. |
| **Tipo:** | Primario para el actor Administrador. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Gestionar estado de verificación de usuarios" desde la pantalla `UI26` "Menú Principal de Administrador".
2. ⚙️ **[Sistema]** Consulta en la base de datos los usuarios registrados que pertenecen a las categorías Alumno, Profesor o Empresa, obteniendo su información general y estado actual de verificación. `[Trayectoria D]`
3. ⚙️ **[Sistema]** Muestra la pantalla `UI31` "Gestionar Estado de Verificación de Usuarios", presentando el listado de usuarios con su nombre, correo electrónico, tipo de usuario y estado de verificación.
4. 👤 **[Actor]** Selecciona del listado un usuario que se encuentra con el estado "No verificado" para revisar su información y modificar su estado. `[Trayectoria A]`
5. ⚙️ **[Sistema]** Consulta en la base de datos la información del usuario seleccionado y muestra sus datos personales y la información de verificación disponible. `[Trayectoria D]`
6. 👤 **[Actor]** Revisa la información proporcionada por el usuario para determinar si cumple con los requisitos de verificación.
7. 👤 **[Actor]** Selecciona la opción `[Verificar usuario]` para modificar el estado de verificación de la cuenta seleccionada.
8. ⚙️ **[Sistema]** Valida que el usuario cuente con la información necesaria para completar su verificación. `[Trayectoria B]`
9. ⚙️ **[Sistema]** Muestra el mensaje de confirmación `MSG-P-07` "¿Desea confirmar el cambio de estado de verificación del usuario seleccionado?", con las opciones `[Aceptar]` y `[Cancelar]`. `[Trayectoria C]`
10. 👤 **[Actor]** Confirma la modificación seleccionando el botón `[Aceptar]`. `[Trayectoria C]`
11. ⚙️ **[Sistema]** Actualiza en la base de datos el estado de verificación del usuario de "No verificado" a "Verificado" y registra la modificación en la bitácora histórica del sistema. `[Trayectoria D]`
12. ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-08` "Operación realizada con éxito." en la pantalla `UI31` "Gestionar Estado de Verificación de Usuarios".
13. ⚙️ **[Sistema]** Actualiza el listado de usuarios, mostrando el nuevo estado de verificación de la cuenta seleccionada.
14. 👤 **[Actor]** Visualiza la confirmación del cambio de estado y finaliza la operación.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Retirar la verificación de un usuario
> **Condición:** Ocurre en el paso 4 de la trayectoria principal cuando el Administrador selecciona un usuario que ya se encuentra con el estado "Verificado" y desea retirar su verificación.
- **A-1.** 👤 **[Actor]** Selecciona una cuenta con el estado "Verificado" desde la pantalla `UI31` "Gestionar Estado de Verificación de Usuarios".
- **A-2.** ⚙️ **[Sistema]** Muestra la información del usuario seleccionado y habilita la opción `[Retirar verificación]`.
- **A-3.** 👤 **[Actor]** Selecciona la opción `[Retirar verificación]`.
- **A-4.** ⚙️ **[Sistema]** Solicita al Administrador ingresar una justificación obligatoria para retirar el estado de verificación del usuario.
- **A-5.** 👤 **[Actor]** Ingresa la justificación correspondiente y selecciona la opción `[Continuar]`.
- **A-6.** ⚙️ **[Sistema]** Verifica que el campo de justificación no se encuentre vacío. Si está vacío, muestra el mensaje `MSG-E-29` "Dato requerido faltante. La justificación no puede estar vacía." y solicita completar la información antes de continuar.
- **A-7.** ⚙️ **[Sistema]** Muestra el mensaje de confirmación `MSG-P-07` "¿Desea confirmar el cambio de estado de verificación del usuario seleccionado?", con las opciones `[Aceptar]` y `[Cancelar]`. `[Trayectoria C]`
- **A-8.** 👤 **[Actor]** Confirma la modificación seleccionando el botón `[Aceptar]`. `[Trayectoria C]`
- **A-9.** ⚙️ **[Sistema]** Actualiza en la base de datos el estado del usuario de "Verificado" a "No verificado" y registra la modificación y su justificación en la bitácora histórica del sistema. `[Trayectoria D]`
- **A-10.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-08` "Operación realizada con éxito." y actualiza el estado del usuario en la pantalla `UI31` "Gestionar Estado de Verificación de Usuarios".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Información de verificación incompleta
> **Condición:** Ocurre en el paso 8 de la trayectoria principal cuando el sistema detecta que el usuario seleccionado no cuenta con la información necesaria para completar su verificación.
- **B-1.** ⚙️ **[Sistema]** Detecta que la información o documentación requerida para verificar al usuario se encuentra incompleta.
- **B-2.** ⚙️ **[Sistema]** Impide modificar el estado de verificación de la cuenta seleccionada.
- **B-3.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-45` "No es posible verificar al usuario porque su información de verificación está incompleta.".
- **B-4.** ⚙️ **[Sistema]** Mantiene al Administrador en la pantalla `UI31` "Gestionar Estado de Verificación de Usuarios", conservando el estado "No verificado" de la cuenta.
- **B-5.** 👤 **[Actor]** Puede seleccionar otro usuario para revisar su información o finalizar la operación.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Cancelar el cambio de estado de verificación
> **Condición:** Ocurre en los pasos 9 o 10 de la trayectoria principal, o en los pasos A-7 y A-8 de la trayectoria alternativa A, cuando el Administrador decide no confirmar el cambio de estado de verificación.
- **C-1.** 👤 **[Actor]** Selecciona el botón `[Cancelar]` en la ventana de confirmación.
- **C-2.** ⚙️ **[Sistema]** Interrumpe la operación sin modificar el estado de verificación del usuario seleccionado.
- **C-3.** ⚙️ **[Sistema]** Cierra la ventana de confirmación y mantiene al Administrador en la pantalla `UI31` "Gestionar Estado de Verificación de Usuarios".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Error al consultar o actualizar la información del usuario
> **Condición:** Ocurre en los pasos 2, 5 u 11 de la trayectoria principal, o en el paso A-9 de la trayectoria alternativa A, cuando el sistema no puede consultar o actualizar la información del usuario seleccionado.
- **D-1.** ⚙️ **[Sistema]** Detecta una falla al intentar recuperar la información del usuario o guardar la modificación de su estado de verificación.
- **D-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando ocurre una falla de conexión, o el mensaje `MSG-E-43` "La cuenta seleccionada no existe o ya no se encuentra disponible.", cuando no se encuentra el registro del usuario.
- **D-3.** ⚙️ **[Sistema]** Impide continuar con la operación y no presenta el cambio de verificación como exitoso mientras no pueda comprobar que fue guardado correctamente.
- **D-4.** ⚙️ **[Sistema]** Mantiene al Administrador en la pantalla `UI31` "Gestionar Estado de Verificación de Usuarios", cuando esta se encuentre disponible, permitiéndole consultar nuevamente el estado de la cuenta antes de intentar otra modificación.

*`----- Fin de trayectoria.`*

