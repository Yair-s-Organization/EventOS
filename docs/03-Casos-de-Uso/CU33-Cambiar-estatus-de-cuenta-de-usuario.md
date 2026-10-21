---
caso_de_uso: "CU33"
nombre: "Cambiar estatus de cuenta de usuario"
actor: "Administrador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU33: Cambiar estatus de cuenta de usuario

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al Administrador activar o desactivar las cuentas de los usuarios registrados en la plataforma, controlando su acceso al sistema mediante la modificación del estado de sus cuentas. Los usuarios desactivados no podrán iniciar sesión hasta que el Administrador vuelva a habilitarlos.

### 📋 Ficha de Especificación

| Caso de uso | CU-33 Cambiar estatus de cuenta de usuario |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Moreno Ramirez Jose Jorge / Zempoalteca Salinas Enrique |
| **Actor:** | Administrador |
| **Propósito:** | Permitir al Administrador modificar el estado de las cuentas de los usuarios entre "Activo" e "Inactivo", con la finalidad de controlar el acceso a la plataforma sin eliminar permanentemente su información. |
| **Entradas:** | • ID del Administrador autenticado, obtenido de la sesión activa.<br>• ID del usuario cuya cuenta será modificada.<br>• Estado actual de la cuenta seleccionada.<br>• Opción seleccionada para activar o desactivar la cuenta.<br>• Confirmación del cambio de estado. |
| **Salidas:** | • Pantalla `UI21` "Gestión de Cuentas de Usuario".<br>• Listado de usuarios registrados con su información general y estado actual.<br>• Mensaje de confirmación `MSG-P-05` "¿Desea confirmar el cambio de estado de la cuenta seleccionada?".<br>• Mensaje informativo `MSG-I-08` "Operación realizada con éxito.", cuando se complete correctamente la actualización.<br>• Actualización del estado de la cuenta seleccionada. |
| **Precondiciones:** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Administrador.<br>• La cuenta que se desea modificar debe encontrarse registrada en la base de datos. |
| **Postcondiciones:** | • El estado de la cuenta seleccionada se actualiza correctamente en la base de datos.<br>• Si la cuenta cambia al estado "Inactivo", el usuario pierde la autorización para acceder al sistema hasta que su cuenta sea reactivada.<br>• Si la cuenta cambia al estado "Activo", el usuario podrá iniciar sesión nuevamente utilizando sus credenciales.<br>• La información personal del usuario permanece almacenada en la base de datos.<br>• Si el Administrador cancela la operación, el estado de la cuenta permanece sin modificaciones.<br>• La sesión del Administrador permanece activa. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando el sistema no pueda consultar o actualizar la información de la cuenta.<br>• Se mostrará el mensaje `MSG-E-43` "La cuenta seleccionada no existe o ya no se encuentra disponible.", cuando el usuario que se desea modificar no pueda localizarse en la base de datos. |
| **Tipo:** | Primario para el actor Administrador. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Gestión de cuentas de usuario" desde la pantalla `UI26` "Menú Principal de Administrador".
2. ⚙️ **[Sistema]** Consulta en la base de datos las cuentas de los usuarios registrados. `[Trayectoria C]`
3. ⚙️ **[Sistema]** Muestra la pantalla `UI21` "Gestión de Cuentas de Usuario", presentando el listado de usuarios con su información general y el estado actual de sus cuentas.
4. 👤 **[Actor]** Selecciona la cuenta de un usuario que se encuentra con el estado "Activo".
5. 👤 **[Actor]** Selecciona la opción `[Desactivar]` correspondiente a la cuenta seleccionada. `[Trayectoria A]`
6. ⚙️ **[Sistema]** Muestra el mensaje de confirmación `MSG-P-05` "¿Desea confirmar el cambio de estado de la cuenta seleccionada?", con las opciones `[Aceptar]` y `[Cancelar]`. `[Trayectoria B]`
7. 👤 **[Actor]** Confirma la operación seleccionando el botón `[Aceptar]`.
8. ⚙️ **[Sistema]** Verifica que la cuenta seleccionada continúe registrada y disponible para modificar su estado. `[Trayectoria D]`
9. ⚙️ **[Sistema]** Actualiza en la base de datos el estado de la cuenta seleccionada de "Activo" a "Inactivo" y revoca las sesiones activas de dicha cuenta. `[Trayectoria C]`
10. ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-08` "Operación realizada con éxito." en la pantalla `UI21` "Gestión de Cuentas de Usuario".
11. ⚙️ **[Sistema]** Actualiza el listado de usuarios, mostrando el nuevo estado de la cuenta seleccionada.
12. 👤 **[Actor]** Visualiza la confirmación del cambio de estado y finaliza la operación.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Activar una cuenta de usuario
> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el Administrador selecciona una cuenta que se encuentra con el estado "Inactivo" y desea habilitarla nuevamente.
- **A-1.** 👤 **[Actor]** Selecciona una cuenta con el estado "Inactivo" desde la pantalla `UI21` "Gestión de Cuentas de Usuario".
- **A-2.** 👤 **[Actor]** Selecciona la opción `[Activar]` correspondiente a la cuenta seleccionada.
- **A-3.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-P-05` "¿Desea confirmar el cambio de estado de la cuenta seleccionada?", con las opciones `[Aceptar]` y `[Cancelar]`. `[Trayectoria B]`
- **A-4.** 👤 **[Actor]** Confirma la activación seleccionando el botón `[Aceptar]`.
- **A-5.** ⚙️ **[Sistema]** Verifica que la cuenta continúe registrada y actualiza su estado de "Inactivo" a "Activo" en la base de datos. `[Trayectoria C]` `[Trayectoria D]`
- **A-6.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-08` "Operación realizada con éxito.".
- **A-7.** ⚙️ **[Sistema]** Actualiza el listado de la pantalla `UI21` "Gestión de Cuentas de Usuario", mostrando el nuevo estado de la cuenta.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Cancelar el cambio de estado
> **Condición:** Ocurre en el paso 6 de la trayectoria principal o en el paso A-3 de la trayectoria alternativa A cuando el Administrador decide no confirmar el cambio de estado de la cuenta seleccionada.
- **B-1.** 👤 **[Actor]** Selecciona el botón `[Cancelar]` en la ventana de confirmación.
- **B-2.** ⚙️ **[Sistema]** Interrumpe la operación sin modificar el estado de la cuenta seleccionada.
- **B-3.** ⚙️ **[Sistema]** Cierra la ventana de confirmación y mantiene al Administrador en la pantalla `UI21` "Gestión de Cuentas de Usuario".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Error de conexión con la base de datos
> **Condición:** Ocurre en los pasos 2 o 9 de la trayectoria principal, o en el paso A-5 de la trayectoria alternativa A, cuando el sistema presenta una falla de conexión con la base de datos.
- **C-1.** ⚙️ **[Sistema]** Detecta una falla de conexión con la base de datos al intentar consultar o actualizar la información de la cuenta seleccionada.
- **C-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos.", notificando al Administrador que no fue posible completar o verificar la operación.
- **C-3.** ⚙️ **[Sistema]** Mantiene al Administrador en la pantalla `UI21` "Gestión de Cuentas de Usuario" cuando esta se encuentre disponible.
- **C-4.** ⚙️ **[Sistema]** Permite consultar nuevamente el estado de la cuenta una vez restablecida la conexión, antes de intentar otro cambio.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Cuenta de usuario no encontrada
> **Condición:** Ocurre en el paso 8 de la trayectoria principal o en el paso A-5 de la trayectoria alternativa A cuando el sistema no encuentra la cuenta seleccionada en la base de datos.
- **D-1.** ⚙️ **[Sistema]** Detecta que la cuenta seleccionada ya no se encuentra registrada o disponible para realizar el cambio de estado.
- **D-2.** ⚙️ **[Sistema]** Impide continuar con la operación para evitar modificaciones sobre una cuenta inexistente.
- **D-3.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-43` "La cuenta seleccionada no existe o ya no se encuentra disponible.".
- **D-4.** ⚙️ **[Sistema]** Actualiza el listado de usuarios en la pantalla `UI21` "Gestión de Cuentas de Usuario", permitiendo al Administrador seleccionar otra cuenta.

*`----- Fin de trayectoria.`*

