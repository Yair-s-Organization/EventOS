---
caso_de_uso: "CU34"
nombre: "Gestionar espacios físicos"
actor: "Administrador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU34: Gestionar espacios físicos

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al Administrador consultar y modificar el estado operativo de los espacios físicos registrados en la plataforma, así como actualizar su aforo máximo. Los recintos podrán habilitarse o deshabilitarse temporalmente por motivos de mantenimiento o falta de disponibilidad, sin que puedan crearse o eliminarse espacios físicos de la base de datos.

### 📋 Ficha de Especificación

| Caso de uso | CU-34 Gestionar espacios físicos |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Zempoalteca Salinas Enrique |
| **Actor:** | Administrador |
| **Propósito:** | Permitir al Administrador mantener actualizada la información de los espacios físicos de la Escuela Superior de Cómputo (ESCOM), controlando su aforo máximo y disponibilidad mediante la modificación de su estado operativo. |
| **Entradas:** | • ID del Administrador autenticado, obtenido de la sesión activa.<br>• ID del recinto seleccionado.<br>• Nuevo estado del recinto: Activo, Mantenimiento o Inactivo.<br>• Aforo máximo del recinto, en caso de requerir una actualización.<br>• Confirmación de los cambios realizados. |
| **Salidas:** | • Pantalla `UI22` "Panel de Gestión de Espacios Físicos".<br>• Listado de tarjetas representativas de los recintos registrados, mostrando su nombre, tipo, aforo máximo y estado operativo.<br>• Mensaje de confirmación `MSG-P-06` "¿Desea confirmar la actualización del recinto seleccionado?".<br>• Mensaje informativo `MSG-I-13` "Operación realizada con éxito. Recinto actualizado.".<br>• Actualización de la información y disponibilidad del recinto seleccionado. |
| **Precondiciones:** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Administrador.<br>• El espacio físico que se desea modificar debe encontrarse previamente registrado en la base de datos. |
| **Postcondiciones:** | • El estado operativo o aforo máximo del recinto seleccionado se actualiza correctamente en la base de datos.<br>• Si el recinto cambia al estado "Mantenimiento" o "Inactivo", deja de estar disponible para nuevas solicitudes y reservas de eventos.<br>• Si el recinto cambia al estado "Activo", vuelve a estar disponible para nuevas solicitudes, respetando las reservas previamente registradas.<br>• Los recintos conservan su registro en la base de datos, independientemente de su estado operativo.<br>• Al pasar a Mantenimiento o Inactivo, se cancelan las reservas aprobadas del periodo afectado y se notifica dentro de la aplicación a asistentes y organizadores, conforme a `RN-37`.<br>• Si el Administrador cancela la operación, la información del recinto permanece sin modificaciones.<br>• La sesión del Administrador permanece activa. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-18` "Error de conexión con la base de datos al cargar las tarjetas.", cuando el sistema no pueda recuperar la información de los recintos.<br>• Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando ocurra una falla al actualizar la información del recinto.<br>• Se mostrará el mensaje `MSG-E-02` "Cantidad inválida. Ingrese un número entero válido.", cuando el aforo ingresado no sea un número entero positivo.<br>• Se mostrará el mensaje `MSG-E-44` "No es posible actualizar el recinto porque existen eventos aprobados que podrían verse afectados. Revise sus asignaciones.", cuando la modificación afecte las reservas existentes. |
| **Tipo:** | Primario para el actor Administrador. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Gestionar espacios físicos" desde la pantalla `UI26` "Menú Principal de Administrador".
2. ⚙️ **[Sistema]** Consulta en la base de datos la información de los espacios físicos registrados en la plataforma. `[Trayectoria B]`
3. ⚙️ **[Sistema]** Muestra la pantalla `UI22` "Panel de Gestión de Espacios Físicos", presentando las tarjetas de los recintos con su nombre, tipo, aforo máximo y estado operativo.
4. 👤 **[Actor]** Selecciona la tarjeta correspondiente al recinto que desea modificar.
5. ⚙️ **[Sistema]** Muestra la información actual del recinto seleccionado, permitiendo modificar su aforo máximo y estado operativo.
6. 👤 **[Actor]** Selecciona el nuevo estado del recinto entre las opciones "Activo", "Mantenimiento" o "Inactivo", o modifica su aforo máximo, según corresponda, y selecciona la opción `[Guardar cambios]`.
7. ⚙️ **[Sistema]** Valida que los datos ingresados sean correctos y que el aforo máximo, en caso de haberse modificado, sea un número entero positivo. `[Trayectoria D]`
8. ⚙️ **[Sistema]** Si se modifica el aforo, verifica que no se afecten reservas aprobadas; la inhabilitación por mantenimiento se gestiona según `RN-37`. `[Trayectoria C]`
9. ⚙️ **[Sistema]** Muestra el mensaje de confirmación `MSG-P-06` "¿Desea confirmar la actualización del recinto seleccionado?", con las opciones `[Aceptar]` y `[Cancelar]`. `[Trayectoria A]`
10. 👤 **[Actor]** Confirma la modificación seleccionando el botón `[Aceptar]`. `[Trayectoria A]`
11. ⚙️ **[Sistema]** Actualiza el estado operativo o aforo máximo del recinto. Si pasa a Mantenimiento o Inactivo, cancela las reservas aprobadas afectadas y genera las notificaciones internas correspondientes (`RN-37`). `[Trayectoria B]`
12. ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-13` "Operación realizada con éxito. Recinto actualizado.".
13. ⚙️ **[Sistema]** Actualiza la tarjeta correspondiente en la pantalla `UI22` "Panel de Gestión de Espacios Físicos", mostrando la información modificada.
14. 👤 **[Actor]** Visualiza la confirmación de los cambios realizados y finaliza la operación.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Cancelar la modificación del recinto
> **Condición:** Ocurre en los pasos 9 o 10 de la trayectoria principal cuando el Administrador decide no confirmar los cambios realizados.
- **A-1.** 👤 **[Actor]** Selecciona el botón `[Cancelar]` en la ventana de confirmación.
- **A-2.** ⚙️ **[Sistema]** Interrumpe la operación sin guardar los cambios realizados sobre el recinto seleccionado.
- **A-3.** ⚙️ **[Sistema]** Cierra la ventana de confirmación y mantiene al Administrador en la pantalla `UI22` "Panel de Gestión de Espacios Físicos", conservando la información original del recinto en la base de datos.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Error de conexión con la base de datos
> **Condición:** Ocurre en los pasos 2 o 11 de la trayectoria principal cuando el sistema presenta una falla de conexión con la base de datos al consultar o actualizar la información de los espacios físicos.
- **B-1.** ⚙️ **[Sistema]** Detecta una falla de conexión con la base de datos al intentar recuperar o modificar la información de los recintos.
- **B-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-18` "Error de conexión con la base de datos al cargar las tarjetas.", cuando la falla ocurre durante la consulta inicial, o el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando ocurre durante la actualización del recinto.
- **B-3.** ⚙️ **[Sistema]** Impide continuar con la operación hasta que se restablezca la conexión, sin mostrar el cambio como exitoso.
- **B-4.** ⚙️ **[Sistema]** Mantiene al Administrador en la pantalla `UI22` "Panel de Gestión de Espacios Físicos", cuando esta se encuentre disponible, permitiéndole intentar nuevamente la operación después de consultar el estado actual del recinto.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Recinto con eventos aprobados que impiden su modificación
> **Condición:** Ocurre en el paso 8 de la trayectoria principal cuando el Administrador intenta reducir el aforo por debajo de la capacidad comprometida en reservas aprobadas.
- **C-1.** ⚙️ **[Sistema]** Detecta que el recinto seleccionado cuenta con eventos aprobados cuyas reservas podrían verse afectadas por los cambios solicitados.
- **C-2.** ⚙️ **[Sistema]** Impide realizar la modificación para evitar conflictos con los eventos previamente autorizados.
- **C-3.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-44` "No es posible actualizar el recinto porque existen eventos aprobados que podrían verse afectados. Revise sus asignaciones.".
- **C-4.** ⚙️ **[Sistema]** Mantiene al Administrador en la pantalla `UI22` "Panel de Gestión de Espacios Físicos", conservando el estado y aforo original del recinto.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Aforo máximo inválido
> **Condición:** Ocurre en el paso 7 de la trayectoria principal cuando el Administrador ingresa un aforo máximo que no corresponde a un número entero positivo.
- **D-1.** ⚙️ **[Sistema]** Detecta que el aforo máximo ingresado no cumple con el formato establecido.
- **D-2.** ⚙️ **[Sistema]** Detiene la actualización y muestra el mensaje `MSG-E-02` "Cantidad inválida. Ingrese un número entero válido.".
- **D-3.** ⚙️ **[Sistema]** Mantiene al Administrador en la pantalla `UI22` "Panel de Gestión de Espacios Físicos", resaltando el campo correspondiente al aforo máximo.
- **D-4.** 👤 **[Actor]** Corrige el aforo ingresado y selecciona nuevamente la opción `[Guardar cambios]`.
- **D-5.** ⚙️ **[Sistema]** Retoma la ejecución desde el paso 7 de la trayectoria principal.

*`----- Fin de trayectoria.`*

