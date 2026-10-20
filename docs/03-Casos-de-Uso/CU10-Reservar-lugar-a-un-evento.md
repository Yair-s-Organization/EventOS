---
caso_de_uso: "CU10"
nombre: "Reservar lugar a un evento"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU10: Reservar lugar a un evento

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: El asistente tendrá la capacidad de reservar un asiento para un evento de su interés con su respectivo pase de entrada.

### 📋 Ficha de Especificación

| Caso de uso | CU-10 Reservar lugar a un evento |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Vazquez Perez Axel Daniel |
| Actor | Asistente |
| Propósito: | Permitir a los asistentes registrarse en un evento de su interés y obtener una entrada que le asegura un lugar en el evento. |
| Entradas: | Selección del evento de interés.<br>Selección de asientos (de ser el caso). |
| Salidas: | Se muestra en pantalla el MSG-20 Operación exitosa, su reserva se ha generado correctamente.<br>Se genera el pase de entrada y se envía por correo. |
| Precondiciones: | El asistente ha iniciado sesión en su cuenta.<br>El evento al que desea ingresar aún no ha sucedido y hay cupos disponibles. |
| Postcondiciones: | La reserva del asistente se añade como un asistente más al evento y reduce en uno el cupo del recinto.<br>El evento se añade a los próximos eventos del asistente. |
| Errores: | MSG-E-05 Evento sin lugares disponibles.<br>MSG-E-06 Evento no encontrado o cancelado.<br>MSG-E-20 Error: Ya tienes una reserva para este evento. |
| Tipo: | Primario |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción “Reservar lugar” en la pantalla UI05 Detalles del evento.
2. ⚙️ **[Sistema]** Verifica que el asistente se encuentre autenticado.
3. ⚙️ **[Sistema]** Verifica que el evento esté activo y con cupo disponible. [Trayectoria A]
4. ⚙️ **[Sistema]** Muestra la pantalla UI06 Mapa de asientos y Disponibilidad del recinto con los lugares disponibles y ocupados. [Trayectoria B]
5. 👤 **[Actor]** Selecciona el asiento deseado y presiona el botón “Confirmar Reserva”.
6. ⚙️ **[Sistema]** Valida que el asistente no tenga una reserva previa activa para el mismo evento. [Trayectoria C]
7. ⚙️ **[Sistema]** Genera la reserva y descuenta un lugar en el cupo del evento.
8. ⚙️ **[Sistema]** Muestra en pantalla el mensaje MSG-20 Operación exitosa, su reserva se ha generado correctamente.
9. ⚙️ **[Sistema]** Muestra la pantalla UI08 Consultar sus eventos (reservas del asistente).

*`----- Fin de caso de uso.`*

#### Trayectoria alternativa A:
> **Condición:** Se activa si el evento se queda sin cupo disponible durante el proceso de reserva.
- ⚙️ **[Sistema]** **A-1** Intenta registrar la reserva, pero el cupo llegó a cero.
- ⚙️ **[Sistema]** **A-2** Muestra el mensaje MSG-E-05 Evento sin lugares disponibles.
- ⚙️ **[Sistema]** **A-3** Muestra la pantalla UI05 Detalles del evento mostrando el estado “Agotado.”

*`----- Fin del caso de uso.`*

#### Trayectoria alternativa B:
> **Condición:** El evento al que se desea registrar no requiere selección de asiento.
- ⚙️ **[Sistema]** **B-1** Detecta que el evento no cuenta con mapa de asientos.
- ⚙️ **[Sistema]** **B-2** Muestra una ventana de confirmación general con el texto ¿Deseas confirmar tu reserva? [Trayectoria D]
- 👤 **[Actor]** **B-3** Presiona “Confirmar”.
- ⚙️ **[Sistema]** **B-4** Continúa en el paso 6 de la trayectoria principal

*`----- Fin de la trayectoria.`*

#### Trayectoria alternativa C:
> **Condición:** El asistente ya cuenta con una reserva para el evento.
- ⚙️ **[Sistema]** **C-1** Valida el ID del asistente con la lista de inscritos al evento y detecta un registro previo.
- ⚙️ **[Sistema]** **C-2** Muestra el mensaje MSG-E-20 Error: Ya tienes una reserva para este evento.
- ⚙️ **[Sistema]** **C-3** Muestra la pantalla UI08 Consultar sus eventos (reservas del asistente).

*`----- Fin del caso de uso.`*

#### Trayectoria alternativa D:
> **Condición:** El asistente presiona “Cancelar” en la ventana de confirmación general.
- 👤 **[Actor]** **D-1** Cancela el proceso de reserva.
- ⚙️ **[Sistema]** **D-2** Muestra el mensaje MSG-21 Proceso interrumpido con éxito, reserva cancelada.
- ⚙️ **[Sistema]** **D-3** Muestra la pantalla UI05 Detalles del evento.

*`----- Fin del caso de uso.`*

