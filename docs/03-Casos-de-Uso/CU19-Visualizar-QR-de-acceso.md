---
caso_de_uso: "CU19"
nombre: "Visualizar QR de acceso"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU19: Visualizar QR de acceso (extend CU-17)

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extiende a:** [[CU17-Consultar-mis-eventos-por-asistir]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permite al Asistente visualizar el código QR de su boleto digital de un evento con reserva confirmada.

### 📋 Ficha de Especificación

| Caso de uso | CU-19 Visualizar QR de acceso |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Santiago Jaimes Jaramillo |
| **Actor:** | Asistente |
| **Propósito:** | Permitir al Asistente visualizar el código QR de su boleto digital para presentarlo al personal de logística el día del evento. |
| **Entradas:** | • Se selecciona el evento desde el listado de "Consultar sus eventos". |
| **Salidas:** | • Se mostrará en pantalla el código QR del boleto junto con los datos del evento (nombre, fecha, hora, espacio) en `UI09` "Boleto Digital y Código QR". |
| **Precondiciones:** | • Que el sistema se encuentre en el punto de extensión de "Consultar sus eventos" (`CU-17`).<br>• Que el asistente cuente con una reserva activa y confirmada para el evento seleccionado. |
| **Postcondiciones:** | • No se modifican registros en la base de datos, la operación es de solo lectura. |
| **Errores:** | • Se mostrará el `MSG-E-06` "Evento no encontrado o cancelado." cuando el evento seleccionado haya sido cancelado después de generarse el boleto. |
| **Tipo:** | Secundario para el actor Asistente, viene del caso de uso `CU-17` "Consultar mis eventos por asistir". |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona un evento con reserva activa desde `UI08` "Consultar Mis Eventos" (Reservas del Asistente).
2. 👤 **[Actor]** Selecciona la opción "Visualizar QR de acceso" en `UI08` "Consultar Mis Eventos". `[Trayectoria A]`
3. ⚙️ **[Sistema]** Muestra el código QR del boleto junto con los datos del evento en `UI09` "Boleto Digital y Código QR".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Evento cancelado posteriormente
> **Condición:** El evento fue cancelado después de haberse generado el boleto.
- **A-1.** ⚙️ **[Sistema]** Muestra el `MSG-E-06` "Evento no encontrado o cancelado." en `UI08` "Consultar Mis Eventos".
- **A-2.** ⚙️ **[Sistema]** Regresa a `UI08` "Consultar Mis Eventos".

*`----- Fin de trayectoria.`*

