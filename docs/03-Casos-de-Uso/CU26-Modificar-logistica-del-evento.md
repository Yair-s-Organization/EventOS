---
caso_de_uso: "CU26"
nombre: "Modificar logística del evento"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU26: Modificar logística (fecha, hora, espacio) del evento (extend CU-25)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU25-Consultar-mis-eventos]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permite al Organizador reprogramar o reubicar un evento previamente creado, actualizando su fecha, horario o recinto, requiriendo obligatoriamente una justificación y notificando a los asistentes.

### 📋 Ficha de Especificación

| Caso de uso | CU-26 Modificar logística del evento (extend CU-25). |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Jorge Eduardo Boisson Martínez |
| **Actor:** | Organizador |
| **Propósito:** | Actualizar la logística del evento, garantizando que los asistentes estén informados y que no existan empalmes de infraestructura y horario en la escuela. |
| **Entradas:** | • Nueva fecha, nueva hora de inicio/fin, nuevo espacio físico.<br>• Motivo de posposición o cambio de recinto. |
| **Salidas:** | • Ventana modal para ingreso de motivo y mensajes de confirmación visual `MSG-I-08` / `MSG-I-09`. |
| **Precondiciones:** | • El usuario debe haber consultado sus eventos (`CU-25`) y haber seleccionado el botón Modificar en la pantalla `UI14`. |
| **Postcondiciones:** | • El evento actualiza sus datos logísticos.<br>• El sistema libera el espacio físico anterior y ocupa el nuevo.<br>• El estado del evento se mantiene en "Aprobado" o cambia a "Pendiente" (`RN-31`). |
| **Errores:** | • `MSG-E-11`: "Por favor, completa todos los campos obligatorios resaltados para continuar."<br>• `MSG-E-24`: "El lugar seleccionado ya no se encuentra disponible."<br>• `MSG-E-14`: "La descripción excede el límite máximo de caracteres permitidos." |
| **Tipo:** | Extensión de `CU-25`. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona "Ver detalles" / "Modificar" en la pantalla `UI14` "Panel de Consulta de Mis Eventos".
2. ⚙️ **[Sistema]** Cambia a la pantalla `UI15` "Panel de Administración y Detalles del Evento". Despliega el formulario con los datos logísticos actuales y muestra las opciones de recintos filtradas por disponibilidad.
3. 👤 **[Actor]** Ingresa la nueva fecha, ajusta el recinto y/o horario y da clic en el botón de guardar cambios. `[Trayectoria A]`
4. ⚙️ **[Sistema]** Muestra el modal exigiendo un motivo para el cambio (`RN-25`).
5. 👤 **[Actor]** Escribe la justificación y confirma la acción. `[Trayectoria B]` `[Trayectoria C]`
6. ⚙️ **[Sistema]** Verifica que se cumpla el tiempo de anticipación (`RN-23`, `RN-31`), valida la disponibilidad para evitar colisiones (`RN-06`, `RN-10`) `[Trayectoria D]` y comprueba si la duración total se mantiene igual a la original. `[Trayectoria A]`
7. ⚙️ **[Sistema]** Guarda los cambios, mantiene el estado de "Aprobado", genera notificaciones internas para los asistentes informando la reprogramación y muestra el `MSG-I-08` de confirmación.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Extensión de la duración del evento (RN-31)
> **Condición:** El bloque de horario difiere de la duración original aprobada (`RN-31`).
- **A-1.** ⚙️ **[Sistema]** Detecta que el bloque de horario difiere de la duración original aprobada.
- **A-2.** ⚙️ **[Sistema]** Actualiza los datos logísticos en la base de datos y revoca la aprobación, cambiando el estado del evento a "Pendiente" para revisión por la Subdirección.
- **A-3.** ⚙️ **[Sistema]** Envía la notificación correspondiente a los asistentes y muestra el mensaje `MSG-I-09`: "Operación realizada con éxito. Evento en espera de revisión debido a cambio de duración.".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Campos obligatorios vacíos
> **Condición:** Ocurre al presionar el botón guardar con campos vacíos.
- **B-1.** ⚙️ **[Sistema]** Detecta que el campo de motivo está vacío.
- **B-2.** ⚙️ **[Sistema]** Resalta el área de texto en el modal y muestra el mensaje `MSG-E-11`: "Por favor, completa todos los campos obligatorios resaltados para continuar.".
- **B-3.** ⚙️ **[Sistema]** Mantiene la ventana modal activa hasta que se ingrese el texto o se cancele la acción.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Límite de caracteres excedido
> **Condición:** Ocurre si el nombre del evento o la descripción/motivo supera la longitud permitida.
- **C-1.** ⚙️ **[Sistema]** Detecta que la longitud del texto sobrepasa el límite máximo establecido.
- **C-2.** ⚙️ **[Sistema]** Muestra en el modal el mensaje `MSG-E-14`: "La descripción excede el límite máximo de caracteres permitidos.".
- **C-3.** ⚙️ **[Sistema]** Bloquea la confirmación y resalta el campo en rojo.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Espacio o lugar no disponible
> **Condición:** Ocurre cuando el recinto seleccionado ya fue apartado por otro evento en el mismo intervalo de tiempo o no cuenta con disponibilidad operativa.
- **D-1.** ⚙️ **[Sistema]** Detecta una colisión de horarios o falta de disponibilidad en el recinto seleccionado (`RN-06`, `RN-10`).
- **D-2.** ⚙️ **[Sistema]** Muestra en la pantalla `UI16` el mensaje `MSG-E-24`: "El lugar seleccionado ya no se encuentra disponible.".
- **D-3.** ⚙️ **[Sistema]** Permite al usuario seleccionar un recinto alternativo o ajustar el horario.

*`----- Fin de trayectoria.`*

