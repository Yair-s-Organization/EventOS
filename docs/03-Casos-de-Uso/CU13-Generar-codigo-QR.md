---
caso_de_uso: "CU13"
nombre: "Generar código QR"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU13: Generar código QR

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Generar el código QR asociado al boleto digital del Asistente una vez confirmada su reserva, permitiendo posteriormente utilizarlo para validar su acceso al evento.
Detalles:

| Caso de uso | CU-13 Generar código QR |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Ramos Mendoza Miguel Ángel |
| Actor | Asistente |
| Propósito: | Generar el código QR único asociado a la reserva confirmada del Asistente y permitir la emisión de su boleto digital para acceder al evento. |
| Entradas: | Identificador de la reserva confirmada.<br>Datos del Asistente asociados a la reserva.<br>Datos del evento reservado. |
| Salidas: | Boleto digital con código QR.<br>Confirmación visual de que se generó el boleto. |
| Precondiciones: | El sistema se encuentra en el proceso de "Reservar lugar a un evento".<br>La reserva del Asistente ha sido confirmada exitosamente.<br>El Asistente cuenta con una reserva activa para el evento. |
| Postcondiciones: | Se genera un código QR asociado de manera única a la reserva del Asistente.<br>El boleto digital queda asociado al Asistente y al evento reservado.<br>El boleto digital queda disponible para su consulta. |
| Errores: | Cuando no es posible generar el código QR, se muestra el mensaje MSG-51 No fue posible generar el código QR. Intenta nuevamente.<br>Cuando la reserva no se encuentra confirmada, el sistema impide la generación del boleto digital. Se muestra el mensaje MSG-52 La reserva no ha sido confirmada. |
| Tipo: | Incluido para el Asistente, viene del caso de uso "Reservar lugar a un evento" con la relación `<<include>>`. |

#### Trayectoria Principal
1. ⚙️ **[Sistema]** Recibe la confirmación de la reserva realizada por el Asistente. [Trayectoria A]
2. ⚙️ **[Sistema]** Recupera los datos asociados a la reserva, al Asistente y al evento.
3. ⚙️ **[Sistema]** Genera un código QR único asociado a la reserva.
4. ⚙️ **[Sistema]** Genera el boleto digital incorporando el código QR. [Trayectoria B]
5. ⚙️ **[Sistema]** Almacena el boleto digital y la información asociada a la reserva. [Trayectoria C]
6. ⚙️ **[Sistema]** Muestra al Asistente un mensaje de confirmación indicando que su boleto digital fue generado correctamente.
7. ⚙️ **[Sistema]** Regresa al caso de uso "Reservar lugar a un evento".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** La reserva no se encuentra confirmada.
- ⚙️ **[Sistema]** **A-1** Detecta que la reserva no tiene un estado confirmado.
- ⚙️ **[Sistema]** **A-2** Muestra el mensaje MSG-51 "La reserva no ha sido confirmada."
- ⚙️ **[Sistema]** **A-3** Impide generar el código QR y el boleto digital.
- ⚙️ **[Sistema]** **A-4** Regresa al caso de uso "Reservar lugar a un evento".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B:
> **Condición:** El sistema no puede generar el código QR.
- ⚙️ **[Sistema]** **B-1** Detecta un error durante la generación del código QR.
- ⚙️ **[Sistema]** **B-2** Muestra el mensaje MSG-52 "No fue posible generar el código QR. Intenta nuevamente."
- ⚙️ **[Sistema]** **B-3** No habilita el boleto digital para el Asistente.
- ⚙️ **[Sistema]** **B-4** Regresa al caso de uso "Reservar lugar a un evento".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C:
> **Condición:** El boleto digital no puede ser almacenado correctamente.
- ⚙️ **[Sistema]** **C-1** Detecta que el boleto digital no pudo guardarse correctamente.
- ⚙️ **[Sistema]** **C-2** Muestra el mensaje MSG-52 "No fue posible generar el boleto digital. Intenta nuevamente."
- ⚙️ **[Sistema]** **C-3** No habilita la consulta o descarga del boleto digital.
- ⚙️ **[Sistema]** **C-4** Regresa al caso de uso "Reservar lugar a un evento".

*`----- Fin de trayectoria.`*

