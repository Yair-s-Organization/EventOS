---
caso_de_uso: "CU05"
nombre: "Cancelar evento"
actor: "Subdirección de Servicios Educativos"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU05: Cancelar evento

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
El actor Subdirección de Servicios Educativos cancela un evento previamente aprobado, para lo cual debe ingresar un motivo obligatorio, lo que resulta en la liberación del espacio físico y la notificación a los asistentes.

### 📋 Ficha de Especificación

| Caso de uso | CU05 Cancelar evento |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Benitez Alvarez Efrain |
| Actor | Subdirección de Servicios Educativos |
| Propósito: | Permitir la anulación de un evento de forma controlada, garantizando que los espacios físicos vuelvan a estar disponibles y que la comunidad sea informada adecuadamente. |
| Entradas: | Motivo de cancelación (obligatorio).<br>Confirmación explícita de la acción irreversible. |
| Salidas: | Notificación por correo electrónico a los asistentes registrados.<br>Actualización del estado del evento a "Cancelado". |
| Precondiciones: | El actor debe tener el rol de Subdirección de Servicios Educativos.<br>El evento debe contar con una reserva previamente aprobada en el sistema. |
| Postcondiciones: | Se restituye en su totalidad la disponibilidad operativa del espacio físico, anulando cualquier derecho de exclusividad sobre la fecha y hora.<br>Cualquier boleto expedido para el evento queda anulado.<br>Los asistentes registrados reciben una notificación oportuna que incluye el motivo de la cancelación.<br>El evento cancelado queda registrado en la bitácora histórica del sistema. |
| Errores: | El actor intenta confirmar la cancelación sin redactar un motivo.<br>MSG17 |
| Tipo: | Secundario para el actor Subdirección de Servicios Educativos, extiende el caso de uso CU04 Consultar eventos aprovados. |

#### Trayectoria Principal
1. 👤 **[Actor]** El actor accede a los detalles de su evento previamente aprobado y selecciona la acción de cancelar evento.
2. ⚙️ **[Sistema]** El sistema solicita ingresar obligatoriamente un motivo para la cancelación y requiere un paso de confirmación explícito, advirtiendo que la acción es irreversible. [MSG10]: ¿Desea confirmar la cancelación del evento seleccionado?
3. 👤 **[Actor]** El actor ingresa el motivo de la cancelación y emite la confirmación explícita. [Bifurca a Trayectoria alternativa B]
4. ⚙️ **[Sistema]** El sistema valida que el campo del motivo no se encuentre vacío. [Bifurca a Trayectoria alternativa A]
5. ⚙️ **[Sistema]** El sistema restituye en su totalidad la disponibilidad operativa del espacio físico asignado, anulando el derecho de exclusividad sobre la fecha y hora.
6. ⚙️ **[Sistema]** El sistema anula todos los boletos expedidos (reservas) asociados al evento.
7. ⚙️ **[Sistema]** El sistema envía notificaciones oportunas por correo electrónico a los asistentes registrados, incluyendo el motivo ingresado por el organizador.
8. ⚙️ **[Sistema]** El sistema cambia el estado del evento a cancelado y registra la acción en la bitácora histórica. [MSG11]: El evento se ha cancelado exitosamente.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** El actor intenta ejecutar la cancelación dejando en blanco el campo del motivo.
- ⚙️ **[Sistema]** **A-1** El sistema detecta en la validación que no se ha ingresado el motivo obligatorio.
- ⚙️ **[Sistema]** **A-2** El sistema detiene el proceso y muestra un mensaje al usuario indicando que el motivo de cancelación es estrictamente necesario. [Mensaje 17]: "Por favor, completa todos los campos obligatorios resaltados para continuar."
- ⚙️ **[Sistema]** **A-3** El sistema mantiene el formulario de cancelación en espera de que el usuario complete el campo.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** El actor decide cancelar el proceso en la ventana de advertencia de acción irreversible.
- ⚙️ **[Sistema]** **B-1** El actor selecciona la opción de rechazar o cerrar la ventana de confirmación explícita.
- ⚙️ **[Sistema]** **B-2** El sistema aborta la operación y mantiene el evento en su estado actual (aprobado), sin liberar la sala ni notificar a nadie.

*`----- Fin de trayectoria.`*

