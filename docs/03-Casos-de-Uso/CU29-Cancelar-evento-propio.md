---
caso_de_uso: "CU-29"
nombre: "Cancelar evento propio (extend CU-24)"
actor: "Organizador"
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-29: Cancelar evento propio (extend CU-24)

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:**

Se brinda al organizador la posibilidad de cancelar un evento propio, especificando la justificación que será notificada a los asistentes mediante el apartado de notificaciones de la aplicación y por correo electrónico.

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-29 Cancelar evento propio (extend CU-24)** |
| **Actor** | Organizador |
| **Autor** | Marcial Jiménez Victor Ariel |
| **Propósito** | Permitir al organizador la cancelación de un evento particular, ingresando una justificación de cancelación para ser notificada a los asistentes. |
| **Entradas** | Se escribe desde el teclado la justificación de cancelación |
| **Salidas** | • Se mostrará en la pantalla **UI14** Panel Consultar Mis Eventos el mensaje **MSG-I-02** “El evento se ha cancelado exitosamente.”.<br>• Se envía el aviso vía panel de notificaciones a cada uno de los asistentes registrados a dicho evento.<br>• Notificación masiva por correo electrónico, con el motivo de cancelación, a todos los asistentes con reserva activa en el evento. |
| **Precondiciones** | Que exista una cuenta activa en el sistema.<br>Que el evento seleccionado haya sido previamente aprobado por Subdirección de Servicios Educativos. |
| **Postcondiciones** | El evento seleccionado cambia al estado “cancelado”.<br>• Los asistentes con reserva activa son notificados por correo electrónico sobre la cancelación y su justificación. |
| **Errores** | Cuando no sean ingresados datos en el campo Motivo o justificación de la cancelación se mostrará **MSG-E-29** "Dato requerido faltante. La justificación no puede estar vacía." o **MSG-E-14** "La descripción excede el límite máximo de caracteres permitidos." |
| **Tipo** | Secundario para el actor organizador, viene del caso de uso **CU-24** Consultar mis eventos (`<<extend>>`). |


### Trayectoria Principal

1. Selecciona la opción *Mis eventos* en la pantalla UI14 Panel Consultar Mis Eventos.
2. Selecciona el evento que desea cancelar dentro del apartado *Mis eventos* en la pantalla UI14 Panel Consultar Mis Eventos.
3. Muestra la pantalla UI15 Administración y Detalles del Evento (Único y Multi-actividad) que solicita el ingreso de la justificación de cancelación.
4. Ingresa la justificación de cancelación.
5. Muestra el MSG-P-01 ¿Desea confirmar la cancelación del evento seleccionado? en la pantalla UI15 Panel de Administración y Detalles del Evento.
6. Oprime el botón [Aceptar]. [Trayectoria A]
7. Actualiza el estado del evento de “activo” a “cancelado”.
8. Calcula el tiempo de anticipación de la cancelación. [Trayectoria B] [Trayectoria C]
9. Muestra el MSG-I-02 El evento se ha cancelado exitosamente en la pantalla UI15 Panel de Administración y Detalles del Evento.
10. Se envía el aviso de cancelación y su justificación por correo electrónico a todos los asistentes con reserva activa, además de actualizar el panel de notificaciones.

*Fin de la trayectoria.*


### Trayectoria alternativa A:

> **Condición:** *El usuario desea mantener su evento activo*

- **A-1.** Oprime el botón [Rechazar] / [Cancelar] en la pantalla UI15 Panel de Administración y Detalles del Evento.
- **A-2.** Se conserva el estado del evento en “activo”.
- **A-3.** Termina con el caso de uso.

*Fin de la trayectoria.*


### Trayectoria alternativa B:

> **Condición:** *El tiempo de anticipación de la cancelación es mayor a 1 semana*

- **B-1.** El estado de la fecha del evento asignado pasa de “ocupada” a “disponible”.
- **B-2.** El estado del espacio asignado pasa de “ocupado” a “disponible”.
- **B-3.** Se actualiza la agenda de disponibilidad.
- **B-4.** Continúa con el paso 9 de la trayectoria principal.

*Fin de la trayectoria.*


### Trayectoria alternativa C:

> **Condición:** *El tiempo de anticipación de la cancelación es menor a 1 semana*

- **C-1.** Se actualiza la agenda de disponibilidad.
- **C-2.** Continúa con el paso 9 de la trayectoria principal.

*Fin de la trayectoria.*
