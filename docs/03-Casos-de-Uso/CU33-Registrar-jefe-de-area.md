---
caso_de_uso: "CU-33"
nombre: "Registrar jefe de área"
actor: "Administrador."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-33: Registrar jefe de área

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** Permitir al Administrador registrar a un usuario previamente existente en la plataforma como jefe de área, mediante la búsqueda de su cuenta por correo electrónico, la asignación de un número de empleado y la selección del departamento correspondiente. El sistema garantizará que el usuario se encuentre registrado y activo, evitando asignaciones duplicadas y manteniendo un control de los jefes de área registrados.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-33 Registrar jefe de área** |
| **Autor** | Vargas Rodriguez Leonardo |
| **Actor** | Administrador. |
| **Propósito** | Permitir al Administrador asignar el cargo de jefe de área a un usuario previamente registrado en la plataforma con correo institucional de personal (`@ipn.mx`, excluyendo cuentas de alumnos `@alumno.ipn.mx` y externas), vinculándolo con un departamento y un número de empleado, sin necesidad de crear una nueva cuenta de usuario. |
| **Entradas** | • ID del Administrador autenticado, obtenido de la sesión activa.<br>• Correo electrónico institucional (`@ipn.mx`) del usuario que se desea localizar.<br>• ID del usuario seleccionado de los resultados de búsqueda.<br>• Número de empleado del usuario (obligatorio).<br>• Departamento al que será asignado el usuario (obligatorio).<br>• Selección de la opción [Asignar Jefatura]. |
| **Salidas** | • Pantalla **UI24** "Asignar Jefes de Departamento" *(antes `UI34` en borradores previos)*.<br>• Resultados de la búsqueda de usuarios registrados elegibles (`@ipn.mx`), obtenidos mediante el correo electrónico proporcionado.<br>• Visualización automática del nombre completo y correo electrónico del usuario seleccionado.<br>• Listado de jefes de área registrados, mostrando número de empleado, nombre, departamento y estatus del cargo.<br>• Mensaje informativo **MSG-I-08** "Operación realizada con éxito.", cuando se complete correctamente la asignación.<br>• Registro de la jefatura asociada al usuario y departamento seleccionado.<br>• Actualización del listado de jefes de área, mostrando el nuevo registro con estatus "Activo". |
| **Precondiciones** | • El Administrador debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El Administrador debe haber iniciado sesión correctamente mediante el CU-01 "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Administrador.<br>• El usuario que será registrado como jefe de área debe contar previamente con una cuenta registrada y activa en el sistema con dominio institucional **`@ipn.mx`** (se rechazan cuentas `@alumno.ipn.mx` y externas).<br>• El departamento al que será asignado el usuario debe encontrarse registrado y disponible para su selección.<br>• El usuario no debe contar previamente con una asignación activa de jefatura en el mismo departamento.<br>• El número de empleado no debe encontrarse asociado a otra cuenta de usuario. |
| **Postcondiciones** | • El usuario seleccionado queda registrado como jefe de área del departamento correspondiente.<br>• El número de empleado queda asociado a la cuenta del usuario seleccionado.<br>• El registro de la jefatura se almacena correctamente en la base de datos con el estatus "Activo".<br>• El sistema actualiza el listado de jefes de área registrados en la pantalla **UI24** "Asignar Jefes de Departamento".<br>• La cuenta original del usuario permanece registrada, conservando su información personal y credenciales de acceso.<br>• El sistema evita crear una nueva cuenta de usuario durante el proceso de asignación de jefatura.<br>• Si el Administrador abandona el proceso antes de confirmar la asignación, no se realiza ninguna modificación en la base de datos.<br>• La sesión del Administrador permanece activa. |
| **Errores** | • Se mostrará el mensaje **MSG-E-11** "Por favor, completa todos los campos obligatorios resaltados para continuar.", cuando el Administrador omita el número de empleado o no seleccione un departamento.<br>• Se mostrará el mensaje **MSG-E-21** "Advertencia: Ingrese un correo válido.", cuando el correo electrónico utilizado para realizar la búsqueda tenga un formato incorrecto.<br>• Se mostrará el mensaje **MSG-E-43** "La cuenta seleccionada no existe o ya no se encuentra disponible.", cuando no se encuentre un usuario asociado al correo electrónico proporcionado o su cuenta se encuentre inactiva.<br>• Se mostrará el mensaje **MSG-E-51** "El usuario seleccionado ya tiene una jefatura activa en el departamento indicado.", cuando se intente realizar una asignación duplicada.<br>• Se mostrará el mensaje **MSG-E-52** "El número de empleado ingresado ya se encuentra asignado a otro usuario.", cuando exista previamente un registro asociado al número proporcionado.<br>• Se mostrará el mensaje **MSG-E-53** "El número de empleado debe contener únicamente caracteres numéricos.", cuando el Administrador proporcione un número de empleado con caracteres no permitidos.<br>• Se mostrará el mensaje **MSG-E-08** "Error de conexión con la base de datos.", cuando el sistema no pueda consultar o registrar correctamente la información debido a una falla de conexión. |
| **Tipo** | Primario para el actor Administrador. |

