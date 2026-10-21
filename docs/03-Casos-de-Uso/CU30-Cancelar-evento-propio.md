---
caso_de_uso: "CU30"
nombre: "Cancelar evento propio"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU30: Cancelar evento propio (extend CU-25)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU25-Consultar-mis-eventos]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Se brinda al organizador la posibilidad de cancelar un evento propio, especificando la justificación que será notificada a los asistentes mediante el apartado de notificaciones de la aplicación.

### 📋 Ficha de Especificación

| Caso de uso | CU-30 Cancelar evento propio (extend CU-25) |
| :--- | :--- |
| **Resumen de atributos** | |
| **Actor:** | Organizador |
| **Autor:** | Marcial Jiménez Victor Ariel |
| **Propósito:** | Permitir al organizador la cancelación de un evento particular, ingresando una justificación de cancelación para ser notificada a los asistentes. |
| **Entradas:** | • Se escribe desde el teclado la justificación de cancelación. |
| **Salidas:** | • Se mostrará en la pantalla `UI14` "Panel de Consulta de Mis Eventos" el mensaje `MSG-I-02` "El evento se ha cancelado exitosamente."<br>• Se envía el aviso vía panel de notificaciones a cada uno de los asistentes registrados a dicho evento. |
| **Precondiciones:** | • Que exista una cuenta activa en el sistema.<br>• Que el evento seleccionado haya sido previamente aprobado por Subdirección de Servicios Educativos. |
| **Postcondiciones:** | • El evento seleccionado cambia al estado "Cancelado". |
| **Errores:** | • Cuando no sean ingresados datos en el campo Motivo o justificación de la cancelación se mostrará `MSG-E-29` "Dato requerido faltante. La justificación no puede estar vacía." (o `MSG-E-14` "La descripción excede el límite máximo de caracteres permitidos."). |
| **Tipo:** | Secundario para el actor organizador, viene del caso de uso `CU-25` "Consultar mis eventos". |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Mis eventos" en la pantalla `UI14` "Panel de Consulta de Mis Eventos".
2. 👤 **[Actor]** Selecciona el evento que desea cancelar dentro del apartado "Mis eventos" en la pantalla `UI14` "Panel de Consulta de Mis Eventos".
3. ⚙️ **[Sistema]** Muestra la pantalla `UI15` "Panel de Administración y Detalles del Evento" que solicita el ingreso de la justificación de cancelación.
4. 👤 **[Actor]** Ingresa la justificación de cancelación.
5. ⚙️ **[Sistema]** Muestra el `MSG-P-01` "¿Desea confirmar la cancelación del evento seleccionado?" en la pantalla `UI15` "Panel de Administración y Detalles del Evento".
6. 👤 **[Actor]** Oprime el botón `[Aceptar]`. `[Trayectoria A]`
7. ⚙️ **[Sistema]** Actualiza el estado del evento de "Activo" / "Aprobado" a "Cancelado".
8. ⚙️ **[Sistema]** Calcula el tiempo de anticipación de la cancelación. `[Trayectoria B]` `[Trayectoria C]`
9. ⚙️ **[Sistema]** Muestra el `MSG-I-02` "El evento se ha cancelado exitosamente." en la pantalla `UI14` / `UI15`.
10. ⚙️ **[Sistema]** Se envía el aviso vía panel de notificaciones a cada asistente del evento.

*`--- Fin del caso de uso`*

#### Trayectoria alternativa A: Mantener el evento activo
> **Condición:** El usuario desea mantener su evento activo.
- **A-1.** 👤 **[Actor]** Oprime el botón `[Rechazar]` / `[Cancelar]` en la pantalla `UI15` "Panel de Administración y Detalles del Evento".
- **A-2.** ⚙️ **[Sistema]** Se conserva el estado del evento en "Activo" / "Aprobado".
- **A-3.** ⚙️ **[Sistema]** Termina con el caso de uso.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Anticipación mayor a 1 semana
> **Condición:** El tiempo de anticipación de la cancelación es mayor a 1 semana.
- **B-1.** ⚙️ **[Sistema]** El estado de la fecha del evento asignado pasa de "ocupada" a "disponible".
- **B-2.** ⚙️ **[Sistema]** El estado del espacio asignado pasa de "ocupado" a "disponible".
- **B-3.** ⚙️ **[Sistema]** Se actualiza la agenda de disponibilidad.
- **B-4.** ⚙️ **[Sistema]** Continúa con el paso 9 de la trayectoria principal.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Anticipación menor a 1 semana
> **Condición:** El tiempo de anticipación de la cancelación es menor a 1 semana.
- **C-1.** ⚙️ **[Sistema]** Se actualiza la agenda de disponibilidad.
- **C-2.** ⚙️ **[Sistema]** Continúa con el paso 9 de la trayectoria principal.

*`----- Fin de trayectoria.`*

