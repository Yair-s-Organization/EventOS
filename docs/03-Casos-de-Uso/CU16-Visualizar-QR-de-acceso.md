---
caso_de_uso: "CU16"
nombre: "Visualizar QR de acceso"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU16: Visualizar QR de acceso

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Reglas de Negocio:** [[01-Requerimientos-y-Reglas-de-Negocio]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]
Resumen: Permite al Asistente visualizar el código QR de su boleto digital de un evento con reserva confirmada.

### 📋 Ficha de Especificación

| Caso de uso | CU-16 Visualizar QR de acceso |
| --- | --- |
| Resumen de atributos |  |
| Autor: | Santiago Jaimes Jaramillo |
| Actor | Asistente |
| Propósito: | Permitir al Asistente visualizar el código QR de su boleto digital para presentarlo al personal de logística el día del evento. |
| Entradas: | • Se selecciona el evento desde el listado de "Consultar sus eventos". |
| Salidas: | • Se mostrará en pantalla el código QR del boleto junto con los datos del evento (nombre, fecha, hora, espacio). |
| Precondiciones: | • Que el sistema se encuentre en el punto de extensión de "Consultar sus eventos".• Que el asistente cuente con una reserva activa y confirmada para el evento seleccionado. |
| Postcondiciones: | • No se modifican registros en la base de datos, la operación es de solo lectura. |
| Errores: | • Se mostrará el MSG-07 "Evento no encontrado o cancelado." cuando el evento seleccionado haya sido cancelado después de generarse el boleto. |
| Tipo: | Secundario para el actor Asistente, viene del caso de uso CU-16 Consultar sus eventos. |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** El Asistente selecciona un evento con reserva activa desde UI08 “Consultar Sus Eventos (Reservas del Asistente)”.
2. 👤 **[Actor]** El Asistente selecciona la opción “Visualizar QR de acceso” en UI08 “Consultar Sus Eventos (Reservas del Asistente)”. [Trayectoria A]
3. ⚙️ **[Sistema]** El sistema muestra el código QR del boleto junto con los datos del evento en UI09 “Boleto Digital y Código QR”.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A:
> **Condición:** El evento fue cancelado después de haberse generado el boleto.
- ⚙️ **[Sistema]** **A-1** El sistema muestra el MSG-07 en UI08 “Consultar Sus Eventos (Reservas del Asistente)”.
- ⚙️ **[Sistema]** **A-2** El sistema regresa a UI08 “Consultar Sus Eventos (Reservas del Asistente)”.

*`----- Fin de trayectoria.`*

