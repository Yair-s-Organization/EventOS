---
caso_de_uso: "CU14"
nombre: "Reservar lugar a un evento"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU14: Reservar lugar a un evento

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Incluye:** [[CU15-Consultar-disponibilidad-de-lugares]] / [[CU16-Generar-codigo-QR]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
El asistente tendrá la capacidad de reservar un asiento para un evento de su interés con su respectivo pase de entrada.

### 📋 Ficha de Especificación

| Caso de uso | CU-14 Reservar lugar a un evento |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Vazquez Perez Axel Daniel |
| **Actor:** | Asistente |
| **Propósito:** | Permitir a los asistentes registrarse en un evento de su interés y obtener una entrada que le asegura un lugar en el evento. |
| **Entradas:** | • Selección del evento de interés.<br>• Selección de asientos (de ser el caso). |
| **Salidas:** | • Se muestra en pantalla el `MSG-I-16` "Operación exitosa, su reserva se ha generado correctamente."<br>• Se genera el boleto digital (`CU-16`). |
| **Precondiciones:** | • El asistente ha iniciado sesión en su cuenta.<br>• El evento al que desea ingresar aún no ha sucedido y hay cupos disponibles (`CU-15`). |
| **Postcondiciones:** | • La reserva del asistente se añade como un asistente más al evento y reduce en uno el cupo del recinto.<br>• El evento se añade a los próximos eventos del asistente. |
| **Errores:** | • `MSG-E-05`: "Evento sin lugares disponibles."<br>• `MSG-E-06`: "Evento no encontrado o cancelado."<br>• `MSG-E-20`: "Error: Ya tienes una reserva para este evento." |
| **Tipo:** | Primario |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona el botón "Reservar lugar" en la pantalla `UI05` "Detalles del Evento".
2. ⚙️ **[Sistema]** Verifica que el asistente se encuentre autenticado.
3. ⚙️ **[Sistema]** Verifica que el evento esté activo y con cupo disponible mediante el `CU-15` "Consultar disponibilidad de lugares". `[Trayectoria A]`
4. ⚙️ **[Sistema]** Muestra la pantalla `UI06` "Mapa de Asientos y Disponibilidad del Recinto" con los lugares disponibles y ocupados. `[Trayectoria B]`
5. 👤 **[Actor]** Selecciona el asiento deseado y presiona el botón "Confirmar Reserva".
6. ⚙️ **[Sistema]** Valida que el asistente no tenga una reserva previa activa para el mismo evento. `[Trayectoria C]`
7. ⚙️ **[Sistema]** Genera la reserva, descuenta un lugar en el cupo del evento y ejecuta `CU-16` "Generar código QR".
8. ⚙️ **[Sistema]** Muestra en pantalla el mensaje `MSG-I-16` "Operación exitosa, su reserva se ha generado correctamente.".
9. ⚙️ **[Sistema]** Muestra la pantalla `UI08` "Consultar Mis Eventos" (reservas del asistente).

*`----- Fin de caso de uso.`*

#### Trayectoria alternativa A: Sin cupo disponible
> **Condición:** Se activa si el evento se queda sin cupo disponible durante el proceso de reserva.
- **A-1.** ⚙️ **[Sistema]** Intenta registrar la reserva, pero el cupo llegó a cero.
- **A-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-05` "Evento sin lugares disponibles.".
- **A-3.** ⚙️ **[Sistema]** Muestra la pantalla `UI05` "Detalles del Evento" mostrando el estado "Agotado".

*`----- Fin del caso de uso.`*

#### Trayectoria alternativa B: Evento sin selección de asiento específico
> **Condición:** El evento al que se desea registrar no requiere selección de asiento.
- **B-1.** ⚙️ **[Sistema]** Detecta que el evento no cuenta con mapa de asientos.
- **B-2.** ⚙️ **[Sistema]** Muestra una ventana de confirmación general con el texto "¿Deseas confirmar tu reserva?". `[Trayectoria D]`
- **B-3.** 👤 **[Actor]** Presiona "Confirmar".
- **B-4.** ⚙️ **[Sistema]** Continúa en el paso 6 de la trayectoria principal.

*`----- Fin de la trayectoria.`*

#### Trayectoria alternativa C: Reserva previa existente
> **Condición:** El asistente ya cuenta con una reserva para el evento.
- **C-1.** ⚙️ **[Sistema]** Valida el ID del asistente con la lista de inscritos al evento y detecta un registro previo.
- **C-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-20` "Error: Ya tienes una reserva para este evento.".
- **C-3.** ⚙️ **[Sistema]** Muestra la pantalla `UI08` "Consultar Mis Eventos" (reservas del asistente).

*`----- Fin del caso de uso.`*

#### Trayectoria alternativa D: Cancelar el proceso de reserva
> **Condición:** El asistente presiona "Cancelar" en la ventana de confirmación general.
- **D-1.** 👤 **[Actor]** Cancela el proceso de reserva.
- **D-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-I-17` "Proceso interrumpido con éxito, reserva cancelada.".
- **D-3.** ⚙️ **[Sistema]** Muestra la pantalla `UI05` "Detalles del Evento".

*`----- Fin del caso de uso.`*

