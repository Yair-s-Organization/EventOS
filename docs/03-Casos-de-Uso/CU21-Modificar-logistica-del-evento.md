---
caso_de_uso: "CU21"
nombre: "Modificar logística del evento"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU21: Modificar logística del evento

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permite al Organizador reprogramar o reubicar un evento previamente creado, actualizando su fecha, horario o recinto, requiriendo obligatoriamente una justificación y notificando a los asistentes.

### 📋 Ficha de Especificación

| Caso de uso | CU21 Modificar logística del evento. |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Jorge Eduardo Boisson Martínez |
| Actor | Organizador |
| Propósito: | Actualizar la logística del evento, garantizando que los asistentes estén informados y que no existan empalmes de infraestructura y horario en la escuela. |
| Entradas: | Nueva fecha, nueva hora de inicio/fin, nuevo espacio físico. Motivo de posposición o cambio de recinto. |
| Salidas: | Ventana modal para ingreso de motivo y mensajes de confirmación visual MSG-12, MSG-13. |
| Precondiciones: | El usuario debe haber iniciado el CU23 y estar en la pantalla de consultar mis eventos. |
| Postcondiciones: | El evento actualiza sus datos logísticos. El sistema libera el espacio físico anterior y ocupar el nuevo. El estado del evento se mantiene en “Aprobado” o cambia a “Pendiente” RN31. |
| Errores: | - |
| Tipo: | Extensión de CU23 |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción “Modificar logística del evento” en la pantalla UI14 Panel Consultar Mis Eventos.
2. ⚙️ **[Sistema]** Cambia a la pantalla UI15 Panel de Administración y Detalles del Evento. Despliega el formulario con los datos logísticos actuales. Muestra las opciones de recintos filtradas por disponibilidad.
3. 👤 **[Actor]** Ingresa la nueva fecha, ajusta el recinto y/o horario y da click en el botón de guardar cambios. [Trayectoria A].
4. ⚙️ **[Sistema]** Muestra el modal exigiendo un motivo para el cambio RN25.
5. 👤 **[Actor]** Escribe la justificación y confirma la acción.
6. ⚙️ **[Sistema]** Verifica que se cumpla el tiempo de anticipación RN23, RN31, valida la disponibilidad para evitar colisiones RN10 y comprueba que la duración sea igual a la original. [Trayectoria A].
7. ⚙️ **[Sistema]** Guarda los cambios, mantiene el estado de “Aprobado”, envía un correo a los asistentes notificando la reprogramación, y muestra el MSG-12 de confirmación.

#### Trayectoria alternativa A:
> **Condición:** Extensión de la duración del evento RN31.
- ⚙️ **[Sistema]** **A-1** El sistema detecta que el nuevo bloque de horario es diferente a la duración original.
- ⚙️ **[Sistema]** **A-2** Actualiza los datos logísticos en la base de datos, pero revoca la autorización, cambiando el estado del evento a “Pendiente” para ser revisado nuevamente por la Subdirección.
- ⚙️ **[Sistema]** **A-3** Envía la notificación a los asistentes y muestra el MSG-13 de confirmación.

*`----- Fin de trayectoria.`*

