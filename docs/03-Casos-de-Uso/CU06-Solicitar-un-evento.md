---
caso_de_uso: "CU06"
nombre: "Solicitar un evento"
actor: "Asistente, Subdirección de Servicios Educativos"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU06: Solicitar un evento

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: Permite al Asistente registrar una solicitud de evento ante Subdirección de Servicios Educativos.

### 📋 Ficha de Especificación

| Caso de uso | CU-06 Solicitar un evento |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Santiago Jaimes Jaramillo |
| Actor | Asistente, Subdirección de Servicios Educativos |
| Propósito: | Permitir al Asistente o a Subdirección de Servicios Educativos registrar una solicitud de evento; en el caso del Asistente queda pendiente de evaluación, mientras que si la registra Subdirección se aprueba automáticamente. |
| Entradas: | Se escriben desde el teclado el nombre del evento, la descripción, la fecha, hora de inicio y hora de finalización.<br>Se selecciona el alcance del evento (Público, Interno, Privado).<br>Si el actor es Asistente: se selecciona el tipo de solicitante (Estudiante, Empresa, Externo) y se sube el documento de identidad correspondiente. |
| Salidas: | Se mostrará en pantalla el mensaje MSG-24 "Operación realizada con éxito." al registrar la solicitud. |
| Precondiciones: | Que el usuario haya iniciado sesión en el sistema. |
| Postcondiciones: | Si el actor es Asistente, se crea la solicitud con estado “Pendiente”.<br>Si el actor es Subdirección, se crea la solicitud con estado “Aprobado” directo. |
| Errores: | Se mostrará el MSG-17 “Por favor, completa todos los campos obligatorios resaltados para continuar.” cuando se intente enviar la solicitud con campos obligatorios vacíos. |
| Tipo: | Primario para los actores Asistente y Subdirección de Servicios Educativos. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** El actor selecciona la opción “Solicitar un evento” desde panel UI03 “Menú Principal del Asistente”.
2. ⚙️ **[Sistema]** El sistema muestra el formulario de solicitud de evento UI07 “Formulario de Solicitud de Evento”.
3. 👤 **[Actor]** El actor captura nombre del evento, descripción, fecha, hora de inicio y hora de finalización.
4. 👤 **[Actor]** El actor selecciona el alcance del evento.
5. 👤 **[Actor]** El actor oprime el botón [Enviar solicitud].
6. ⚙️ **[Sistema]** El sistema valida que todos los campos obligatorios estén completos.
7. ⚙️ **[Sistema]** El sistema identifica el rol del actor. [Trayectoria A] [Trayectoria B]
8. ⚙️ **[Sistema]** El sistema registra la solicitud.
9. ⚙️ **[Sistema]** El sistema muestra el MSG-24.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** El actor que solicita es Asistente.
- 👤 **[Actor]** **A-1** El sistema solicita seleccionar el tipo de solicitante: Estudiante, Empresa o Externo en UI07 “Formulario de Solicitud de Evento”.A-2 El Asistente selecciona el tipo de solicitante.
- ⚙️ **[Sistema]** **A-3** Si seleccionó “Estudiante”, el sistema solicita credencial de ESCOM/IPN.
- ⚙️ **[Sistema]** **A-4** Si seleccionó “Externo”, el sistema solicita INE.
- ⚙️ **[Sistema]** **A-5** Si seleccionó “Empresa”, el sistema solicita acta constitutiva.
- 👤 **[Actor]** **A-6** El Asistente sube el documento de identidad correspondiente.
- ⚙️ **[Sistema]** **A-7** El sistema registra la solicitud con estado “Pendiente”.

*`A-8 Retoma el flujo en el paso 9 de la trayectoria principal.----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** El actor que solicita es Subdirección de Servicios Educativos.
- ⚙️ **[Sistema]** **B-1** El sistema registra la solicitud con estado “Aprobado” (RN-13), sin requerir tipo de solicitante ni documento de identidad.
- ⚙️ **[Sistema]** **B-2** Retoma el flujo en el paso 9 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C:
> **Condición:** Algún campo obligatorio se deja vacío.
- ⚙️ **[Sistema]** **C-1** El sistema muestra el MSG-17 en UI07 “Formulario de Solicitud de Evento”.
- ⚙️ **[Sistema]** **C-2** El sistema resalta los campos incompletos
- ⚙️ **[Sistema]** **C-3** Retoma el flujo en el paso 3 de la trayectoria principal.

*`----- Fin de trayectoria.`*

