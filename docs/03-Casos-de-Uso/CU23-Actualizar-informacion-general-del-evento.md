---
caso_de_uso: "CU23"
nombre: "Actualizar información general del evento"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU23: Actualizar información general del evento

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: Este caso de uso permite al actor Organizador editar el texto descriptivo del evento, modificar el nivel de visibilidad y restricciones de acceso (Público, Interno o Privado/Oculto), y añadir, editar o eliminar las etiquetas temáticas y el área de conocimiento. Esto garantiza que los asistentes tengan información clara, determina quién puede registrarse, y facilita la búsqueda en la cartelera.

### 📋 Ficha de Especificación

| Caso de uso | CU23 Actualizar información general del evento |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Compaired Nieto Abdiel Raúl |
| Actor | Organizador |
| Propósito: | Permitir al Organizador modificar el texto descriptivo, configurar la accesibilidad, y asignar o editar etiquetas temáticas y áreas de conocimiento del evento. |
| Entradas: | • Se escribe desde el teclado la nueva descripción del evento.<br>• Se selecciona el tipo de alcance del evento (Público, Interno o Privado).<br>• Se escriben desde el teclado y/o seleccionan las etiquetas y el área de conocimiento. |
| Salidas: | • Mensaje unificado de éxito confirmando la actualización de la información (Agrupa MSG-28, MSG-31, MSG-33).<br>• Se mostrará el enlace directo y código de invitación si el alcance seleccionado es Privado. |
| Precondiciones: | • Que el sistema se encuentre en el punto de extensión de la pantalla "Modificar detalles de un evento".<br>• Que el evento seleccionado se encuentre activo. |
| Postcondiciones: | Se modifica en la base de datos la descripción, el nivel de visibilidad/acceso y las etiquetas del evento, alterando cómo y quién visualiza la información. |
| Errores: | • MSG-29 Dato requerido faltante en la descripción.<br>• MSG-30 La descripción excede el límite de caracteres.<br>• MSG-32 Debe seleccionar un tipo de alcance válido.<br>• MSG-34 Formato de etiqueta inválido.<br>• MSG-35 Límite de etiquetas excedido. |
| Tipo: | Secundario para el actor Organizador, viene del caso de uso "Modificar detalles de un evento". |

#### Trayectoria Principal
1. ⚙️ **[Sistema]** : Muestra la pantalla "Actualizar información general" a partir de la pantalla "Modificar detalles de un evento”, presentando un cuadro de texto con la descripción actual, resaltando la configuración de alcance actual y desplegando las etiquetas temáticas y áreas de conocimiento actuales del evento.
2. 👤 **[Actor]** : A partir de la pantalla “Actualizar información general” modifica el texto de la descripción, selecciona el nuevo tipo de alcance deseado (Público, Interno o Privado), y/o ingresa desde el teclado y selecciona las nuevas etiquetas y área de conocimiento.
3. 👤 **[Actor]** : Actualizar información general oprime el botón [Guardar]. [Trayectoria A].
4. ⚙️ **[Sistema]** : Valida que el campo de descripción de la pantalla "Actualizar información general” no se encuentre vacío [Trayectoria B], que no exceda la longitud máxima de caracteres permitidos [Trayectoria C], que se haya seleccionado una opción de alcance válida [Trayectoria D] y que las etiquetas tengan un formato válido sin exceder el límite permitido [Trayectoria E].
5. ⚙️ **[Sistema]** : Actualiza la descripción, el nivel de alcance, las etiquetas y áreas de conocimiento del evento en la base de datos de la pantalla “Actualizar información general”.
6. ⚙️ **[Sistema]** : Comprueba el tipo de alcance seleccionado y actualizado: si fue "Privado" [Trayectoria F], si fue "Público" [Trayectoria G], o si fue "Interno" [Trayectoria H].
7. ⚙️ **[Sistema]** : Muestra un mensaje de éxito general en la pantalla “Actualizar información general” indicando que la información ha sido actualizada.
8. ⚙️ **[Sistema]** : Regresa el control al caso de uso base ("Modificar detalles de un evento").

*`Fin de trayectoria.`*

#### Trayectoria alternativa A: Condición: El Organizador decide no guardar los cambios o cancela la acción.
- 👤 **[Actor]** **A-1** . En la pantalla "Actualizar información general" el organizador oprime el botón [Cancelar] o [Regresar].
- ⚙️ **[Sistema]** **A-2** . Se descarta las modificaciones realizadas en el cuadro de texto, la selección de alcance y los cambios en etiquetas que no hayan sido guardados.

