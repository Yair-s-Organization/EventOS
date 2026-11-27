---
caso_de_uso: "CU-07"
nombre: "Consultar datos de un evento (extend de CU-06)"
actor: "Subdirección de Servicios Educativos."
proyecto: "EventOS"
version: "2.1"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU-07: Consultar datos de un evento (extend de CU-06)

> [!NOTE] Navegación
> - [Índice de Casos de Uso](./00-Indice-Casos-de-Uso.md)
> - [Requerimientos y Reglas de Negocio](../01-Requerimientos-y-Reglas-de-Negocio.md)
> - [Catálogos de Pantallas y Mensajes](../02-Actores-y-Catalogos.md)

**Resumen:** Permitir al personal de Subdirección de Servicios Educativos consultar la información detallada de una solicitud de evento pendiente de aprobación, con la finalidad de evaluar sus características y determinar si debe ser aprobada o rechazada

**Descripción:**

| Atributo | Especificación |
| :--- | :--- |
| **Caso de uso** | **CU-07 Consultar datos de un evento (extend de CU-06)** |
| **Autor** | Marcial Jiménez Victor Ariel. |
| **Actor** | Subdirección de Servicios Educativos. |
| **Propósito** | Permitir al personal de Subdirección de Servicios Educativos consultar los datos de una solicitud de evento específica para su evaluación y, en caso de emitir un dictamen, aprobarla o rechazarla. |
| **Entradas** | • ID del usuario autenticado, obtenido de la sesión activa.<br>• ID de la solicitud de evento seleccionada desde la pantalla **UI11** "Panel de Solicitudes Pendientes".<br>• Decisión del actor sobre la solicitud seleccionada (aprobar o rechazar), cuando corresponda.<br>• Observaciones técnicas obligatorias cuando el dictamen sea Solicitar Cambios. |
| **Salidas** | • Pantalla **UI12** "Detalles del Evento para Evaluación", mostrando la información correspondiente a la solicitud seleccionada.<br>• Mensaje de pantalla **MSG-P-03** "¿Desea aprobar el evento?", cuando el actor solicite aprobar la solicitud.<br>• Mensaje de pantalla **MSG-P-04** "¿Desea rechazar el evento?", cuando el actor solicite rechazar la solicitud.<br>• Mensaje informativo **MSG-I-06** "La solicitud fue aprobada exitosamente.", cuando se complete la aprobación.<br>• Mensaje informativo **MSG-I-07** "La solicitud fue rechazada exitosamente.", cuando se complete el rechazo.<br>• Actualización del estado de la solicitud, cuando el actor confirme alguna de las operaciones.<br>• Notificación por correo electrónico al solicitante/Organizador informando si el evento fue aprobado, rechazado o requiere cambios, con las observaciones pertinentes.<br>• Modal de Solicitud de Cambios (subcomponente de UI12) cuando Subdirección solicite ajustes a la solicitud. |
| **Precondiciones** | • El actor debe contar con una cuenta registrada y activa dentro de la plataforma.<br>• El actor debe haber iniciado sesión correctamente mediante el CU-01 "Iniciar Sesión".<br>• El actor debe tener asignado el rol de Subdirección de Servicios Educativos.<br>• El actor debe haber seleccionado una solicitud específica desde la pantalla **UI11** "Panel de Solicitudes Pendientes", mediante el CU-06 "Consultar solicitudes de eventos".<br>• La solicitud seleccionada debe encontrarse registrada en el sistema con el estatus "Pendiente de aprobación". |
| **Postcondiciones** | • El actor visualiza la información detallada de la solicitud seleccionada.<br>• Si el actor confirma la aprobación, el estado de la solicitud cambia de "Pendiente de aprobación" a "Aprobada".<br>• Si la solicitud aprobada corresponde a una modificación logística (`CU-25`) con cambio de recinto, modalidad o reducción de `cupoMaximo` en subeventos con reservas previas, el sistema aplica la **Política de Reducción de Aforo o Cupo (Flujo FIFO)** (conservando los registros cronológicamente hasta `min(cupoMaximo, aforoActualRecinto)` y marcando el excedente como `CANCELADO_POR_SOBRECUPO` con **Correo D**) y ejecuta la **Matriz de Cambios de Recinto** únicamente cuando cambia el recinto o modalidad (`RN-31`): `CONSERVADO` con `idAsiento = null` o intacto + **Correo A**; `CANCELADO` cuando exija mapa o pasar de sin-QR a con-QR + **Correo B**; o `CANCELADO (Liberado)` al cambiar a Acceso Libre + **Correo C**.<br>• Si el actor confirma el rechazo, el estado de la solicitud cambia de "Pendiente de aprobación" a "Rechazada".<br>• Las solicitudes aprobadas quedan disponibles para su consulta en la pantalla **UI13** "Panel de Eventos Aprobados".<br>• Las solicitudes aprobadas o rechazadas dejan de aparecer en el listado de solicitudes pendientes.<br>• Si el actor decide no emitir un dictamen, la solicitud conserva su estado original.<br>• La sesión del actor permanece activa.<br>• Si se solicitan cambios, el evento conserva su identidad y pasa a "En Revisión / Cambios Solicitados" hasta que el organizador atienda las observaciones. |
| **Errores** | Se mostrará el mensaje **MSG-E-08** "Error de conexión con la base de datos.", cuando el sistema no pueda recuperar la información de la solicitud o registrar el cambio de estado debido a una falla de conexión.<br>Se mostrará el mensaje **MSG-E-33** "La solicitud seleccionada ya no se encuentra pendiente de aprobación. Actualice el listado para continuar.", cuando la solicitud haya cambiado de estado antes de que el actor complete su evaluación. |
| **Tipo** | Secundario para el actor Subdirección de Servicios Educativos. Extiende el CU-06 "Consultar solicitudes de eventos", conforme a la relación `<<extend>>` definida en el diagrama de casos de uso. |