**Trayectorias del caso de uso:**


### Trayectoria Principal

1. selecciona la opción "Asignar jefe de departamento" desde la pantalla **UI26** "Menú Principal de Administrador".
2. muestra la pantalla **UI24** "Asignar Jefes de Departamento", presentando un campo de búsqueda por correo electrónico institucional (`@ipn.mx`), los campos correspondientes a los datos del usuario, el selector de departamento y el listado de jefes de área registrados.
3. ingresa el correo electrónico del usuario que desea registrar como jefe de área en el apartado de búsqueda.
4. valida el formato del correo electrónico y que corresponda a una cuenta de personal `@ipn.mx` (bloqueando `@alumno.ipn.mx` y externos), consultando en la base de datos las cuentas registradas que coincidan. [Trayectoria A] [Trayectoria D]
5. presenta el usuario encontrado y verifica que su cuenta se encuentre activa. [Trayectoria A]
6. selecciona el usuario correspondiente de los resultados de búsqueda.
7. obtiene los datos del usuario seleccionado y completa automáticamente los campos "Nombre completo" y "Correo electrónico", impidiendo su modificación desde el formulario de asignación.
8. ingresa el número de empleado y selecciona el departamento al que será asignado el usuario.
9. selecciona la opción [Asignar Jefatura].
10. verifica que el número de empleado y el departamento hayan sido proporcionados correctamente. [Trayectoria B]
11. consulta en la base de datos si el número de empleado ya se encuentra asociado a otro usuario o si el usuario seleccionado ya tiene una jefatura activa en el departamento indicado. [Trayectoria C] [Trayectoria D]
12. registra la asignación del usuario como jefe de área del departamento seleccionado, asociando su número de empleado y estableciendo el estatus del cargo como "Activo". [Trayectoria D]
13. muestra el mensaje **MSG-I-08** "Operación realizada con éxito." en la pantalla **UI24** "Asignar Jefes de Departamento".
14. actualiza el listado de jefes de área registrados, mostrando la información del nuevo jefe de área y su estatus correspondiente.
15. visualiza la confirmación de la asignación y finaliza la operación.

*Fin de la trayectoria.*


### Trayectoria alternativa A: Usuario no encontrado o cuenta inactiva

> **Condición:** Ocurre en los pasos 4 o 5 de la trayectoria principal cuando el sistema no encuentra una cuenta asociada al correo electrónico ingresado, el correo tiene un formato incorrecto o la cuenta localizada se encuentra inactiva.

- **A-1.** detecta que el correo electrónico proporcionado no cumple con el formato establecido o que la consulta no devuelve una cuenta activa disponible.
- **A-2.** muestra **MSG-E-21** "Advertencia: Ingrese un correo válido.", cuando el formato sea incorrecto, o **MSG-E-43** "La cuenta seleccionada no existe o ya no se encuentra disponible.", cuando no exista una cuenta activa asociada al correo proporcionado.
- **A-3.** impide seleccionar al usuario y mantiene los campos de información personal sin completar.
- **A-4.** corrige el correo electrónico o proporciona otro correo correspondiente a una cuenta registrada.
- **A-5.** retoma la ejecución desde el paso 4 de la trayectoria principal para realizar nuevamente la búsqueda.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Datos obligatorios incompletos o número de empleado inválido

