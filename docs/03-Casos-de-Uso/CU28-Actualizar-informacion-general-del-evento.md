---
caso_de_uso: "CU28"
nombre: "Actualizar información general del evento"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU28: Actualizar información general del evento (extend CU-27)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU27-Modificar-detalles-de-un-evento]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Este caso de uso permite al actor Organizador editar el texto descriptivo del evento y modificar el nivel de visibilidad y restricciones de acceso (`Público`, `Interno` o `Privado/Oculto`). Esto garantiza que los asistentes tengan información clara y determina quién puede consultar y registrarse al evento en la cartelera, respetando los registros de asistencia previos (`RN-40`).

### 📋 Ficha de Especificación

| Caso de uso | CU-28 Actualizar información general del evento (extend CU-27) |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Compaired Nieto Abdiel Raúl |
| **Actor:** | Organizador |
| **Propósito:** | Permitir al Organizador modificar el texto descriptivo y configurar el alcance de visibilidad/accesibilidad (`Público`, `Interno` o `Privado`) del evento. |
| **Entradas:** | • Se escribe desde el teclado la nueva descripción del evento.<br>• Se selecciona el tipo de alcance del evento (`Público`, `Interno` o `Privado`). |
| **Salidas:** | • Mensaje de éxito confirmando la actualización de la información (`MSG-I-08`, `MSG-I-10`, `MSG-I-11`).<br>• Se mostrará el enlace directo y código de invitación si el alcance seleccionado es `Privado` (`RN-29`). |
| **Precondiciones:** | • Que el sistema se encuentre en el punto de extensión de la pantalla "Modificar detalles de un evento" (`CU-27`).<br>• Que el evento seleccionado se encuentre activo. |
| **Postcondiciones:** | • Se modifica en la base de datos la descripción y el nivel de visibilidad/acceso del evento, respetando íntegramente los registros previos de asistentes (`RN-40`). |
| **Errores:** | • `MSG-E-13`: Dato requerido faltante en la descripción.<br>• `MSG-E-14`: La descripción excede el límite de caracteres.<br>• `MSG-E-15`: Debe seleccionar un tipo de alcance válido. |
| **Tipo:** | Secundario para el actor Organizador, viene del caso de uso `CU-27` "Modificar detalles de un evento". |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. ⚙️ **[Sistema]** Muestra la pantalla "Actualizar información general" (`UI16`) a partir de la pantalla "Modificar detalles de un evento", presentando un cuadro de texto con la descripción actual y resaltando la configuración de alcance actual del evento.
2. 👤 **[Actor]** A partir de la pantalla "Actualizar información general" modifica el texto de la descripción y/o selecciona el nuevo tipo de alcance deseado (`Público`, `Interno` o `Privado`).
3. 👤 **[Actor]** Oprime el botón `[Guardar]`. `[Trayectoria A]`
4. ⚙️ **[Sistema]** Valida que el campo de descripción de la pantalla "Actualizar información general" no se encuentre vacío `[Trayectoria B]`, que no exceda la longitud máxima de caracteres permitidos `[Trayectoria C]` y que se haya seleccionado una opción de alcance válida `[Trayectoria D]`.
5. ⚙️ **[Sistema]** Actualiza la descripción y el nivel de alcance del evento en la base de datos.
6. ⚙️ **[Sistema]** Comprueba el tipo de alcance seleccionado y actualizado: si fue "Privado" `[Trayectoria E]`, si fue "Público" `[Trayectoria F]`, o si fue "Interno" `[Trayectoria G]`.
7. ⚙️ **[Sistema]** Muestra un mensaje de éxito en la pantalla "Actualizar información general" indicando que la información ha sido actualizada (`MSG-I-08` / `MSG-I-10` / `MSG-I-11`).
8. ⚙️ **[Sistema]** Regresa el control al caso de uso base (`CU-27` "Modificar detalles de un evento").

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Cancelar la actualización
> **Condición:** El Organizador decide no guardar los cambios o cancela la acción.
- **A-1.** 👤 **[Actor]** En la pantalla "Actualizar información general" el organizador oprime el botón `[Cancelar]` o `[Regresar]`.
- **A-2.** ⚙️ **[Sistema]** Se descartan las modificaciones realizadas en el cuadro de texto y en la selección de alcance que no hayan sido guardadas.
- **A-3.** ⚙️ **[Sistema]** Regresa a la pantalla principal de "Modificar detalles de un evento".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Descripción vacía
> **Condición:** El Organizador deja la descripción en blanco.
- **B-1.** ⚙️ **[Sistema]** En la pantalla "Actualizar información general" muestra el mensaje `MSG-E-13` "Dato requerido faltante. La descripción no puede estar vacía.".
- **B-2.** ⚙️ **[Sistema]** Se retoma el flujo en el paso 2 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Descripción excede límite de caracteres
> **Condición:** El Organizador ingresa un texto descriptivo que excede la cantidad máxima de caracteres permitidos.
- **C-1.** ⚙️ **[Sistema]** En la pantalla "Actualizar información general" muestra el mensaje `MSG-E-14` "La descripción excede el límite máximo de caracteres permitidos.".
- **C-2.** ⚙️ **[Sistema]** Bloquea la acción de guardado y resalta el cuadro de texto indicando cuántos caracteres deben eliminarse.
- **C-3.** ⚙️ **[Sistema]** Retoma el flujo en el paso 2 de la trayectoria principal.

