---
caso_de_uso: "CU-27"
nombre: "Actualizar información general del evento (extend CU-26)"
actor: "Organizador"
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-27: Actualizar información general del evento (extend CU-26)

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** Este caso de uso permite al actor Organizador editar el texto descriptivo del evento, modificar el nivel de visibilidad y restricciones de acceso (Público, Interno o Privado/Oculto), y añadir, editar o eliminar las etiquetas temáticas y el área de conocimiento. Esto garantiza que los asistentes tengan información clara, determina quién puede registrarse, y facilita la búsqueda en la cartelera.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-27 Actualizar información general del evento (extend CU-26)** |
| **Autor** | Compaired Nieto Abdiel Raúl |
| **Actor** | Organizador |
| **Propósito** | Permitir al Organizador modificar el texto descriptivo, configurar la accesibilidad, y asignar o editar etiquetas temáticas y áreas de conocimiento del evento. |
| **Entradas** | • Se escribe desde el teclado la nueva descripción del evento.<br>• Se selecciona el tipo de alcance del evento (Público, Interno o Privado).<br>• Opcionalmente se actualiza el póster en almacenamiento público Cloudflare R2 (`2048×1152`) y los enlaces o ponentes en `UI16`.<br>• Se escriben desde el teclado y/o seleccionan las etiquetas y el área de conocimiento. |
| **Salidas** | • Mensaje unificado de éxito confirmando la actualización de la información en `UI16` "Formulario de Modificación de Evento".<br>• Habilitación de la gestión granular por subevento del padrón de invitados privados (correo individual, carga masiva por lotes/CSV, enlace compartible `/eventos/privado/:tokenSubEvento`, reenvío con cooldown de 8h y revocación) si el alcance seleccionado es Privado (`RN-05`, `RN-29`). |
| **Precondiciones** | • Que el sistema se encuentre en el punto de extensión de la pantalla "Modificar detalles de un evento".<br>• Que el evento seleccionado se encuentre activo. |
| **Postcondiciones** | Se modifica en la base de datos la descripción, el nivel de visibilidad/acceso y las etiquetas del evento, alterando cómo y quién visualiza la información. |
| **Errores** | • **MSG-E-13** Dato requerido faltante en la descripción.<br>• **MSG-E-14** La descripción excede el límite de caracteres.<br>• **MSG-E-15** Debe seleccionar un tipo de alcance válido.<br>• **MSG-E-16** Formato de etiqueta inválido.<br>• **MSG-E-17** Límite de etiquetas excedido. |
| **Tipo** | Secundario para el actor Organizador, viene del caso de uso **CU-26** "Modificar detalles de un evento" (`<<extend>>`). |


### Trayectoria Principal

1. Muestra la pantalla "Actualizar información general" a partir de la pantalla "Modificar detalles de un evento”, presentando un cuadro de texto con la descripción actual, resaltando la configuración de alcance actual y desplegando las etiquetas temáticas y áreas de conocimiento actuales del evento.
2. A partir de la pantalla “Actualizar información general” modifica el texto de la descripción, selecciona el nuevo tipo de alcance deseado (Público, Interno o Privado), y/o ingresa desde el teclado y selecciona las nuevas etiquetas y área de conocimiento.
3. En Actualizar información general oprime el botón [Guardar]. [Trayectoria A]
4. Valida que el campo de descripción de la pantalla "Actualizar información general” no se encuentre vacío [Trayectoria B], que no exceda la longitud máxima de caracteres permitidos [Trayectoria C], que se haya seleccionado una opción de alcance válida [Trayectoria D] y que las etiquetas tengan un formato válido sin exceder el límite permitido [Trayectoria E].
5. Actualiza la descripción, el nivel de alcance, las etiquetas y áreas de conocimiento del evento en la base de datos desde la pantalla “Actualizar información general”.
6. Comprueba el tipo de alcance seleccionado y actualizado: si fue "Privado" [Trayectoria F], si fue "Público" [Trayectoria G], o si fue "Interno" [Trayectoria H].
7. Muestra un mensaje de éxito general en la pantalla “Actualizar información general” indicando que la información ha sido actualizada.
8. Regresa el control al caso de uso base ("Modificar detalles de un evento").

*Fin de la trayectoria.*


### Trayectoria alternativa A: El Organizador decide no guardar los cambios o cancela la acción

- **A-1.** En la pantalla "Actualizar información general" el organizador oprime el botón [Cancelar] o [Regresar].
- **A-2.** Se descartan las modificaciones realizadas en el cuadro de texto, la selección de alcance y los cambios en etiquetas que no hayan sido guardados.
- **A-3.** Regresa a la pantalla principal de "Modificar detalles de un evento".

