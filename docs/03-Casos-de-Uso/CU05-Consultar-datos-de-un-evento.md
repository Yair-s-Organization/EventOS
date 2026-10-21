---
caso_de_uso: "CU05"
nombre: "Consultar datos de un evento"
actor: "Subdirección de Servicios Educativos"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU05: Consultar datos de un evento (extend de CU-04)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU04-Consultar-solicitudes-de-eventos]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permitir al personal de Subdirección de Servicios Educativos consultar la información detallada de una solicitud de evento pendiente de aprobación, con la finalidad de evaluar sus características y determinar si debe ser aprobada o rechazada.

### 📋 Ficha de Especificación

| Caso de uso | CU-05 Consultar datos de un evento (extend de CU-04) |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Marcial Jiménez Victor Ariel. |
| **Actor:** | Subdirección de Servicios Educativos. |
| **Propósito:** | Permitir al personal de Subdirección de Servicios Educativos consultar los datos de una solicitud de evento específica para su evaluación y, en caso de emitir un dictamen, aprobarla o rechazarla. |
| **Entradas:** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• ID de la solicitud de evento seleccionada desde la pantalla `UI11` "Panel de Solicitudes Pendientes".<br>• Decisión del actor sobre la solicitud seleccionada (aprobar o rechazar), cuando corresponda. |
| **Salidas:** | • Pantalla `UI12` "Detalles del Evento para Evaluación", mostrando la información correspondiente a la solicitud seleccionada.<br>• Mensaje de pantalla `MSG-P-03` "¿Desea aprobar el evento?", cuando el actor solicite aprobar la solicitud.<br>• Mensaje de pantalla `MSG-P-04` "¿Desea rechazar el evento?", cuando el actor solicite rechazar la solicitud.<br>• Mensaje informativo `MSG-I-06` "La solicitud fue aprobada exitosamente.", cuando se complete la aprobación.<br>• Mensaje informativo `MSG-I-07` "La solicitud fue rechazada exitosamente.", cuando se complete el rechazo.<br>• Actualización del estado de la solicitud, cuando el actor confirme alguna de las operaciones. |
| **Precondiciones:** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el `CU-01` "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Subdirección de Servicios Educativos.<br>• El actor debe haber seleccionado una solicitud específica desde la pantalla `UI11` "Panel de Solicitudes Pendientes", mediante el `CU-04` "Consultar solicitudes de eventos".<br>• La solicitud seleccionada debe encontrarse registrada en el sistema con el estatus "Pendiente de aprobación". |
| **Postcondiciones:** | • El actor visualiza la información detallada de la solicitud seleccionada.<br>• Si el actor confirma la aprobación, el estado de la solicitud cambia de "Pendiente de aprobación" a "Aprobada".<br>• Si el actor confirma el rechazo, el estado de la solicitud cambia de "Pendiente de aprobación" a "Rechazada".<br>• Las solicitudes aprobadas quedan disponibles para su consulta en la pantalla `UI13` "Panel de Eventos Aprobados".<br>• Las solicitudes aprobadas o rechazadas dejan de aparecer en el listado de solicitudes pendientes.<br>• Si el actor decide no emitir un dictamen, la solicitud conserva su estado original.<br>• La sesión del actor permanece activa. |
| **Errores:** | • Se mostrará el mensaje `MSG-E-08` "Error de conexión con la base de datos.", cuando el sistema no pueda recuperar la información de la solicitud o registrar el cambio de estado debido a una falla de conexión.<br>• Se mostrará el mensaje `MSG-E-33` "La solicitud seleccionada ya no se encuentra pendiente de aprobación. Actualice el listado para continuar.", cuando la solicitud haya cambiado de estado antes de que el actor complete su evaluación. |
| **Tipo:** | Secundario para el actor Subdirección de Servicios Educativos. Extiende el `CU-04` "Consultar solicitudes de eventos", conforme a la relación `<<extend>>` definida en el diagrama de casos de uso. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona una solicitud de evento específica desde la pantalla `UI11` "Panel de Solicitudes Pendientes", mediante el `CU-04` "Consultar solicitudes de eventos".
2. ⚙️ **[Sistema]** Consulta en la base de datos la información detallada de la solicitud de evento seleccionada mediante su identificador. `[Trayectoria C]`
3. ⚙️ **[Sistema]** Verifica que la solicitud seleccionada conserve el estatus "Pendiente de aprobación". `[Trayectoria D]`
4. ⚙️ **[Sistema]** Muestra la pantalla `UI12` "Detalles del Evento para Evaluación", presentando la información registrada de la solicitud y las opciones `[Aprobar]`, `[Rechazar]` y `[Regresar]`.
5. 👤 **[Actor]** Revisa la información de la solicitud y selecciona la opción `[Aprobar]` para autorizar la realización del evento. `[Trayectoria A]` `[Trayectoria B]`
6. ⚙️ **[Sistema]** Muestra el mensaje de confirmación `MSG-P-03` "¿Desea aprobar el evento?", con las opciones `[Aceptar]` y `[Cancelar]`. `[Trayectoria B]`
7. 👤 **[Actor]** Confirma la aprobación de la solicitud seleccionando el botón `[Aceptar]`. `[Trayectoria B]`
8. ⚙️ **[Sistema]** Verifica nuevamente que la solicitud permanezca pendiente y actualiza su estado de "Pendiente de aprobación" a "Aprobada" en la base de datos. `[Trayectoria C]` `[Trayectoria D]`
9. ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-06` "La solicitud fue aprobada exitosamente." en la pantalla `UI12` "Detalles del Evento para Evaluación".
10. ⚙️ **[Sistema]** Actualiza el listado de solicitudes pendientes, eliminando de la consulta la solicitud aprobada y dejándola disponible para su visualización en la pantalla `UI13` "Panel de Eventos Aprobados".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Rechazar solicitud de evento
> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor determina que la solicitud del evento no debe ser aprobada y selecciona la opción `[Rechazar]`.
- **A-1.** 👤 **[Actor]** Selecciona la opción `[Rechazar]` desde la pantalla `UI12` "Detalles del Evento para Evaluación".
- **A-2.** ⚙️ **[Sistema]** Muestra el mensaje de confirmación `MSG-P-04` "¿Desea rechazar el evento?", con las opciones `[Aceptar]` y `[Cancelar]`. `[Trayectoria B]`
- **A-3.** 👤 **[Actor]** Confirma el rechazo de la solicitud seleccionando el botón `[Aceptar]`. `[Trayectoria B]`
- **A-4.** ⚙️ **[Sistema]** Verifica nuevamente que la solicitud permanezca pendiente y actualiza su estado de "Pendiente de aprobación" a "Rechazada" en la base de datos. `[Trayectoria C]` `[Trayectoria D]`
- **A-5.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-07` "La solicitud fue rechazada exitosamente." en la pantalla `UI12` "Detalles del Evento para Evaluación".
- **A-6.** ⚙️ **[Sistema]** Actualiza el listado de solicitudes pendientes, eliminando de la consulta la solicitud rechazada.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Cancelar operación de aprobación o rechazo
> **Condición:** Ocurre en el paso 6 o 7 de la trayectoria principal, o en los pasos A-2 y A-3 de la trayectoria alternativa A, cuando el actor decide no realizar la operación seleccionada.
- **B-1.** 👤 **[Actor]** Selecciona la opción `[Regresar]` desde la pantalla `UI12` o presiona el botón `[Cancelar]` en el mensaje de confirmación de aprobación o rechazo.
- **B-2.** ⚙️ **[Sistema]** Cancela la operación solicitada sin modificar el estado de la solicitud de evento.
- **B-3.** ⚙️ **[Sistema]** Si el actor seleccionó `[Cancelar]` en el mensaje de confirmación, mantiene la pantalla `UI12` "Detalles del Evento para Evaluación". Si seleccionó `[Regresar]`, vuelve a la pantalla `UI11` "Panel de Solicitudes Pendientes".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Error de conexión con la base de datos
> **Condición:** Ocurre en los pasos 2 u 8 de la trayectoria principal, o en el paso A-4 de la trayectoria alternativa A, cuando el sistema no puede consultar o actualizar la información de la solicitud debido a una falla de conexión con la base de datos.
- **C-1.** ⚙️ **[Sistema]** Detecta una falla de conexión con la base de datos al intentar consultar los datos de la solicitud o registrar el cambio de estado solicitado.
- **C-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-08` "Error de conexión con la base de datos.", notificando al actor que no fue posible completar la operación.
- **C-3.** ⚙️ **[Sistema]** Si el error ocurre antes de recuperar los detalles, mantiene al actor en la pantalla `UI11` "Panel de Solicitudes Pendientes". Si ocurre durante el registro del dictamen, mantiene la pantalla `UI12` "Detalles del Evento para Evaluación", sin presentar la operación como exitosa y permitiendo verificar el estado de la solicitud antes de volver a intentarlo.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Solicitud no disponible para evaluación
> **Condición:** Ocurre en los pasos 3 u 8 de la trayectoria principal, o en el paso A-4 de la trayectoria alternativa A, cuando el sistema detecta que la solicitud seleccionada ya no se encuentra con el estatus "Pendiente de aprobación".
- **D-1.** ⚙️ **[Sistema]** Detecta que la solicitud seleccionada ha cambiado de estado y ya no puede ser aprobada o rechazada mediante la operación solicitada.
- **D-2.** ⚙️ **[Sistema]** Impide la modificación del estado de la solicitud para evitar que se procese nuevamente una solicitud que ya ha sido dictaminada.
- **D-3.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-33` "La solicitud seleccionada ya no se encuentra pendiente de aprobación. Actualice el listado para continuar.".
- **D-4.** ⚙️ **[Sistema]** Actualiza el listado de solicitudes pendientes y redirige al actor a la pantalla `UI11` "Panel de Solicitudes Pendientes".

*`----- Fin de trayectoria.`*

