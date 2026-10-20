---
caso_de_uso: "CU14"
nombre: "Consultar sus eventos"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU14: Consultar sus eventos

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permite al Asistente consultar el listado de eventos en los que cuenta con una reserva activa y acceder a las acciones disponibles para cada evento.
Detalles:

| Caso de uso | CU-14 Consultar sus eventos |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Ramos Mendoza Miguel Ángel |
| Actor | Asistente |
| Propósito: | Permitir al Asistente consultar los eventos en los que cuenta con una reserva, así como acceder a las opciones de cancelar su asistencia o visualizar el código QR de acceso correspondiente. |
| Entradas: | Solicitud del Asistente para consultar sus eventos. |
| Salidas: | Se mostrará en pantalla el listado de eventos en los que el Asistente cuenta con una reserva activa, incluyendo los datos principales del evento. |
| Precondiciones: | El Asistente debe haber iniciado sesión en el sistema.<br>El Asistente debe contar con al menos una reserva registrada para consultar sus eventos. |
| Postcondiciones: | Se muestra al Asistente el listado de sus eventos y las opciones disponibles para cada reserva.<br>El sistema mantiene sin modificaciones las reservas del Asistente mientras solo consulte la información. |
| Errores: | Se mostrará el MSG-53 "No cuentas con eventos registrados." cuando el Asistente no tenga reservas para consultar.<br>Se mostrará el MSG-54 "No fue posible consultar tus eventos. Intenta nuevamente." cuando el sistema no pueda recuperar la información de las reservas. |
| Tipo: | Principal para el actor Asistente. Es extendido por los casos de uso CU-17 "Cancelar su asistencia" y CU-18 "Visualizar QR de acceso". |

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Consultar sus eventos".
2. ⚙️ **[Sistema]** Consulta las reservas asociadas al Asistente.
3. ⚙️ **[Sistema]** Recupera la información de los eventos correspondientes a sus reservas.
4. ⚙️ **[Sistema]** Muestra el listado de eventos con información como nombre del evento, fecha, hora, espacio y estado de la reserva.
5. 👤 **[Actor]** Selecciona uno de los eventos mostrados. [Trayectoria A] [Trayectoria B]
6. ⚙️ **[Sistema]** Muestra las opciones disponibles para la reserva seleccionada, entre ellas "Cancelar su asistencia" y "Visualizar QR de acceso".
7. 👤 **[Actor]** Puede seleccionar una de las opciones disponibles. [Trayectoria C] [Trayectoria D]
8. ⚙️ **[Sistema]** Mantiene al Asistente en la consulta de sus eventos cuando no se selecciona ninguna acción adicional.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** El Asistente no cuenta con eventos registrados.
- ⚙️ **[Sistema]** **A-1** Verifica que no existen reservas asociadas al Asistente.
- ⚙️ **[Sistema]** **A-2** Muestra el MSG-53 "No cuentas con eventos registrados."
- ⚙️ **[Sistema]** **A-3** Termina el caso de uso.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** El sistema no puede recuperar la información de las reservas.
- ⚙️ **[Sistema]** **B-1** Detecta un error al consultar las reservas del Asistente.
- ⚙️ **[Sistema]** **B-2** Muestra el MSG-54 "No fue posible consultar tus eventos. Intenta nuevamente."
- ⚙️ **[Sistema]** **B-3** Termina el caso de uso.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C:
> **Condición:** El Asistente selecciona la opción "Cancelar su asistencia".
- 👤 **[Actor]** **C-1** Selecciona la opción "Cancelar su asistencia".
- ⚙️ **[Sistema]** **C-2** Inicia el caso de uso CU-17 "Cancelar su asistencia".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D:
> **Condición:** El Asistente selecciona la opción "Visualizar QR de acceso".
- 👤 **[Actor]** **D-1** Selecciona la opción "Visualizar QR de acceso".
- ⚙️ **[Sistema]** **D-2** Inicia el caso de uso CU-18 "Visualizar QR de acceso".

*`----- Fin de trayectoria.`*

