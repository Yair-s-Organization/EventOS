---
caso_de_uso: "CU17"
nombre: "Consultar mis eventos por asistir"
actor: "Asistente"
proyecto: "EventOS"
tags:
  - caso-de-uso
  - ads
  - eventos
---

# CU17: Consultar mis eventos por asistir

> [!NOTE] Navegación
> 🔗 **Índice de Casos de Uso:** [[00-Indice-Casos-de-Uso]] | **Extendido por:** [[CU18-Cancelar-su-asistencia]] / [[CU19-Visualizar-QR-de-acceso]] | **Catálogos UI/MSG:** [[02-Actores-y-Catalogos]]

### 📌 Resumen
Permite al Asistente consultar el listado de eventos próximos en los que cuenta con una reserva activa y acceder a las acciones disponibles para cada evento (visualizar su código QR de acceso o cancelar su asistencia).

### 📋 Ficha de Especificación

| Caso de uso | CU-17 Consultar mis eventos por asistir |
| :--- | :--- |
| **Resumen de atributos** | |
| **Autor:** | Ramos Mendoza Miguel Ángel / Jorge Eduardo Boisson Martínez |
| **Actor:** | Asistente |
| **Propósito:** | Permitir al Asistente consultar los eventos en los que cuenta con una reserva activa desde `UI08` "Consultar Mis Eventos", así como acceder a las opciones de cancelar su asistencia (`CU-18`) o visualizar el código QR de acceso correspondiente (`CU-19`). |
| **Entradas:** | • Solicitud del Asistente para consultar sus eventos por asistir.<br>• Criterios de filtrado y selección de un evento específico de la lista. |
| **Salidas:** | • Pantalla `UI08` "Consultar Mis Eventos", mostrando el listado de eventos en los que el Asistente cuenta con una reserva activa (nombre, fecha, hora en formato 24h CDMX `RNF-10`, espacio y estado de la reserva). |
| **Precondiciones:** | • El Asistente debe haber iniciado sesión en el sistema (`CU-01`). |
| **Postcondiciones:** | • Se muestra al Asistente el listado de sus eventos por asistir y las opciones disponibles para cada reserva.<br>• No se alteran registros de la base de datos (solo lectura) mientras solo consulte la información. |
| **Errores:** | • Se mostrará el `MSG-I-20` "No cuentas con eventos registrados." cuando el Asistente no tenga reservas para consultar.<br>• Se mostrará el `MSG-E-28` "No fue posible consultar tus eventos. Intenta nuevamente." o `MSG-E-08` "Error de conexión con la base de datos." cuando el sistema no pueda recuperar la información de las reservas. |
| **Tipo:** | Primario para el actor Asistente. Es extendido por los casos de uso `CU-18` "Cancelar su asistencia" y `CU-19` "Visualizar QR de acceso". |

### 🔄 Trayectorias del Caso de Uso

#### Trayectoria Principal
1. 👤 **[Actor]** Selecciona la opción "Consultar mis eventos" desde la pantalla `UI03` "Menú Principal del Asistente".
2. ⚙️ **[Sistema]** Consulta las reservas activas asociadas al Asistente en la base de datos. `[Trayectoria A]` `[Trayectoria B]`
3. ⚙️ **[Sistema]** Recupera la información de los eventos correspondientes a sus reservas.
4. ⚙️ **[Sistema]** Despliega en la pantalla `UI08` "Consultar Mis Eventos" el listado de eventos reservados con nombre del evento, fecha, hora (formato 24h CDMX `RNF-10`), espacio y estado de la reserva.
5. 👤 **[Actor]** Selecciona uno de los eventos mostrados.
6. ⚙️ **[Sistema]** Habilita y muestra las opciones disponibles para la reserva seleccionada: `"Cancelar su asistencia"` y `"Visualizar QR de acceso"`.
7. 👤 **[Actor]** Puede seleccionar una de las opciones disponibles. `[Trayectoria C]` `[Trayectoria D]`
8. ⚙️ **[Sistema]** Mantiene al Asistente en la consulta de sus eventos (`UI08`) cuando no se selecciona ninguna acción adicional.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa A: Sin eventos registrados
> **Condición:** El Asistente no cuenta con eventos registrados.
- **A-1.** ⚙️ **[Sistema]** Verifica que no existen reservas asociadas al Asistente.
- **A-2.** ⚙️ **[Sistema]** Muestra el mensaje informativo `MSG-I-20` "No cuentas con eventos registrados." en `UI08`.
- **A-3.** ⚙️ **[Sistema]** Termina el caso de uso.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa B: Error al consultar las reservas
> **Condición:** El sistema no puede recuperar la información de las reservas.
- **B-1.** ⚙️ **[Sistema]** Detecta un error al consultar las reservas del Asistente.
- **B-2.** ⚙️ **[Sistema]** Muestra el mensaje `MSG-E-28` "No fue posible consultar tus eventos. Intenta nuevamente." (o `MSG-E-08` "Error de conexión con la base de datos.").
- **B-3.** ⚙️ **[Sistema]** Termina el caso de uso.

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa C: Cancelar su asistencia
> **Condición:** El Asistente selecciona la opción "Cancelar su asistencia".
- **C-1.** 👤 **[Actor]** Selecciona la opción "Cancelar su asistencia" en `UI08`.
- **C-2.** ⚙️ **[Sistema]** Inicia el caso de uso `CU-18` "Cancelar su asistencia".

*`----- Fin de trayectoria.`*

#### Trayectoria alternativa D: Visualizar QR de acceso
> **Condición:** El Asistente selecciona la opción "Visualizar QR de acceso".
- **D-1.** 👤 **[Actor]** Selecciona la opción "Visualizar QR de acceso" en `UI08`.
- **D-2.** ⚙️ **[Sistema]** Inicia el caso de uso `CU-19` "Visualizar QR de acceso".

*`----- Fin de trayectoria.`*