*`A-3. Regresa a la pantalla principal de "Modificar detalles de un evento". Fin de trayectoria.`*

#### Trayectoria alternativa B: Condición: El Organizador deja la descripción en blanco.
- ⚙️ **[Sistema]** **B-1** . En la pantalla: "Actualizar información general muestra el mensaje MSG-29 "Dato requerido faltante. La descripción no puede estar vacía".

*`B-2. Se retoma el flujo en el paso 2 de la trayectoria principal. Fin de trayectoria.`*

#### Trayectoria alternativa C: Condición: El Organizador ingresa un texto descriptivo que excede la cantidad máxima de caracteres permitidos.
- ⚙️ **[Sistema]** **C-1** . En la pantalla "Actualizar información general muestra el mensaje MSG-30 "La descripción excede el límite máximo de caracteres permitidos".
- ⚙️ **[Sistema]** **C-2** . Bloquea la acción de guardado y resalta el cuadro de texto indicando cuántos caracteres deben eliminarse.

*`C-3. Retoma el flujo en el paso 2 de la trayectoria principal. Fin de trayectoria.`*

#### Trayectoria alternativa D: Condición: El Organizador no selecciona ninguna opción válida de alcance.
- ⚙️ **[Sistema]** **D-1** . En la pantalla "Actualizar información general" muestra el mensaje MSG-32 "Debe seleccionar un tipo de alcance válido del evento".
- ⚙️ **[Sistema]** **D-2** . Resalta el selector de alcance con un indicador de error.
- ⚙️ **[Sistema]** **D-3** . Retoma el flujo en el paso 2 de la trayectoria principal.

*`Fin de trayectoria.`*

#### Trayectoria alternativa E: Condición: El Organizador ingresa un formato inválido en las etiquetas o excede el número máximo permitido.
- ⚙️ **[Sistema]** **E-1** . En la pantalla "Actualizar información general” muestra el mensaje MSG-34 "Formato de etiqueta inválido" o MSG-35 "Límite de etiquetas excedido".
- ⚙️ **[Sistema]** **E-2** . Resalta el campo de captura de etiquetas con un indicador de error.

*`E-3. Retoma el flujo en el paso 2 de la trayectoria principal. Fin de trayectoria.`*

#### Trayectoria alternativa F: Condición: El alcance seleccionado y actualizado es "Privado".
- ⚙️ **[Sistema]** **F-1** . En la pantalla "Actualizar información general" genera de forma automática un enlace directo y un código de invitación exclusivo para el evento, indispensable para el registro de asistentes.
- ⚙️ **[Sistema]** **F-2** . Despliega en pantalla el enlace y código de invitación generados para que el organizador pueda copiarlos, integrándolos en el mensaje de éxito.

*`F-3. Retoma el flujo en el paso 8 de la trayectoria principal. Fin de trayectoria.`*

#### Trayectoria alternativa G: Condición: El alcance seleccionado y actualizado es "Público".
- ⚙️ **[Sistema]** **G-1** . En la pantalla "Actualizar información general” conserva intactos los registros y lugares de los asistentes que ya se encontraban inscritos previamente en el evento, independientemente del alcance anterior.
- ⚙️ **[Sistema]** **G-2** . Configura el evento para que la visualización y la solicitud de los lugares que aún se encuentran vacíos esté habilitada para el público en general en la cartelera.

*`G-3. Retoma el flujo en el paso 7 de la trayectoria principal (donde se muestra el mensaje de éxito). Fin de trayectoria.`*

#### Trayectoria alternativa H: Condición: El alcance seleccionado y actualizado es "Interno".
- ⚙️ **[Sistema]** **H-1** . En la pantalla: "Actualizar información general" Conserva intactos los registros y lugares de los asistentes que ya se encontraban inscritos previamente en el evento, garantizando que no pierdan su lugar.
- ⚙️ **[Sistema]** **H-2** . Configura el evento para que la visualización y la solicitud de los lugares que aún se encuentran vacíos esté restringida, permitiendo el registro únicamente a los usuarios pertenecientes a la comunidad interna.

*`H-3. Retoma el flujo en el paso 7 de la trayectoria principal (donde se muestra el mensaje de éxito). Fin de trayectoria.`*