### Trayectoria Principal

1. Selecciona una solicitud de evento específica desde la pantalla **UI11** "Panel de Solicitudes Pendientes", mediante el CU-06 "Consultar solicitudes de eventos".
2. Consulta en la base de datos la información detallada de la solicitud de evento seleccionada mediante su identificador. [Trayectoria C]
3. Verifica que la solicitud seleccionada conserve el estatus "Pendiente de aprobación". [Trayectoria D]
4. Muestra la pantalla UI12 "Detalles del Evento para Evaluación", con la información registrada (incluyendo `cupoMaximo` frente al aforo físico del recinto, *tooltips* informativos de modalidad y el indicador de Urgente / comparador de cambios cuando corresponda) y las opciones [Aprobar], [Rechazar], [Solicitar Cambios] y [Regresar].
5. Revisa la información y elige [Aprobar] para autorizar el evento. También puede [Rechazar] (Trayectoria A) o [Solicitar Cambios] (Trayectoria E).
6. Muestra el mensaje de confirmación **MSG-P-03** "¿Desea aprobar el evento?", con las opciones [Aceptar] y [Cancelar]. [Trayectoria B]
7. Confirma la aprobación de la solicitud seleccionando el botón [Aceptar]. [Trayectoria B]
8. Verifica nuevamente que la solicitud permanezca pendiente y actualiza su estado de "Pendiente de aprobación" a "Aprobada" en la base de datos. Si la aprobación corresponde a una modificación logística (`CU-25`) con cambio de recinto, modalidad o reducción de `cupoMaximo` en actividades con reservas previas, aplica primero el corte cronológico FIFO si el nuevo cupo efectivo (`min(cupoMaximo, aforoActualRecinto)`) es menor (`CANCELADO_POR_SOBRECUPO` + **Correo D** para el excedente), ejecuta las transiciones de la Matriz de Cambios de Recinto cuando cambie sede o modalidad (`CONSERVADO` con `idAsiento = null` o intacto + **Correo A**; `CANCELADO` + **Correo B**; `CANCELADO (Liberado)` + **Correo C**) y despacha en segundo plano las notificaciones por correo electrónico a los asistentes afectados. [Trayectoria C] [Trayectoria D]
9. Muestra el mensaje **MSG-I-06** "La solicitud fue aprobada exitosamente." en la pantalla **UI12** "Detalles del Evento para Evaluación".
10. Actualiza el listado de solicitudes pendientes, eliminando de la consulta la solicitud aprobada y dejándola disponible para su visualización en la pantalla **UI13** "Panel de Eventos Aprobados".

*Fin de la trayectoria.*


### Trayectoria alternativa A: Rechazar solicitud de evento

> **Condición:** Ocurre en el paso 5 de la trayectoria principal cuando el actor determina que la solicitud del evento no debe ser aprobada y selecciona la opción [Rechazar].