> **Condición:** Ocurre en el paso 10 de la trayectoria principal cuando el Administrador intenta asignar una jefatura sin ingresar el número de empleado, sin seleccionar un departamento o proporcionando un número de empleado con caracteres no permitidos.

- **B-1.** identifica que uno o más campos obligatorios se encuentran vacíos o que el número de empleado no cumple con el formato establecido.
- **B-2.** detiene el proceso de asignación y muestra **MSG-E-11** "Por favor, completa todos los campos obligatorios resaltados para continuar.", cuando existan campos vacíos, o **MSG-E-53** "El número de empleado debe contener únicamente caracteres numéricos.", cuando el formato sea incorrecto.
- **B-3.** mantiene al Administrador en la pantalla **UI24** "Asignar Jefes de Departamento", resaltando los campos que requieren corrección.
- **B-4.** completa o corrige la información y selecciona nuevamente [Asignar Jefatura].
- **B-5.** retoma la ejecución desde el paso 10 de la trayectoria principal para validar nuevamente los datos ingresados.

*Fin de la trayectoria.*


### Trayectoria alternativa C: Jefatura previamente registrada o número de empleado duplicado

> **Condición:** Ocurre en el paso 11 de la trayectoria principal cuando el sistema identifica que el usuario seleccionado ya cuenta con una jefatura activa en el departamento indicado o que el número de empleado pertenece a otro usuario.

- **C-1.** consulta los registros de jefes de área y los números de empleado asociados a las cuentas existentes.
- **C-2.** detecta que alguna de las condiciones necesarias para realizar la asignación no se cumple.
- **C-3.** impide la asignación y muestra **MSG-E-51** "El usuario seleccionado ya tiene una jefatura activa en el departamento indicado.", cuando exista una jefatura duplicada, o **MSG-E-52** "El número de empleado ingresado ya se encuentra asignado a otro usuario.", cuando el número pertenezca a otra cuenta.
- **C-4.** mantiene al Administrador en la pantalla **UI24** "Asignar Jefes de Departamento", conservando la información del usuario seleccionado.
- **C-5.** corrige el número de empleado cuando corresponda o selecciona otro usuario disponible para realizar la asignación.
- **C-6.** retoma la ejecución desde el paso 10 de la trayectoria principal para validar nuevamente la información.

*Fin de la trayectoria.*


### Trayectoria alternativa D: Error de conexión con la base de datos

> **Condición:** Ocurre en los pasos 4, 11 o 12 de la trayectoria principal cuando el sistema no puede consultar o registrar correctamente la información del usuario o de la jefatura debido a una falla de conexión con la base de datos.

- **D-1.** detecta una falla de conexión al intentar localizar al usuario, verificar las asignaciones existentes o almacenar el nuevo registro.
- **D-2.** muestra **MSG-E-08** "Error de conexión con la base de datos.", notificando al Administrador que no fue posible completar o verificar la operación.
- **D-3.** impide presentar la asignación como exitosa mientras no se haya confirmado su registro.
- **D-4.** mantiene al Administrador en la pantalla **UI24** "Asignar Jefes de Departamento", conservando la información ingresada.
- **D-5.** permite intentar nuevamente la operación una vez restablecida la conexión, verificando previamente si la asignación fue registrada para evitar duplicidades.

*Fin de la trayectoria.*


### Trayectoria alternativa E: Abandonar el registro de jefe de área

> **Condición:** Ocurre antes del paso 9 de la trayectoria principal cuando el Administrador decide abandonar el formulario sin asignar la jefatura.

- **E-1.** selecciona la opción [Volver al panel central] desde la pantalla **UI24** "Asignar Jefes de Departamento".
- **E-2.** interrumpe el proceso sin registrar una nueva asignación ni modificar la información del usuario seleccionado.
- **E-3.** redirige al Administrador a la pantalla **UI26** "Menú Principal de Administrador".

*Fin de la trayectoria.*
