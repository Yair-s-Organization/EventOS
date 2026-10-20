---
caso_de_uso: "CU25"
nombre: "Cancelar evento propio"
actor: "Organizador"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU25: Cancelar evento propio

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Se brinda al organizador la posibilidad de cancelar un evento propio, especificando la justificación que será notificada a los asistentes vía correo electrónico.
Descripción

| Caso de uso | CU-25 Cancelar evento propio |
| --- | --- |
| Resumen de atributos |  |
| Actor | Organizador |
| Autor | Marcial Jiménez Victor Ariel |
| Propósito: | Permitir al organizador la cancelación de un evento particular, ingresando una justificación de cancelación para ser notificada a los asistentes. |
| Entradas: | Se escribe desde el teclado la justificación de cancelación |
| Salidas: | Se mostrará en la pantalla UI15 Panel Consultar Mis Eventos el mensaje MSG 13 El evento fue cancelado exitosamente.<br>Se envía el mensaje EMAIL-X Correo de notificación de cancelación vía correo electrónico a cada uno de los asistentes registrados a dicho evento. |
| Precondiciones: | Que exista una cuenta activa en el sistema.<br>Que el evento seleccionado haya sido previamente aprobado por Subdirección de Servicios Académicos. |
| Postcondiciones: | El evento seleccionado cambia al estado “cancelado”. |
| Errores: | Cuando no sean ingresados datos en el campo Motivo o justificación de la cancelación se mostrará MSG-E 02 Error: el campo justificación no debe estar vacío. |
| Tipo: | Secundario para el actor organizador, viene del caso de uso CU23 Consultar mis eventos. |

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción Mis eventos en la pantalla UIXX Menú principal organizador*
2. 👤 **[Actor]** Selecciona el evento que desea cancelar dentro del apartado Mis eventos en la pantalla UI15 Panel Consultar Mis Eventos.
3. ⚙️ **[Sistema]** Muestra la pantalla UIXX Panel de justificación que solicita el ingreso de la justificación de cancelación.
4. 👤 **[Actor]** Ingresa la justificación de cancelación.
5. ⚙️ **[Sistema]** Muestra el MSG 12 ¿Desea confirmar la cancelación del evento seleccionado? en la pantalla UI15 Panel Consultar Mis Eventos.
6. 👤 **[Actor]** Oprime el botón [Aceptar] [Trayectoria A]
7. ⚙️ **[Sistema]** Actualiza el estado del evento de “activo” a “cancelado”.
8. ⚙️ **[Sistema]** Calcula el tiempo de anticipación de la cancelación. [Trayectoria B] [Trayectoria C]
9. ⚙️ **[Sistema]** Muestra el MSG 13 El evento fue cancelado exitosamente en la pantalla UI15 Panel Consultar Mis Eventos
10. ⚙️ **[Sistema]** Se envía el mensaje EMAIL-X Correo de notificación de cancelación vía correo electrónico a cada uno de los asistentes registrados a dicho evento.

*`--- Fin del caso de uso`*

#### Trayectoria alternativa A
> **Condición:** El usuario desea mantener su evento activo
- 👤 **[Actor]** **A-1** Oprime el botón [rechazar] en la pantalla UIXX Panel de justificación.
- ⚙️ **[Sistema]** **A-2** Se conserva el estado del evento a “activo”.
- ⚙️ **[Sistema]** **A-3** Termina con el caso de uso.

#### Trayectoria alternativa B
> **Condición:** El tiempo de anticipación de la cancelación es mayor a 1 semana
- ⚙️ **[Sistema]** **A-1** El estado de la fecha del evento asignado pasa de “ocupada” a “disponible”.
- ⚙️ **[Sistema]** **A-1** El estado del espacio asignado pasa de “ocupado” a “disponible”.
- ⚙️ **[Sistema]** **A-3** Se actualiza la agenda de disponibilidad.
- ⚙️ **[Sistema]** **A-4** Continua con el paso 8 de la trayectoria principal.

*`--- Fin de la trayectoria`*

#### Trayectoria alternativa C
> **Condición:** El tiempo de anticipación de la cancelación es menor a 1 semana
- ⚙️ **[Sistema]** **A-1** Se actualiza la agenda de disponibilidad
- ⚙️ **[Sistema]** **A-2** Continua con el paso 8 de la trayectoria principal.

*`--- Fin de la trayectoria`*