- **A-1.** Selecciona la opción [Rechazar] desde la pantalla **UI12** "Detalles del Evento para Evaluación".
- **A-2.** Muestra el mensaje de confirmación **MSG-P-04** "¿Desea rechazar el evento?", con las opciones [Aceptar] y [Cancelar]. [Trayectoria B]
- **A-3.** Actor: Confirma el rechazo de la solicitud seleccionando el botón [Aceptar]. [Trayectoria B]
- **A-4.** Verifica nuevamente que la solicitud permanezca pendiente y actualiza su estado de "Pendiente de aprobación" a "Rechazada" en la base de datos. [Trayectoria D] [Trayectoria E]
- **A-5.** Muestra el mensaje MSG-I-07 "La solicitud fue rechazada exitosamente." en la pantalla UI12 "Detalles del Evento para Evaluación". El sistema informa por correo electrónico al Organizador el rechazo de la solicitud.
- **A-6.** Actualiza el listado de solicitudes pendientes, eliminando de la consulta la solicitud rechazada.

*Fin de la trayectoria.*


### Trayectoria alternativa B: Cancelar operación de aprobación o rechazo

> **Condición:** Ocurre en el paso 6 o 7 de la trayectoria principal, o en los pasos A-2 y A-3 de la trayectoria alternativa A, cuando el actor decide no realizar la operación seleccionada.

- **B-1.** Selecciona la opción [Regresar] desde la pantalla **UI12** o presiona el botón [Cancelar] en el mensaje de confirmación de aprobación o rechazo.
- **B-2.** Cancela la operación solicitada sin modificar el estado de la solicitud de evento.
- **B-3.** Si el actor seleccionó [Cancelar] en el mensaje de confirmación, mantiene la pantalla **UI12** "Detalles del Evento para Evaluación". Si seleccionó [Regresar], vuelve a la pantalla **UI11** "Panel de Solicitudes Pendientes".

*Fin de la trayectoria.*


### Trayectoria alternativa C: Error de conexión con la base de datos

> **Condición:** Ocurre en los pasos 2 o 8 de la trayectoria principal, o en el paso A-4 de la trayectoria alternativa A, cuando el sistema no puede consultar o actualizar la información de la solicitud debido a una falla de conexión con la base de datos.

- **C-1.** Detecta una falla de conexión con la base de datos al intentar consultar los datos de la solicitud o registrar el cambio de estado solicitado.
- **C-2.** Muestra el mensaje **MSG-E-08** "Error de conexión con la base de datos.", notificando al actor que no fue posible completar la operación.
- **C-3.** Si el error ocurre antes de recuperar los detalles, mantiene al actor en la pantalla **UI11** "Panel de Solicitudes Pendientes". Si ocurre durante el registro del dictamen, mantiene la pantalla **UI12** "Detalles del Evento para Evaluación", sin presentar la operación como exitosa y permitiendo verificar el estado de la solicitud antes de volver a intentarlo.

*Fin de la trayectoria.*


### Trayectoria alternativa D: Solicitud no disponible para evaluación

> **Condición:** Ocurre en los pasos 3 o 8 de la trayectoria principal, o en el paso A-4 de la trayectoria alternativa A, cuando el sistema detecta que la solicitud seleccionada ya no se encuentra con el estatus "Pendiente de aprobación".

- **D-1.** Detecta que la solicitud seleccionada ha cambiado de estado y ya no puede ser aprobada o rechazada mediante la operación solicitada.
- **D-2.** Impide la modificación del estado de la solicitud para evitar que se procese nuevamente una solicitud que ya ha sido dictaminada.
- **D-3.** Muestra el mensaje **MSG-E-33** "La solicitud seleccionada ya no se encuentra pendiente de aprobación. Actualice el listado para continuar.".
- **D-4.** Actualiza el listado de solicitudes pendientes y redirige al actor a la pantalla UI11 "Panel de Solicitudes Pendientes".

*Fin de la trayectoria.*


### Trayectoria alternativa E: Solicitar cambios en una solicitud de evento

> **Condición:** En el paso 5 de la trayectoria principal, Subdirección identifica traslapes, mantenimiento del recinto o ajustes necesarios de horario, aforo u otros aspectos técnicos.

- **E-1.** Selecciona [Solicitar Cambios] desde UI12 "Detalles del Evento para Evaluación".
- **E-2.** despliega el modal de Solicitud de Cambios (subcomponente de **UI12**), con un campo obligatorio para registrar observaciones técnicas y modificaciones solicitadas.
- **E-3.** redacta las observaciones y selecciona [Enviar Observaciones]. El sistema verifica que no estén vacías.
- **E-4.** cambia el estado a "En Revisión / Cambios Solicitados" y remite al Organizador un correo con las observaciones detalladas, sin aprobar ni rechazar el evento.

*Fin de la trayectoria.*