*`---- Fin de trayectoria.`*

#### Trayectoria alternativa D: Alcance inválido
> **Condición:** El Organizador no selecciona ninguna opción válida de alcance.
- **D-1.** ⚙️ **[Sistema]** En la pantalla "Actualizar información general" muestra el mensaje `MSG-E-15` "Debe seleccionar un tipo de alcance válido para continuar.".
- **D-2.** ⚙️ **[Sistema]** Resalta el selector de alcance con un indicador de error.
- **D-3.** ⚙️ **[Sistema]** Retoma el flujo en el paso 2 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa E: Alcance Privado
> **Condición:** El alcance seleccionado y actualizado es "Privado".
- **E-1.** ⚙️ **[Sistema]** En la pantalla "Actualizar información general" genera de forma automática un enlace directo y un código de invitación exclusivo para el evento, indispensable para el registro de asistentes (`RN-29`).
- **E-2.** ⚙️ **[Sistema]** Despliega en pantalla el enlace y código de invitación generados para que el organizador pueda copiarlos, integrándolos en el mensaje de éxito.
- **E-3.** ⚙️ **[Sistema]** Retoma el flujo en el paso 8 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa F: Alcance Público
> **Condición:** El alcance seleccionado y actualizado es "Público".
- **F-1.** ⚙️ **[Sistema]** En la pantalla "Actualizar información general" conserva intactos los registros y lugares de los asistentes que ya se encontraban inscritos previamente en el evento, independientemente del alcance anterior (`RN-40`).
- **F-2.** ⚙️ **[Sistema]** Configura el evento para que la visualización y la solicitud de los lugares que aún se encuentran vacíos esté habilitada para el público en general en la cartelera (`RN-27`).
- **F-3.** ⚙️ **[Sistema]** Retoma el flujo en el paso 7 de la trayectoria principal (donde se muestra el mensaje de éxito).

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa G: Alcance Interno
> **Condición:** El alcance seleccionado y actualizado es "Interno".
- **G-1.** ⚙️ **[Sistema]** En la pantalla "Actualizar información general" conserva intactos los registros y lugares de los asistentes que ya se encontraban inscritos previamente en el evento, garantizando que no pierdan su lugar (`RN-40`).
- **G-2.** ⚙️ **[Sistema]** Configura el evento para que la visualización y la solicitud de los lugares que aún se encuentran vacíos esté restringida, permitiendo el registro únicamente a los usuarios pertenecientes a la comunidad interna (`RN-28`).
- **G-3.** ⚙️ **[Sistema]** Retoma el flujo en el paso 7 de la trayectoria principal (donde se muestra el mensaje de éxito).

*`----- Fin de trayectoria.`*