*Fin de la trayectoria.*


### Trayectoria alternativa B: El Organizador deja la descripción en blanco

- **B-1.** En la pantalla "Actualizar información general" muestra el mensaje MSG-E-13 "Dato requerido faltante. La descripción no puede estar vacía".
- **B-2.** Se retoma el flujo en el paso 2 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa C: El Organizador ingresa un texto descriptivo que excede la cantidad máxima de caracteres permitidos

- **C-1.** En la pantalla "Actualizar información general" muestra el mensaje MSG-E-14 "La descripción excede el límite máximo de caracteres permitidos".
- **C-2.** Bloquea la acción de guardado y resalta el cuadro de texto indicando cuántos caracteres deben eliminarse.
- **C-3.** Retoma el flujo en el paso 2 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa D: El Organizador no selecciona ninguna opción válida de alcance

- **D-1.** En la pantalla "Actualizar información general" muestra el mensaje MSG-E-15 "Debe seleccionar un tipo de alcance válido del evento".
- **D-2.** Resalta el selector de alcance con un indicador de error.
- **D-3.** Retoma el flujo en el paso 2 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa E: El Organizador ingresa un formato inválido en las etiquetas o excede el número máximo permitido

- **E-1.** En la pantalla "Actualizar información general” muestra el mensaje MSG-E-16 "Formato de etiqueta inválido" o MSG-E-17 "Límite de etiquetas excedido".
- **E-2.** Resalta el campo de captura de etiquetas con un indicador de error.
- **E-3.** Retoma el flujo en el paso 2 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa F: El alcance seleccionado y actualizado es "Privado"

- **F-1.** En **UI16** "Formulario de Modificación de Evento" habilita la gestión granular de invitados privados **por subevento** (`"invitacionEvento"."idSubEvento"`), permitiendo al Organizador agregar correos individuales, ejecutar carga masiva por lotes/CSV, generar enlace compartible (`/eventos/privado/:tokenSubEvento`), reenviar invitaciones respetando el *cooldown* de 8 horas o revocar invitaciones. Si el evento provenía de alcance `Público` o `Interno`, el sistema incorpora automáticamente en `"invitacionEvento"` por subevento a los asistentes que ya tenían un boleto activo (`VALIDO` o `UTILIZADO`) para que conserven su acceso y aparezcan en el padrón.
- **F-2.** Las altas individuales y bajas de invitados (así como bajas de personal de logística) preparadas en `UI16` permanecen en estado pendiente hasta pulsar **[Guardar cambios]** / **[Confirmar cambios]** (mientras la carga masiva por lotes y el enlace privado reportan de inmediato los resultados de su operación por subevento); al confirmar se envían los correos a los nuevos invitados, se revocan las invitaciones eliminadas, se cancelan automáticamente los boletos activos previos de los invitados removidos en ese subevento (notificándoles por correo solo si tenían boleto activo) y se persisten las modificaciones de ponentes (`CU-10`).
- **F-3.** Retoma el flujo en el paso 8 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa G: El alcance seleccionado y actualizado es "Público"

- **G-1.** En la pantalla "Actualizar información general” conserva intactos los registros y lugares de los asistentes que ya se encontraban inscritos previamente en el evento, independientemente del alcance anterior. Si el evento provenía de alcance `Privado`, limpia el padrón de invitaciones previas (`"invitacionEvento"`) sin afectar los boletos emitidos.
- **G-2.** Configura el evento para que la visualización y la solicitud de los lugares que aún se encuentran vacíos esté habilitada para el público en general en la cartelera.
- **G-3.** Retoma el flujo en el paso 7 de la trayectoria principal (donde se muestra el mensaje de éxito).

*Fin de la trayectoria.*


### Trayectoria alternativa H: El alcance seleccionado y actualizado es "Interno"

- **H-1.** En la pantalla "Actualizar información general" conserva intactos los registros y lugares de los asistentes que ya se encontraban inscritos previamente en el evento (incluidos usuarios externos con boleto emitido antes del cambio, quienes conservan acceso de consulta en `UI05`), garantizando que no pierdan su lugar. Si el evento provenía de alcance `Privado`, limpia el padrón de invitaciones previas (`"invitacionEvento"`).
- **H-2.** Configura el evento para que la visualización general en cartelera y la solicitud de los lugares que aún se encuentran vacíos queden restringidas únicamente a los usuarios pertenecientes a la comunidad interna.
- **H-3.** Retoma el flujo en el paso 7 de la trayectoria principal (donde se muestra el mensaje de éxito).

*Fin de la trayectoria.*
